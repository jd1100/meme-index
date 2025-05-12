import { checkIfAJobIsRunning, getJobProgress } from "../../lib/job_db.js";

export async function GET({ params, request }) {
  const runningJobId = await checkIfAJobIsRunning();
  const jobInProgress = !!runningJobId;
  let progress = 0;
  let totalFiles = 0;

  if (jobInProgress) {
    const jobDetails = await getJobProgress(runningJobId);
    progress = jobDetails.currentUploadedMemeCount;
    totalFiles = jobDetails.totalMemeCount;
  }

  return new Response(JSON.stringify({
    jobInProgress,
    progress,
    totalFiles
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}