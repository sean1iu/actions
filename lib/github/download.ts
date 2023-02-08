import fs from "fs";
import got from "got";
import stream from "stream";
import util from "util";

export async function downloadTool(url: string, token: string, dest: string): Promise<void> {
    const pipeline = util.promisify(stream.pipeline);
    await pipeline(
        got.stream(url, {
            method: "GET",
            headers: {
                "User-Agent": `Actions on ${process.env.GITHUB_REPOSITORY}`,
                Accept: "application/octet-stream",
                Authorization: `Bearer ${token}`
            }
        }),
        fs.createWriteStream(dest)
    );
}