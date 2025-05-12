import { spawn } from "child_process";

async function convertWebpToPng(memeObject, jobId, localMemeDirectory) {
    return new Promise((resolve, reject) => {
        console.log("Converting webp to png");
        const newFileName = memeObject.fileName.split(".")[0] + ".png";
        // Ensure memeObject.fileStream is a readable stream of the WEBP image
        const ffmpegProcess = spawn("ffmpeg", [
            "-nostdin",
            "-i",
            `${localMemeDirectory}/${memeObject.originalFileName}`, // Input from stdin
            "-vcodec",
            "png", // Output codec to PNG
            `${localMemeDirectory}/${newFileName}`, // Use pipe:1 to output to stdout
        ]);

        ffmpegProcess.on("close", (code) => {
            if (code === 0) {
                console.log("Conversion from webp to png successful!");
                resolve(newFileName);
            } else {
                console.log("Error converting webp to png");
                // reject(new Error("Error converting webp to png"));
                resolve(newFileName)
            }
        });
        ffmpegProcess.stderr.on("data", (data) => {
            console.error(`ffmpeg data: ${data.toString()}`);
        });
        ffmpegProcess.stderr.on("error", (data) => {
            console.error(`ffmpeg stderr: ${data.toString()}`);
            resolve(newFileName)
        });
    });
}

export { convertWebpToPng }