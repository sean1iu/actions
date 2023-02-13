import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import * as util from 'util';
import { inspect } from 'util';

async function run(): Promise<void> {
  try {
    const inputs = {
      token: core.getInput('token'),
      rerpository: core.getInput('repository'),
      issueNumber: Number(core.getInput('issue-number')),
      title: core.getInput('title'),
      contentFilepath: core.getInput('content-filepath'),
      labels: getInputAsArray('labels'),
      assignees: getInputAsArray('assignees'),
    }
    core.debug(`Inputs: ${inspect(inputs)}`);

    const [owner, repo] = inputs.rerpository.split('/');
    core.debug(`Repo: ${inspect(repo)}`);

    const octokit = github.getOctokit(inputs.token);

    if (await util.promisify(fs.exists)(inputs.contentFilepath)) {
      const fileContent = await fs.promises.readFile(inputs.contentFilepath, 'utf8');
      core.debug(`File content: ${inspect(fileContent)}`);

      const issueNumber = await (async (): Promise<number> => {
        if (inputs.issueNumber) {
          await octokit.rest.issues.update({
            owner: owner,
            repo: repo,
            issue_number: inputs.issueNumber,
            title: inputs.title,
            body: fileContent,
        })
        core.info(`Updated issue #${inputs.issueNumber}`);
        return inputs.issueNumber;
        } else {
          const {data: issue} = await octokit.rest.issues.create({
            owner: owner,
            repo: repo,
            title: inputs.title,
            body: fileContent,
          })
          core.info(`Created issue #${issue.number}`);
          return issue.number;
        }
      })();

      if (inputs.labels.length > 0) {
        core.info(`Applying assignees '${inputs.assignees}'`)
        await octokit.rest.issues.addLabels({
          owner: owner,
          repo: repo,
          issue_number: issueNumber,
          labels: inputs.labels,
        })
        core.setOutput('issue-number', issueNumber)
      } else {
        core.info(`File not found: ${inputs.contentFilepath}`)
      }
    }
  } catch (error) {
    core.debug(inspect(error))
    core.setFailed(getErrorMessage(error));
  }
}

function getInputAsArray(name: string, options?: core.InputOptions): string[] {
  return getStringAsArray(core.getInput(name, options));
}

function getStringAsArray(str: string): string[] {
  return str
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(x => x !== '');
}
              
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

run();