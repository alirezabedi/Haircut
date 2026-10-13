import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth/token";

// Everything except /login and static assets needs the shop cookie (docs/SPEC.md §3).
// Pages and routes check again on the server; this is the first gate.
export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (verifyToken(token, process.env.SESSION_SECRET ?? "") !== null) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|icons/|icon.png|favicon.ico|manifest.webmanifest|sw.js).*)",
  ],
};
