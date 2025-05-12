import Database from 'better-sqlite3';

const db = new Database('meme_db.sqlite');

db.exec(`
    CREATE TABLE IF NOT EXISTS memes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileName TEXT NOT NULL,
        fileHash TEXT UNIQUE NOT NULL,
        imageDescription TEXT,
        imageText TEXT,
        audioTranscribed TEXT,
        imagePath TEXT NOT NULL,
        format TEXT NOT NULL
    )
`);

export function insertMeme(memeData) {
    const stmt = db.prepare(`
        INSERT INTO memes (fileName, fileHash, imageDescription, imageText, audioTranscribed, imagePath, format)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    // Ensure all values are of supported types
    const safeValues = [
        String(memeData.fileName || ''),
        String(memeData.fileHash || ''),
        String(memeData.imageDescription || ''),
        String(memeData.imageText || ''),
        memeData.audioTranscribed ? String(memeData.audioTranscribed) : null,
        String(memeData.imagePath || ''),
        String(memeData.format || '')
    ];

    try {
        return stmt.run(...safeValues);
    } catch (error) {
        console.error('Error inserting meme:', error);
        console.error('Attempted values:', safeValues);
        throw error;
    }
}

export function getMemeByHash(fileHash) {
    const stmt = db.prepare('SELECT * FROM memes WHERE fileHash = ?');
    return stmt.get(fileHash);
}

export function checkMemeExists(fileHash) {
    const stmt = db.prepare('SELECT 1 FROM memes WHERE fileHash = ?');
    return !!stmt.get(fileHash);
}

export { db };
