import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow setup, API routes, static files, and Next internals to pass through
  if (
    pathname.startsWith("/setup") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Setup completion is the source of truth in the database, checked
  // server-side in each page (e.g. app/page.tsx calls isSetupComplete()).
  // Middleware runs on the edge and can't read the SQLite DB, and a
  // per-browser cookie is the wrong place to gate a globally-configured
  // site — a fresh visitor with no cookie would wrongly be sent to /setup.
  // So we let requests through and defer the decision to the page layer.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
