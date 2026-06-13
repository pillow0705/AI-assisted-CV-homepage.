// Example seed script: populate the SQLite DB without the web /setup wizard.
//
// Usage:
//   1. cp seed.example.mjs seed.mjs
//   2. Fill in your own details below (and set a strong ADMIN_PASSWORD).
//   3. node seed.mjs
//
// This writes directly to data/app.db and marks setup_complete=true, so the
// site skips the setup wizard. The AI API key is left as a placeholder — set
// the real key later from the /admin panel so it never lives in source control.
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Set a strong password here (or via env) before running.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "app.db");
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT);
  CREATE TABLE IF NOT EXISTS honors (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, issuer TEXT NOT NULL, year TEXT NOT NULL, description TEXT, order_index INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, url TEXT, tech_stack TEXT, order_index INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS cv_sections (id INTEGER PRIMARY KEY AUTOINCREMENT, section_type TEXT NOT NULL, content_json TEXT NOT NULL, order_index INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, messages_json TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
`);

const about = `I am a ... (your bio here). Use **markdown** for emphasis.

Describe your interests across a couple of short paragraphs.`;

// Notes shown ONLY to the AI assistant — never rendered publicly.
const privateNotes = `[Private context for the AI assistant only — do not display publicly.]

- Availability, preferred roles, contact preferences, etc.
- Anything you want the assistant to know but not show on the page.`;

// Stored as newline-separated lines (app/page.tsx splits on "\n").
const suggested = [
  "What is your research focus?",
  "What projects are you most proud of?",
  "How can I collaborate with you?",
].join("\n");

const cfg = [
  ["name", "Your Name"],
  ["title", "Your headline / role"],
  ["tagline", "A short one-line tagline"],
  ["about", about],
  ["email", "you@example.com"],
  ["github", "https://github.com/your-handle"],
  ["linkedin", ""],
  ["twitter", ""],
  ["website", ""],
  ["location", "City, Country"],
  ["institution", "Your University / Company"],
  ["avatar_url", "/uploads/avatar.jpg"],
  ["cv_filename", "Your_CV.pdf"],
  ["ai_provider", "anthropic"], // "anthropic" | "openai" | "deepseek"
  ["ai_model", "claude-sonnet-4-6"],
  ["ai_api_key", "PLACEHOLDER_SET_IN_ADMIN"], // set the real key from /admin
  ["ai_private_notes", privateNotes],
  ["suggested_questions", suggested],
  ["admin_password_hash", bcrypt.hashSync(ADMIN_PASSWORD, 12)],
  ["setup_complete", "true"],
];

const setMany = db.transaction((entries) => {
  const stmt = db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)");
  for (const [k, v] of entries) stmt.run(k, v);
});
setMany(cfg);

// ---- Honors ----  [title, issuer, year, description]
const honors = [
  ["Some Award", "Issuer", "2025", "Short description."],
];
db.prepare("DELETE FROM honors").run();
{
  const ins = db.prepare("INSERT INTO honors (title, issuer, year, description, order_index) VALUES (?,?,?,?,?)");
  honors.forEach((h, i) => ins.run(h[0], h[1], h[2], h[3], i));
}

// ---- Projects ----  [title, description, url, tech_stack]
const projects = [
  ["Project Name", "What it does, in one or two sentences.", "https://github.com/your-handle/repo", "Tech, Stack"],
];
db.prepare("DELETE FROM projects").run();
{
  const ins = db.prepare("INSERT INTO projects (title, description, url, tech_stack, order_index) VALUES (?,?,?,?,?)");
  projects.forEach((p, i) => ins.run(p[0], p[1], p[2], p[3], i));
}

// ---- CV sections ----  section_type: education | experience | skill | publication | other
const cvSections = [
  ["education", {
    title: "Your Degree",
    subtitle: "Program / department",
    institution: "Your University",
    date_range: "20XX – Present",
    description: "GPA / honors line",
    bullets: ["Relevant coursework or highlight.", "Another highlight."],
  }],
  ["experience", {
    title: "Your Role",
    institution: "Organization",
    subtitle: "Advisor / team (optional)",
    date_range: "Summer 20XX",
    bullets: ["What you did.", "Impact / result."],
  }],
  ["skill", {
    title: "Skills",
    bullets: ["Programming: ...", "Tools: ...", "Languages: ..."],
  }],
];
db.prepare("DELETE FROM cv_sections").run();
{
  const ins = db.prepare("INSERT INTO cv_sections (section_type, content_json, order_index) VALUES (?,?,?)");
  cvSections.forEach((s, i) => ins.run(s[0], JSON.stringify(s[1]), i));
}

console.log("Seed complete:");
console.log("  config keys:", db.prepare("SELECT COUNT(*) c FROM config").get().c);
console.log("  honors:", db.prepare("SELECT COUNT(*) c FROM honors").get().c);
console.log("  projects:", db.prepare("SELECT COUNT(*) c FROM projects").get().c);
console.log("  cv_sections:", db.prepare("SELECT COUNT(*) c FROM cv_sections").get().c);
db.close();
