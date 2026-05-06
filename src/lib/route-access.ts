const PUBLIC_PATHS = ["/login", "/privacy", "/terms"];

export function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    pathname.startsWith("/api/auth/")
  );
}
