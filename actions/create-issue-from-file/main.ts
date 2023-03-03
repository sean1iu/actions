import util from "util";
import * as fs from 'fs';
import * as core from '@actions/core';
import * as github from '@actions/github';

async function run(): Promise<void> {
  try {
    const inputs = {
      // token: core.getInput('token'),
      token: "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",
      // repository: core.getInput('repository'),
      repository: "sean1iu/test-flow",
      // title: core.getInput('title'),
      title: "test",
      // contentFilepath: core.getInput('content-filepath'),
      contentFilepath: "README.md",
    }

    const [owner, repo] = inputs.repository.split('/');
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
      throw new Error(`File not found: ${inputs.contentFilepath}`);
    }
  } catch (err) {
    throw err;
  }
}

run();
