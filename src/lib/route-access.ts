const PUBLIC_PATHS = [
  "/login",
  "/privacy",
  "/terms",
  "/foods",
  "/opengraph-image",
  "/twitter-image",
];

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/api/analytics") return true;
  return (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/api/auth/")
  );
}

const STATIC_PUBLIC_PATHS = ["/privacy", "/terms", "/foods"];

export function isStaticPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return STATIC_PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}
