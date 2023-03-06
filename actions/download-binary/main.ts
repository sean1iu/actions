import * as core from "@actions/core";
import * as github from "@actions/github";
import type { Context } from "@actions/github/lib/context";

import { chooseTarGz } from "../../lib/binary";
import { getLatestAsset } from "../../lib/github";

const inputs = {
    ghToken: "gh-token",
    repo: "repo",
    assetName: "asset-name",
    binary: "binary"
};

interface GetRepoResult {
    readonly owner: string;
    readonly repo: string;
}
export const getRepo = (inputRepoString: string, context: Context): GetRepoResult => {
    if (inputRepoString === "") {
        return { owner: context.repo.owner, repo: context.repo.repo };
    } else {
        const [owner, repo] = inputRepoString.split("/");
        if (typeof owner === "undefined" || typeof repo === "undefined") throw new Error("Malformed repo");
        return { owner, repo };
    }
};

export async function main() {
    try {
        const token = core.getInput(inputs.ghToken, { required: false });
        const assetName = core.getInput(inputs.assetName, { required: false });
        const binary = core.getInput(inputs.binary, { required: false });
        const { owner, repo } = getRepo(core.getInput(inputs.repo, { required: false }), github.context);

        core.startGroup("Fetch latest binary");
        const assetNameToUse = assetName === "" ? chooseTarGz(repo) : assetName;
        const binaryPath = await getLatestAsset({
            token,
            assetName: assetNameToUse,
            binary: binary === "" ? repo : binary,
            owner: owner,
            repo: repo,
            cache: true
        });
        core.endGroup();
        core.info(`Fetched: ${binaryPath}`);
        core.setOutput("binaryPath", binaryPath);
    } catch (error: unknown) {
        core.setFailed((error as Error).message);
    }
}

main().then(() => core.info(``));
export default main;