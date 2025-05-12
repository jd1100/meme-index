import { spawn } from "child_process";

async function extractAudioFromVideo(memeObject, jobId, localMemeDirectory) {
    return new Promise((resolve, reject) => {
        const newAudioFileName = memeObject.originalFileName.split(".")[0] + ".wav";
        console.log(newAudioFileName);
        console.log("Transcribing video");
        // Prepare the command and arguments for spawning the ffmpeg process
        const ffmpegArgs = [
            "-i",
            `${localMemeDirectory}/${memeObject.originalFileName}`, // Input file path
            "-f",
            "wav", // Format to WAV
            "-ar",
            "16000", // Sample rate set to 16 kHz
            "-ac",
            "1", // Set audio channels to mono
            "-acodec",
            "pcm_s16le", // Audio codec to PCM signed 16-bit little-endian
            `${localMemeDirectory}/${newAudioFileName}`, // Output file path
        ];

        try {
            // Spawn the ffmpeg process
            const ffmpegProcess = spawn("ffmpeg", ffmpegArgs);

            ffmpegProcess.on("close", (code) => {
                if (code === 0) {
                    resolve(newAudioFileName);
                }
            });

            ffmpegProcess.stderr.on("data", (data) => {
                console.error(`ffmpeg stderr: ${data.toString()}`);
            });
        } catch (e) {
            console.log("likely no audio stream present")
            console.log(e)
        } finally {
            resolve(newAudioFileName)
        }
    });
}

export { extractAudioFromVideo }