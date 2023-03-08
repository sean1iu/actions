import util from "util";
import * as fs from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const inputs = {
      token: core.getInput('token'),
      title: core.getInput('title'),
      contentFilepath: core.getInput('content-filepath'),
    }
    const repository = `${github.context.repo.owner}/${github.context.repo.repo}`
    const [owner, repo] = repository.split('/');
    core.setOutput(owner, repo);

    const octokit = github.getOctokit(inputs.token);

    if (await util.promisify(fs.exists)(inputs.contentFilepath)) {
      const fileContent = await fs.promises.readFile(inputs.contentFilepath, 'utf8');

      const { data: { number } } = await octokit.rest.issues.create({
        owner,
        repo,
        title: inputs.title,
        body: fileContent,
      });

      core.setOutput('issue-created', number.toString());
    } else {
      core.info(`File ${inputs.contentFilepath} does not exist, skipping issue creation.`)
    }
  } catch (err) {
    throw err;
  }
}

run().then(() => core.info(`Completed`));
