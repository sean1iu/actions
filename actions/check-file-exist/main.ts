import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
  try {
    const inputs = {
      // token: core.getInput('token'),
      owner: core.getInput("owner"),
      repo: core.getInput("repo"),
      path: core.getInput("path"),
    }
    checkFileExists("actions", "toolkit", "README.md").then((result) => {
      console.log(result);
      if (result) {
        console.log("File exists");
      } else {
        console.log("File does not exist");
      }
    })
  } catch (err) {
    throw err;
  }
}

async function checkFileExists(owner: string, repo: string, path: string): Promise<boolean> {
  try {
    const octokit = github.getOctokit("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");

    const result = await octokit.rest.repos.getContent({
      owner,
      repo,
      path
    });
    return result.status === 200;
  } catch (err) {
    return false;
  }
}

run()
