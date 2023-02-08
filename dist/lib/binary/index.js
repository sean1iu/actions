"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseTarGz = void 0;
const os_1 = __importDefault(require("os"));
/**
 * Selects {namePrefix}-{OS}-{ARCH}.tar.gz based on platform and architecture of runner
 *
 * @param namePrefix of tar.gz
 * @return \{namePrefix}-{OS}-{ARCH}.tar.gz
 */
function chooseTarGz(namePrefix) {
    const platform = os_1.default.platform();
    switch (platform) {
        case "darwin":
        case "linux":
            namePrefix += `-${platform}`;
            break;
        case "win32":
            namePrefix += "-windows";
            break;
        default:
            throw new Error(`Unsupported platform (${platform})`);
    }
    const arch = os_1.default.arch();
    switch (arch) {
        case "arm":
        case "arm64":
            namePrefix += `-${arch}`;
            break;
        case "x64":
            namePrefix += "-amd64";
            break;
        case "ia32":
            namePrefix += "-386";
            break;
        default:
            throw new Error(`Unsupported architecture (${arch})`);
    }
    return `${namePrefix}.tar.gz`;
}
exports.chooseTarGz = chooseTarGz;
