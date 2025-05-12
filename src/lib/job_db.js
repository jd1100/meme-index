import Database from 'better-sqlite3';
import { v4 as uuidv4 } from "uuid";

const db = new Database('job_db.sqlite');

db.exec(`
    CREATE TABLE IF NOT EXISTS memeJobs (
        jobID TEXT PRIMARY KEY,
        STATUS TEXT,
        message TEXT,
        currentUploadedMemeCount INTEGER,
        totalMemeCount INTEGER,
        user TEXT
    )
`);

export function getJobProgress(jobId) {
    const stmt = db.prepare('SELECT * FROM memeJobs WHERE jobID = ?');
    return stmt.get(jobId);
}

export function updateJobStatus(status, message, jobId) {
    const stmt = db.prepare('UPDATE memeJobs SET STATUS = ?, message = ? WHERE jobID = ?');
    console.log("status: ", status, "message: ", message, "for: ", jobId)
    stmt.run(status, message, jobId);
}

export function updateJobCurrentUploadedMemeCount(jobId, newCount, totalCount) {
    const stmt = db.prepare('UPDATE memeJobs SET currentUploadedMemeCount = ?, totalMemeCount = ? WHERE jobID = ?');
    console.log("newCount: ", newCount, "totalCount: ", totalCount, "for: ", jobId)
    stmt.run(newCount, totalCount, jobId);
}

export function uploadJobToDB(jobObjectToDB) {
    const stmt = db.prepare(`
        INSERT INTO memeJobs (jobID, STATUS, message, currentUploadedMemeCount, totalMemeCount, user)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
        jobObjectToDB.jobID,
        jobObjectToDB.status,
        jobObjectToDB.message,
        jobObjectToDB.currentUploadedMemeCount,
        jobObjectToDB.totalMemeCount,
        jobObjectToDB.user
    );
}

export function checkIfAJobIsRunning() {
    const stmt = db.prepare('SELECT jobID FROM memeJobs WHERE STATUS = \'in-progress\' LIMIT 1');
    const job = stmt.get();
    console.log(job)
    return job ? job.jobID : false;
}

export function checkIfAJobIsPaused() {
    const stmt = db.prepare('SELECT jobID FROM memeJobs WHERE STATUS = \'paused\' LIMIT 1');
    const job = stmt.get();
    console.log(job)
    return job ? job.jobID : false;
}

export function checkIfAJobIsCanceled(jobId) {
    const stmt = db.prepare('SELECT STATUS FROM memeJobs WHERE jobID = ?');
    const job = stmt.get(jobId);
    return job && job.STATUS === 'canceled';
}

export function createJobForLocalProcessing() {
    let jobId = checkIfAJobIsPaused()
    if (!jobId) {
        jobId = checkIfAJobIsRunning()
    }
    if (!jobId) {
        jobId = uuidv4()
        const stmt = db.prepare(`
            INSERT INTO memeJobs (jobID, STATUS, message, currentUploadedMemeCount, totalMemeCount, user)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(jobId, 'in-progress', 'Processing local files', 0, 0, 'system');
    }
    return jobId;
}

export function getJobProgress(jobId) {
    const stmt = db.prepare('SELECT * FROM memeJobs WHERE jobId = ? LIMIT 1');
    return stmt.get(jobId);
}
