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
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.getRepo = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const binary_1 = require("../../lib/binary");
const github_1 = require("../../lib/github");
const inputs = {
    ghToken: "gh-token",
    repo: "repo",
    assetName: "asset-name",
    binary: "binary"
};
const getRepo = (inputRepoString, context) => {
    if (inputRepoString === "") {
        return { owner: context.repo.owner, repo: context.repo.repo };
    }
    else {
        const [owner, repo] = inputRepoString.split("/");
        if (typeof owner === "undefined" || typeof repo === "undefined")
            throw new Error("Malformed repo");
        return { owner, repo };
    }
};
exports.getRepo = getRepo;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput(inputs.ghToken, { required: true });
            const assetName = core.getInput(inputs.assetName, { required: false });
            const binary = core.getInput(inputs.binary, { required: false });
            const { owner, repo } = (0, exports.getRepo)(core.getInput(inputs.repo, { required: false }), github.context);
            core.startGroup("Fetch latest binary");
            const assetNameToUse = assetName === "" ? (0, binary_1.chooseTarGz)(repo) : assetName;
            const binaryPath = yield (0, github_1.getLatestAsset)({
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
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
exports.main = main;
main().then(() => core.info(``));
exports.default = main;
