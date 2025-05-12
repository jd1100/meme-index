import { updateJobStatus, checkIfAJobIsRunning } from "../lib/job_db.js"
async function gracefulShutdown(signal, jobId) {
    console.log(`${signal} received`);
    try {
        if (await checkIfAJobIsRunning(jobId)) {
            await updateJobStatus("paused", "paused", jobId);
            console.log('Job marked as paused successfully.');
        }
    } catch (error) {
        console.error('Error marking job as failed:', error);
    } finally {
        process.exit();
    }
}

export { gracefulShutdown }
