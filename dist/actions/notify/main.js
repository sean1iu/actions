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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = __importStar(require("fs"));
const util = __importStar(require("util"));
const util_1 = require("util");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputs = {
                token: core.getInput('token'),
                rerpository: core.getInput('repository'),
                issueNumber: Number(core.getInput('issue-number')),
                title: core.getInput('title'),
                contentFilepath: core.getInput('content-filepath'),
                labels: getInputAsArray('labels'),
                assignees: getInputAsArray('assignees'),
            };
            core.debug(`Inputs: ${(0, util_1.inspect)(inputs)}`);
            const [owner, repo] = inputs.rerpository.split('/');
            core.debug(`Repo: ${(0, util_1.inspect)(repo)}`);
            const octokit = github.getOctokit(inputs.token);
            if (yield util.promisify(fs.exists)(inputs.contentFilepath)) {
                const fileContent = yield fs.promises.readFile(inputs.contentFilepath, 'utf8');
                core.debug(`File content: ${(0, util_1.inspect)(fileContent)}`);
                const issueNumber = yield (() => __awaiter(this, void 0, void 0, function* () {
                    if (inputs.issueNumber) {
                        yield octokit.rest.issues.update({
                            owner: owner,
                            repo: repo,
                            issue_number: inputs.issueNumber,
                            title: inputs.title,
                            body: fileContent,
                        });
                        core.info(`Updated issue #${inputs.issueNumber}`);
                        return inputs.issueNumber;
                    }
                    else {
                        const { data: issue } = yield octokit.rest.issues.create({
                            owner: owner,
                            repo: repo,
                            title: inputs.title,
                            body: fileContent,
                        });
                        core.info(`Created issue #${issue.number}`);
                        return issue.number;
                    }
                }))();
                if (inputs.labels.length > 0) {
                    core.info(`Applying assignees '${inputs.assignees}'`);
                    yield octokit.rest.issues.addLabels({
                        owner: owner,
                        repo: repo,
                        issue_number: issueNumber,
                        labels: inputs.labels,
                    });
                    core.setOutput('issue-number', issueNumber);
                }
                else {
                    core.info(`File not found: ${inputs.contentFilepath}`);
                }
            }
        }
        catch (error) {
            core.debug((0, util_1.inspect)(error));
            core.setFailed(getErrorMessage(error));
        }
    });
}
function getInputAsArray(name, options) {
    return getStringAsArray(core.getInput(name, options));
}
function getStringAsArray(str) {
    return str
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(x => x !== '');
}
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
run();
