function originFromHeader(value: string | null): string | null {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function firstHeaderValue(value: string | null): string | null {
  return value?.split(",")[0]?.trim() || null;
}

function originFromHost(host: string | null, protocol: string): string | null {
  const normalizedHost = firstHeaderValue(host);
  if (!normalizedHost) return null;

  try {
    return new URL(`${protocol}://${normalizedHost}`).origin;
  } catch {
    return null;
  }
}

function expectedRequestOrigins(request: Request): Set<string> {
  const url = new URL(request.url);
  const forwardedProtocol =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ??
    url.protocol.replace(":", "");
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : url.protocol.replace(":", "");

  return new Set(
    [
      url.origin,
      originFromHeader(process.env.NEXT_PUBLIC_SITE_URL ?? null),
      originFromHeader(process.env.AUTH_URL ?? null),
      originFromHost(request.headers.get("host"), protocol),
      originFromHost(request.headers.get("x-forwarded-host"), protocol),
    ].filter((origin): origin is string => Boolean(origin))
  );
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
