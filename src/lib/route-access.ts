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
  return (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/api/auth/")
  );
}
