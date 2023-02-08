import os from "os";

/**
 * Selects {namePrefix}-{OS}-{ARCH}.tar.gz based on platform and architecture of runner
 *
 * @param namePrefix of tar.gz
 * @return \{namePrefix}-{OS}-{ARCH}.tar.gz
 */
export function chooseTarGz(namePrefix: string): string {
    const platform = os.platform();
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
    const arch = os.arch();
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