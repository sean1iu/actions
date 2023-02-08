import { isFeatureAvailable, restoreCache, saveCache } from "@actions/cache";
import * as core from "@actions/core";
import { extract7z, extractTar, extractXar, extractZip } from "@actions/tool-cache";
import { Octokit } from "@octokit/rest";
import { GetResponseTypeFromEndpointMethod } from "@octokit/types";
import os from "os";
import path from "path";

import { downloadTool } from "./download";

/**
 * Extension supported by getLatestAsset
 */
export enum Extension {
    tar = "tar",
    tarGz = "tar.gz",
    zip = "zip",
    xar = "xar",
    _7z = "7z"
}

/**
 * Parameters to filter assets from release
 */
export interface AssetFilter {
    // token for GitHub api
    token: string;
    // name of the asset to download, must have extension .tar, .tar.gz, .zip, .xar or .7z
    assetName: string;
    // name of binary inside the asset
    binary: string;
    // extension of asset, will be derived from name
    extension?: Extension;
    // GitHub owner, default xivart
    owner?: string;
    // name of repository without owner/ prefix
    repo: string;
    // should the tool be cached, if true will use tag_name to cache the tool
    cache?: boolean;
}

/**
 * Get the latest asset from GitHub release, uses @actions/cache to improve performance
 *
 * **It is expected the binary in asset is at root of the archive.**
 *
 * @param filter parameters to filter assets from release
 * @returns binary path extracted from asset
 */
export async function getLatestAsset(filter: AssetFilter): Promise<string> {
    const {
        assetName,
        binary,
        cache,
        extension = filter.assetName.split(".").filter(Boolean).slice(1).join(".") as Extension,
        owner = "xivart",
        repo,
        token
    } = filter;
    const octokit = new Octokit({ auth: token });
    type getLatestReleaseResponse = GetResponseTypeFromEndpointMethod<typeof octokit.repos.getLatestRelease>;
    const { status, data }: getLatestReleaseResponse = await octokit.repos.getLatestRelease({ owner, repo });
    if (status !== 200) {
        throw new Error(`unexpected status from api.github.com: ${status}`);
    }
    const { assets, tag_name, name, created_at } = data;
    core.info(`Latest release: "${name}", created at: ${created_at}, on tag: ${tag_name}`);
    const asset = assets.find(asset => asset.name == assetName);
    if (!asset) {
        throw new Error(`couldn't find archive in assets: ${assetName}`);
    }
    const cacheKey = `${binary}-${os.platform()}-${os.arch()}-${tag_name.replace(/^v/, "")}`;
    const destination = path.resolve(".", cacheKey);
    if (cache && isFeatureAvailable()) {
        const hit = await restoreCache([destination], cacheKey);
        // TODO: implement signature check
        if (hit) {
            core.info(`found cached version with key ${hit}`);
            core.addPath(destination);
            return `${destination}/${binary}`;
        }
        core.info("no matching version found in cache");
    }
    core.info(`fetching ${asset.url}`);
    await downloadTool(asset.url, token, asset.name);
    core.info(`extracting ${asset.name}`);
    switch (extension) {
        case Extension.tar:
        case Extension.tarGz:
            await extractTar(asset.name, destination);
            break;
        case Extension.zip:
            await extractZip(asset.name, destination);
            break;
        case Extension.xar:
            await extractXar(asset.name, destination);
            break;
        case Extension._7z:
            await extract7z(asset.name, destination);
            break;
        default:
            throw new Error(`unexpected file extension .${extension}`);
    }
    const cacheId = await saveCache([destination], cacheKey);
    core.info(`cache: ${cacheId} created with key ${cacheKey}`);
    core.addPath(destination);
    return `${destination}/${binary}`;
}