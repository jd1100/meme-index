import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import * as fs from "node:fs"
import path from 'path';

import { uploadMemeToS3Bucket } from "./uploadMemeToS3Bucket.mjs";
import { analyzeMemeWithReplicate } from "./analyzeMemeWithReplicate.mjs";
import { streamToBase64, calculateHashFromStream } from "./utils.mjs"
import { uploadMemeToTypesense } from "./uploadMemeToTypesense.mjs"
import { convertWebpToPng } from "./convertWebpToPng.mjs"
import { extractTextFromAudio } from "./extractTextFromAudio.mjs";
import { takeScreenshotFromVideo } from "./takeScreenshotFromVideo.mjs"
import { extractAudioFromVideo } from "./extractAudioFromVideo.mjs"
import { gracefulShutdown } from "./gracefulShutdown.mjs";
import { analyzeMemeWithOllama } from "./analyzeMemeWithOllama.mjs"
import { CreateTypesenseMemeCollection } from "./createTypesenseMemeCollection.mjs"
// import { analyzeMemeWithVLLM } from "./analyzeMemeWithVLLM.mjs"
import { updateJobStatus, updateJobCurrentUploadedMemeCount } from "../lib/job_db"
import { insertMeme, checkMemeExists } from "../lib/meme_db.js"
let runMode = import.meta.env.RUN_MODE;
const localMemeDirectory = import.meta.env.LOCAL_MEME_DIRECTORY

// Set maxListeners to 100
process.setMaxListeners(30);

async function processFile(file, index, numOfFiles, jobId, user_email) {
    console.log(jobId)
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM', jobId));
    process.on('SIGINT', () => gracefulShutdown('SIGINT', jobId));

    console.log(index, numOfFiles);
    if (!fs.existsSync("./uploads")) {
        fs.mkdirSync("./uploads");
    }
    if (!fs.existsSync(`./uploads/${jobId}`)) {
        fs.mkdirSync(`./uploads/${jobId}`);
    }

    const originalFileName = file.name;
    const fileStream = Readable.fromWeb(file.stream());
    const fileHash = await calculateHashFromStream(fileStream);
    const fileName = uuidv4();
    const base64Data = await streamToBase64(file.stream());
    const mimeType = file.type;
    let fileExtension

    if (/\//.test(mimeType)) {
        fileExtension = mimeType.split("/")[1]
    } else {
        fileExtension = mimeType
    }
    const memeFileObject = {
        originalFileName: originalFileName,
        fileHash: fileHash,
        fileName: fileName + "." + fileExtension,
        base64Data: base64Data,
        mimeType: mimeType,
        fileObject: file,
        fileStream: fileStream,
    };

    let format = "";
    let imageAudioTranscribed;

    console.log(fileExtension)
    // console.log(memeFileObject)
    console.log(`file extension ${fileExtension}`);
    console.log("original file name: ", memeFileObject.originalFileName)


    // Check if meme already exists
    const isMemeDuplicate = checkMemeExists(memeFileObject.fileHash);
    // console.log(isMemeDuplicate)

    if (!isMemeDuplicate) {
        await updateJobStatus("in-progress", "in-progress", jobId)
        await updateJobCurrentUploadedMemeCount(jobId, index, numOfFiles)

        if (/gif|mp4|webm|mkv|mov/.test(fileExtension)) {
            console.log("file is video");

            try {
                const screenshotFileName = await takeScreenshotFromVideo(
                    memeFileObject,
                    jobId,
                    localMemeDirectory
                );
                memeFileObject.base64Data = Buffer.from(
                    fs.readFileSync(`${localMemeDirectory}/${screenshotFileName}`),
                ).toString("base64");
                fs.rmSync(`${localMemeDirectory}/${screenshotFileName}`);
            } catch (e) {
                console.log(e)
            }

            // extract + transcribe audio
            const audioFileName = await extractAudioFromVideo(memeFileObject, jobId, localMemeDirectory);
            const transcriptionFileName = await extractTextFromAudio(memeFileObject, jobId, localMemeDirectory);

            console.log(transcriptionFileName)
            if (transcriptionFileName) {
                try {
                    imageAudioTranscribed = fs
                        .readFileSync(`${localMemeDirectory}/${transcriptionFileName}`)
                        .toString("utf-8");

                    fs.rmSync(`${localMemeDirectory}/${transcriptionFileName}`);
                    fs.rmSync(`${localMemeDirectory}/${audioFileName}`);
                } catch (e) {
                    console.log(e)
                }
            }

            format = "video";
        } else if (/jpeg|png|webp|jpg/.test(fileExtension)) {
            format = "image";
        } else {
            const errorMessage = `unknown image format: ${fileExtension}`
            // console.log(memeFileObject)
            await updateJobStatus("error", errorMessage, jobId)
            throw new Error(errorMessage)
        }

        if (fileExtension === "webp") {
            try {
                const convertedImageFileName = await convertWebpToPng(
                    memeFileObject,
                    jobId,
                    localMemeDirectory
                );
                memeFileObject.base64Data = Buffer.from(
                    fs.readFileSync(`${localMemeDirectory}/${convertedImageFileName}`),
                ).toString("base64");
                fs.rmSync(`${localMemeDirectory}/${convertedImageFileName}`);
            } catch (e) {
                console.log("error with webp to png conversion", e)
            }
        }
        const prompt =
            "process this meme";

        let memeUrl;
        if (localMemeDirectory) {
            // For local files, use the absolute path as the URL
            memeUrl = path.resolve(localMemeDirectory, originalFileName);
        } else {
            memeUrl = await uploadMemeToS3Bucket(memeFileObject);
        }

        console.log(memeUrl);
        console.log(user_email)
        let imgDescription
        try {
            if (runMode === "replicate") {
                imgDescription = await analyzeMemeWithReplicate(prompt, memeFileObject.base64Data)
            } else if (runMode === "ollama") {
                imgDescription = await analyzeMemeWithOllama(prompt, memeFileObject.base64Data)
            } else {
                console.error("Invalid RUN_MODE. Please set it to 'replicate', 'ollama', or 'vllm'.")
                throw new Error("Invalid RUN_MODE")
            }
        } catch (e) {
            console.log(e)
            return
        }
        console.log(imgDescription)
        console.log("image audio transcribed", imageAudioTranscribed)
        const memeObjectAnalyzed = {
            user: user_email,
            fileName: memeFileObject.originalFileName,
            imageDescription: imgDescription,
            imagePath: memeUrl,
            imageAudioTranscribed: imageAudioTranscribed,
        };

        // console.log(memeObjectAnalyzed);

        // upload meme object analyzed to typesense
        const indexUploadResults = await uploadMemeToTypesense(memeObjectAnalyzed)
        console.log(memeObjectAnalyzed)
        // console.log(indexUploadResults)
        // Insert meme into SQLite database
        const memeObjectToDB = {
            fileName: memeObjectAnalyzed.fileName,
            fileHash: memeFileObject.fileHash,
            imageDescription: memeObjectAnalyzed.imageDescription,
            imageText: "", // You might want to extract this from the image if needed
            audioTranscribed: memeObjectAnalyzed.imageAudioTranscribed,
            imagePath: memeObjectAnalyzed.imagePath,
            format: format,
        };
        let insertResult
        try {
            insertResult = insertMeme(memeObjectToDB);
        } catch (e) {
            console.log(e)
        }
        console.log("Meme inserted into database:", insertResult);
    } else {
        console.log("Meme already exists in the database. Skipping processing.");
    }

    // check if last file
    if (index === numOfFiles - 1) {
        // This is the last file
        console.log("This is the last file:", file);
        fs.rm(
            `./uploads/${jobId}`,
            { recursive: true, force: true },
            (rmOutput) => {
                console.log(`file removed ${rmOutput}`);
            },
        );
        // Perform your operation for the last file here
    }
}

export { processFile }
