import * as sqliteVec from "sqlite-vec";
import sqlite from "better-sqlite3";

export const auth_db = sqlite("auth.db");
// export const vec_db = sqlite("../db/vec.db")

auth_db.exec(`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    github_id INTEGER UNIQUE,
    username TEXT NOT NULL
)`);

auth_db.exec(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);