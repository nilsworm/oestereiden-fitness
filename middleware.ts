import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");

  if (!req.auth?.user) {
    return NextResponse.redirect(new URL(isAdmin ? "/admin/login" : "/registration", req.url));
  }

  if (isAdmin && req.auth.user.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
});

export const runtime = "nodejs";

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/code", "/code"],
};
