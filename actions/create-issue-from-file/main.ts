import util from "util";
import * as fs from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const inputs = {
      token: core.getInput('token'),
      repository: core.getInput('repository'),
      title: core.getInput('title'),
      contentFilepath: core.getInput('content-filepath'),
    }

    const [owner, repo] = inputs.repository.split('/');
    core.setOutput(owner, repo);

    const octokit = github.getOctokit(inputs.token);
    console.log(`Path: ${inputs.contentFilepath}`)

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
      throw new Error(`File ${inputs.contentFilepath} does not exist`);
    }
  } catch (err) {
    throw err;
  }
}

run();
