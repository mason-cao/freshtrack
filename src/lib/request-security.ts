function originFromHeader(value: string | null): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: Request): boolean {
  const expectedOrigin = new URL(request.url).origin;
  const origin = originFromHeader(request.headers.get("origin"));

  if (origin) {
    return origin === expectedOrigin;
  }

  const refererOrigin = originFromHeader(request.headers.get("referer"));
  if (refererOrigin) {
    return refererOrigin === expectedOrigin;
  }

  return true;
}
