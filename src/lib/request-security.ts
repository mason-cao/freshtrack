function originFromHeader(value: string | null): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function expectedRequestOrigins(request: Request): Set<string> {
  const configuredOrigins = new Set(
    [
      originFromHeader(process.env.NEXT_PUBLIC_SITE_URL ?? null),
      originFromHeader(process.env.AUTH_URL ?? null),
    ].filter((origin): origin is string => Boolean(origin))
  );

  // In production, configured origins are the trust anchor. Request URLs can
  // be reconstructed from proxy/Host headers and must not widen that set.
  if (configuredOrigins.size > 0) return configuredOrigins;

  return new Set([new URL(request.url).origin]);
}

interface SameOriginRequestOptions {
  requireOriginHeader?: boolean;
}

export function isSameOriginRequest(
  request: Request,
  options: SameOriginRequestOptions = {}
): boolean {
  const expectedOrigins = expectedRequestOrigins(request);
  const origin = originFromHeader(request.headers.get("origin"));

  if (origin) {
    return expectedOrigins.has(origin);
  }

  const refererOrigin = originFromHeader(request.headers.get("referer"));
  if (refererOrigin) {
    return expectedOrigins.has(refererOrigin);
  }

  return !options.requireOriginHeader;
}
