import { processLocalFiles } from './modules/processLocalFiles.mjs';
import dotenv from 'dotenv';
import { createJobForLocalProcessing } from './lib/job_db.js';

// Load environment variables
dotenv.config();

// Start the background task to process local files
if (process.env.LOCAL_MEME_DIRECTORY) {
    console.log('Starting background task to process local files...');
    const jobId = createJobForLocalProcessing();
    processLocalFiles(jobId).catch(console.error);
}
