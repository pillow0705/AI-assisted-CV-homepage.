import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "app.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS honors (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      issuer      TEXT NOT NULL,
      year        TEXT NOT NULL,
      description TEXT,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT NOT NULL,
      description TEXT NOT NULL,
      url         TEXT,
      tech_stack  TEXT,
      order_index INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cv_sections (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      section_type TEXT NOT NULL,
      content_json TEXT NOT NULL,
      order_index  INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id            TEXT PRIMARY KEY,
      session_id    TEXT NOT NULL,
      messages_json TEXT NOT NULL DEFAULT '[]',
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at);
  `);
}

export function getConfig(key: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT value FROM config WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setConfig(key: string, value: string): void {
  getDb()
    .prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)")
    .run(key, value);
}

export function getAllConfig(): Record<string, string> {
  const rows = getDb().prepare("SELECT key, value FROM config").all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function isSetupComplete(): boolean {
  return getConfig("setup_complete") === "true";
}
