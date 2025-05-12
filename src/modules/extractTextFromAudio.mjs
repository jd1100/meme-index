import { spawn } from "child_process";
import * as fs from "node:fs"

async function extractTextFromAudio(memeObject, jobId, localMemeDirectory) {
    return new Promise((resolve, reject) => {
        const newAudioFileName = memeObject.originalFileName.split(".")[0] + ".wav";
        const transcriptionFileName =
            memeObject.originalFileName.split(".")[0] + ".txt";
        const transcriptionFileNameWithoutExtension =
            memeObject.originalFileName.split(".")[0];
        // Prepare the command and arguments for spawning the Whisper process
        // if (!newAudioFileName) {
        //     reject()
        // }
        console.log(newAudioFileName);
        const whisperArgs = [
            "-m",
            "./whisper.cpp/models/ggml-tiny.en.bin",
            // "-t",
            // "8",
            "-f",
            `${localMemeDirectory}/${newAudioFileName}`,
            "-otxt",
            "-nt",
            "-of",
            `${localMemeDirectory}/${transcriptionFileNameWithoutExtension}`,
            "--language",
            "en",
        ];
        try {
            const whisperProcess = spawn("./whisper.cpp/main", whisperArgs);
            // whisperProcess.setMaxListeners(30);
            whisperProcess.on("close", (code) => {
                if (code === 0) {
                    console.log("Transcription completed successfully");
                    try {
                        console.log("transcription file name: ", transcriptionFileName)
                        resolve(transcriptionFileName);
                    } catch (e) {
                        console.log(e)
                        console.log("likely no file exists for some reason")
                    }
                }
            });
    
            whisperProcess.stderr.on("data", (data) => {
                console.error(`Whisper stderr: ${data.toString()}`);   
                
            });
    
            whisperProcess.on("error", (error) => {
                console.log(error)
                resolve(transcriptionFileName);
            });

        } catch (e) {
            console.log("likely no audio stream to transcribe")
            console.log(e)
        }
    });
}

export { extractTextFromAudio }