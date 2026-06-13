import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "cv-homepage-jwt-secret-change-in-prod";
const COOKIE_NAME = "admin_token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { valid: boolean; payload?: Record<string, unknown> } {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

export function getAdminToken(): string | null {
  try {
    return cookies().get(COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  if (!token) return false;
  return verifyToken(token).valid;
}

export const COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};
