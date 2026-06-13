import { getDb, getAllConfig } from "./db";
import type { SiteConfig, Honor, Project, CVSection } from "@/types";

export function getSiteConfig(): Partial<SiteConfig> {
  const raw = getAllConfig();
  return {
    name: raw.name,
    title: raw.title,
    tagline: raw.tagline,
    about: raw.about,
    email: raw.email,
    github: raw.github,
    linkedin: raw.linkedin,
    twitter: raw.twitter,
    website: raw.website,
    avatar_url: raw.avatar_url,
    cv_filename: raw.cv_filename,
    ai_provider: (raw.ai_provider as SiteConfig["ai_provider"]) || "openai",
    ai_model: raw.ai_model,
    ai_api_key: raw.ai_api_key,
    ai_private_notes: raw.ai_private_notes,
    suggested_questions: raw.suggested_questions,
    admin_password_hash: raw.admin_password_hash,
    setup_complete: raw.setup_complete === "true",
    location: raw.location,
    institution: raw.institution,
    content_cn: raw.content_cn,
  };
}

export function getHonors(): Honor[] {
  return getDb()
    .prepare("SELECT * FROM honors ORDER BY order_index ASC, id ASC")
    .all() as Honor[];
}

export function getProjects(): Project[] {
  return getDb()
    .prepare("SELECT * FROM projects ORDER BY order_index ASC, id ASC")
    .all() as Project[];
}

export function getCVSections(): CVSection[] {
  return getDb()
    .prepare("SELECT * FROM cv_sections ORDER BY order_index ASC, id ASC")
    .all() as CVSection[];
}

export function upsertHonors(honors: Omit<Honor, "id">[]): void {
  const db = getDb();
  db.prepare("DELETE FROM honors").run();
  const insert = db.prepare(
    "INSERT INTO honors (title, issuer, year, description, order_index) VALUES (?, ?, ?, ?, ?)"
  );
  honors.forEach((h, i) => insert.run(h.title, h.issuer, h.year, h.description || null, i));
}

export function upsertProjects(projects: Omit<Project, "id">[]): void {
  const db = getDb();
  db.prepare("DELETE FROM projects").run();
  const insert = db.prepare(
    "INSERT INTO projects (title, description, url, tech_stack, order_index) VALUES (?, ?, ?, ?, ?)"
  );
  projects.forEach((p, i) => insert.run(p.title, p.description, p.url || null, p.tech_stack || null, i));
}
