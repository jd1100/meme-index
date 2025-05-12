import { spawn } from "child_process";

async function takeScreenshotFromVideo(memeObject, jobId, localMemeDirectory) {
    return new Promise(async (resolve, reject) => {
        const newFileName = memeObject.fileName.split(".")[0] + ".png";
        // const fileStream = bufferToStream(memeObject.buffer);
        const timestamp = "00:00:01";
        console.log(timestamp);
        const ffmpegProcess = spawn("ffmpeg", [
            "-ss",
            timestamp,
            "-i",
            `${localMemeDirectory}/${memeObject.originalFileName}`, // Input from stdin (pipe)
            "-frames:v",
            "1", // Capture just one frame
            `${localMemeDirectory}/${newFileName}`, // Output to stdout (pipe)
        ]);

        ffmpegProcess.on("close", (code) => {
            if (code === 0) {
                // const outputBuffer = Buffer.concat(dataChunks);
                // fs.writeFileSync(`./uploads/${jobId}/${newFileName}`, outputBuffer)
                // memeObject.base64Data = base64Image;
                // const memeFileBase64 = streamToBase64(writeStream);
                resolve(newFileName);
            } else {
                reject(
                    new Error(
                        `ffmpeg process exited with code ${code}`,
                    ),
                );
            }
        });
    });
}

export { takeScreenshotFromVideo }