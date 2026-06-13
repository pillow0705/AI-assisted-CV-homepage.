import { NextRequest, NextResponse } from "next/server";
import { getDb, setConfig } from "@/lib/db";
import { getSiteConfig, getHonors, getProjects } from "@/lib/config";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const config = getSiteConfig();
  const honors = getHonors();
  const projects = getProjects();

  // Never expose secrets or AI-only private notes to the client.
  // ai_private_notes is meant for the AI assistant only (read server-side in
  // /api/chat); it must not leak through this public endpoint.
  const { ai_api_key, admin_password_hash, ai_private_notes, ...safe } = config;
  void ai_api_key;
  void admin_password_hash;
  void ai_private_notes;

  return NextResponse.json({ config: safe, honors, projects });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { config, honors, projects } = body;

  const db = getDb();

  if (config) {
    const allowed = [
      "name", "title", "tagline", "about", "email", "github", "linkedin",
      "twitter", "website", "avatar_url", "location", "institution",
      "ai_provider", "ai_model", "ai_api_key", "ai_private_notes",
      "suggested_questions",
    ];
    const upsert = db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)");
    for (const [k, v] of Object.entries(config)) {
      if (allowed.includes(k) && typeof v === "string") {
        upsert.run(k, v);
      }
    }
  }

  if (honors) {
    const { upsertHonors } = await import("@/lib/config");
    upsertHonors(honors);
  }
  if (projects) {
    const { upsertProjects } = await import("@/lib/config");
    upsertProjects(projects);
  }

  return NextResponse.json({ ok: true });
}
