import concat from "concat-stream";
import * as crypto from "crypto";
import { Base64Encode } from "base64-stream";
import { pipeline } from 'stream/promises';

async function streamToBase64(readableStream) {
    let base64String = '';
    const base64Stream = new Base64Encode();

    base64Stream.on('data', (chunk) => {
        base64String += chunk.toString();
    });

    await pipeline(readableStream, base64Stream);

    return base64String;
}

async function calculateHashFromStream(stream, algorithm = "sha256") {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithm);
        stream.on("error", reject);
        hash.on("error", reject).setEncoding("hex");

        stream.pipe(hash);

        let hashValue = "";
        hash.on("data", (chunk) => (hashValue += chunk));
        hash.on("end", () => resolve(hashValue));
    });
}

export { streamToBase64, calculateHashFromStream }