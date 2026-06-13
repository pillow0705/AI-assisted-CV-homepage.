import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { setConfig, getConfig } from "@/lib/db";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("cv") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const filename = `cv_${Date.now()}.pdf`;
  const filePath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  setConfig("cv_filename", filename);
  return NextResponse.json({ filename, url: `/uploads/${filename}` });
}

export async function GET() {
  const filename = getConfig("cv_filename");
  if (!filename) return NextResponse.json({ filename: null });
  return NextResponse.json({ filename, url: `/uploads/${filename}` });
}
