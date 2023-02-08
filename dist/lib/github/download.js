"use strict";
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
exports.downloadTool = void 0;
const fs_1 = __importDefault(require("fs"));
const got_1 = __importDefault(require("got"));
const stream_1 = __importDefault(require("stream"));
const util_1 = __importDefault(require("util"));
function downloadTool(url, token, dest) {
    return __awaiter(this, void 0, void 0, function* () {
        const pipeline = util_1.default.promisify(stream_1.default.pipeline);
        yield pipeline(got_1.default.stream(url, {
            method: "GET",
            headers: {
                "User-Agent": `Actions on ${process.env.GITHUB_REPOSITORY}`,
                Accept: "application/octet-stream",
                Authorization: `Bearer ${token}`
            }
        }), fs_1.default.createWriteStream(dest));
    });
}
exports.downloadTool = downloadTool;
