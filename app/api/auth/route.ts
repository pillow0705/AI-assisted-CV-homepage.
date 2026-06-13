import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/db";
import { verifyPassword, signToken, COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Missing password" }, { status: 400 });

  const hash = getConfig("admin_password_hash");
  if (!hash) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const valid = await verifyPassword(password, hash);
  if (!valid) return NextResponse.json({ error: "Invalid password" }, { status: 401 });

  const token = signToken({ role: "admin" });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_OPTIONS.name, token, COOKIE_OPTIONS);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_OPTIONS.name, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
