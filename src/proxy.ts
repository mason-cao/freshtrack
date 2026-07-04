import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { isPublicPath } from "@/lib/route-access";
import { buildContentSecurityPolicy } from "@/lib/security-headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Dev-only escape hatch: when AUTH_DEV_BYPASS=1 in development,
// the middleware lets every request through so the UI can be
// previewed without configuring Google OAuth credentials. Never
// honored outside NODE_ENV=development.
const DEV_BYPASS =
  process.env.NODE_ENV === "development" &&
  process.env.AUTH_DEV_BYPASS === "1";

function generateNonce() {
  return crypto.randomUUID();
}

function nextResponseWithCsp(request: NextRequest, nonce: string, csp: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("content-security-policy", csp);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

function responseWithCsp(response: NextResponse, csp: string) {
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const nonce = generateNonce();
  const csp = buildContentSecurityPolicy({ nonce });

  if (isPublicPath(pathname)) {
    return nextResponseWithCsp(req, nonce, csp);
  }

  if (DEV_BYPASS) {
    return nextResponseWithCsp(req, nonce, csp);
  }

  if (!req.auth) {
    // API clients need a machine-readable 401; redirecting them to the login
    // page hands fetch() an HTML document it can't parse.
    if (pathname.startsWith("/api/")) {
      return responseWithCsp(
        NextResponse.json({ error: "Authentication required." }, { status: 401 }),
        csp
      );
    }
    const loginUrl = new URL("/login", req.url);
    return responseWithCsp(NextResponse.redirect(loginUrl), csp);
  }

  return nextResponseWithCsp(req, nonce, csp);
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    // The pattern above skips any path containing a dot (static files), which
    // would also let dotted API paths (e.g. /api/products/12.34) bypass auth.
    // Match all of /api explicitly so every API request is authenticated.
    "/api/:path*",
  ],
};
