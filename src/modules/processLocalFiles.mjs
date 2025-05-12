import fs from 'fs/promises';
import path from 'path';
import { processFile } from './processFiles.mjs';

async function processLocalFiles(jobId, localMemeDirectory) {
    
    
    const localDirectory = localMemeDirectory;
    if (!localDirectory) {
        console.error('LOCAL_MEME_DIRECTORY not set in .env file');
        return;
    }

    try {
        const files = await fs.readdir(localDirectory);
        const user_email = 'local_import@example.com';

        for (let i = 0; i < files.length; i++) {
            const fileName = files[i];
            const filePath = path.join(localDirectory, fileName);
            const stats = await fs.stat(filePath);
            if (fileName.startsWith("\.")) {
                continue
            }
            if (stats.isFile()) {
                // const fileBuffer = await fs.readFile(filePath);
                const file = {
                    name: fileName,
                    type: path.extname(fileName).slice(1), // Remove the dot from the extension
                    stream: () => new ReadableStream({
                        start(controller) {
                            controller.enqueue(fileBuffer);
                            controller.close();
                        }
                    })
                };

                await processFile(file, i, files.length, jobId, user_email);
                console.log(`Processed local file: ${fileName}`);
            }
        }

        console.clog('Finished processing all local files');
    } catch (error) {
        console.error('Error processing local files:', error);
    }
}

export { processLocalFiles };
