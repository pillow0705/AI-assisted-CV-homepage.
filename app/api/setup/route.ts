import { NextRequest, NextResponse } from "next/server";
import { getDb, setConfig, isSetupComplete } from "@/lib/db";
import { upsertHonors, upsertProjects } from "@/lib/config";
import { hashPassword } from "@/lib/auth";
import type { SetupData } from "@/types";

export async function GET() {
  return NextResponse.json({ setupComplete: isSetupComplete() });
}

export async function POST(req: NextRequest) {
  if (isSetupComplete()) {
    return NextResponse.json({ error: "Already set up" }, { status: 400 });
  }

  const data: SetupData = await req.json();

  if (!data.name || !data.ai_api_key || !data.admin_password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getDb();
  const setMany = db.transaction((entries: [string, string][]) => {
    const stmt = db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)");
    for (const [k, v] of entries) stmt.run(k, v);
  });

  const passwordHash = await hashPassword(data.admin_password);

  setMany([
    ["name", data.name],
    ["title", data.title || ""],
    ["tagline", data.tagline || ""],
    ["about", data.about || ""],
    ["email", data.email || ""],
    ["github", data.github || ""],
    ["linkedin", data.linkedin || ""],
    ["twitter", data.twitter || ""],
    ["location", data.location || ""],
    ["institution", data.institution || ""],
    ["ai_provider", data.ai_provider],
    ["ai_model", data.ai_model],
    ["ai_api_key", data.ai_api_key],
    ["ai_private_notes", data.ai_private_notes || ""],
    ["suggested_questions", data.suggested_questions || ""],
    ["admin_password_hash", passwordHash],
    ["setup_complete", "true"],
  ]);

  if (data.honors?.length) upsertHonors(data.honors.map((h, i) => ({ ...h, order_index: i })));
  if (data.projects?.length) upsertProjects(data.projects.map((p, i) => ({ ...p, order_index: i })));

  const response = NextResponse.json({ ok: true });
  response.cookies.set("setup_complete", "true", {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365 * 10,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
