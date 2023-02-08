"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestAsset = exports.Extension = void 0;
const cache_1 = require("@actions/cache");
const core = __importStar(require("@actions/core"));
const tool_cache_1 = require("@actions/tool-cache");
const rest_1 = require("@octokit/rest");
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const download_1 = require("./download");
/**
 * Extension supported by getLatestAsset
 */
var Extension;
(function (Extension) {
    Extension["tar"] = "tar";
    Extension["tarGz"] = "tar.gz";
    Extension["zip"] = "zip";
    Extension["xar"] = "xar";
    Extension["_7z"] = "7z";
})(Extension = exports.Extension || (exports.Extension = {}));
/**
 * Get the latest asset from GitHub release, uses @actions/cache to improve performance
 *
 * **It is expected the binary in asset is at root of the archive.**
 *
 * @param filter parameters to filter assets from release
 * @returns binary path extracted from asset
 */
function getLatestAsset(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        const { assetName, binary, cache, extension = filter.assetName.split(".").filter(Boolean).slice(1).join("."), owner = "xivart", repo, token } = filter;
        const octokit = new rest_1.Octokit({ auth: token });
        const { status, data } = yield octokit.repos.getLatestRelease({ owner, repo });
        if (status !== 200) {
            throw new Error(`unexpected status from api.github.com: ${status}`);
        }
        const { assets, tag_name, name, created_at } = data;
        core.info(`Latest release: "${name}", created at: ${created_at}, on tag: ${tag_name}`);
        const asset = assets.find(asset => asset.name == assetName);
        if (!asset) {
            throw new Error(`couldn't find archive in assets: ${assetName}`);
        }
        const cacheKey = `${binary}-${os_1.default.platform()}-${os_1.default.arch()}-${tag_name.replace(/^v/, "")}`;
        const destination = path_1.default.resolve(".", cacheKey);
        if (cache && (0, cache_1.isFeatureAvailable)()) {
            const hit = yield (0, cache_1.restoreCache)([destination], cacheKey);
            // TODO: implement signature check
            if (hit) {
                core.info(`found cached version with key ${hit}`);
                core.addPath(destination);
                return `${destination}/${binary}`;
            }
            core.info("no matching version found in cache");
        }
        core.info(`fetching ${asset.url}`);
        yield (0, download_1.downloadTool)(asset.url, token, asset.name);
        core.info(`extracting ${asset.name}`);
        switch (extension) {
            case Extension.tar:
            case Extension.tarGz:
                yield (0, tool_cache_1.extractTar)(asset.name, destination);
                break;
            case Extension.zip:
                yield (0, tool_cache_1.extractZip)(asset.name, destination);
                break;
            case Extension.xar:
                yield (0, tool_cache_1.extractXar)(asset.name, destination);
                break;
            case Extension._7z:
                yield (0, tool_cache_1.extract7z)(asset.name, destination);
                break;
            default:
                throw new Error(`unexpected file extension .${extension}`);
        }
        const cacheId = yield (0, cache_1.saveCache)([destination], cacheKey);
        core.info(`cache: ${cacheId} created with key ${cacheKey}`);
        core.addPath(destination);
        return `${destination}/${binary}`;
    });
}
exports.getLatestAsset = getLatestAsset;
