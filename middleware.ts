import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!token) {
    const redirect = request.nextUrl.pathname.startsWith("/admin")
      ? "/admin/login"
      : "/registration";
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return NextResponse.next();
}

export const runtime = "nodejs";

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/code", "/code"],
};
