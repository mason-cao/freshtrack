import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { isPublicPath } from "@/lib/route-access";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Dev-only escape hatch: when AUTH_DEV_BYPASS=1 in development,
// the middleware lets every request through so the UI can be
// previewed without configuring Google OAuth credentials. Never
// honored outside NODE_ENV=development.
const DEV_BYPASS =
  process.env.NODE_ENV === "development" &&
  process.env.AUTH_DEV_BYPASS === "1";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (DEV_BYPASS) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
