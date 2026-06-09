interface ContentSecurityPolicyOptions {
  nonce: string;
  isProduction?: boolean;
}

const NONCE_PATTERN = /^[A-Za-z0-9+/_-]+={0,2}$/;

function directive(name: string, values: string[]) {
  return `${name} ${values.join(" ")}`;
}

export function buildContentSecurityPolicy({
  nonce,
  isProduction = process.env.NODE_ENV === "production",
}: ContentSecurityPolicyOptions): string {
  if (!NONCE_PATTERN.test(nonce)) {
    throw new Error("CSP nonce contains invalid characters.");
  }

  const scriptSrc = ["'self'", `'nonce-${nonce}'`];
  const styleSrc = ["'self'", "https://fonts.googleapis.com", `'nonce-${nonce}'`];

  if (!isProduction) {
    scriptSrc.push("'unsafe-eval'", "'unsafe-inline'");
  }

  return [
    directive("default-src", ["'self'"]),
    directive("script-src", scriptSrc),
    directive("style-src", styleSrc),
    directive("style-src-attr", ["'unsafe-inline'"]),
    directive("font-src", ["'self'", "https://fonts.gstatic.com", "data:"]),
    directive("img-src", [
      "'self'",
      "data:",
      "blob:",
      "https://images.unsplash.com",
      "https://lh3.googleusercontent.com",
      "https://images.openfoodfacts.org",
      "https://www.themealdb.com",
    ]),
    directive("connect-src", ["'self'", "https://accounts.google.com"]),
    directive("frame-ancestors", ["'none'"]),
    directive("base-uri", ["'self'"]),
    directive("form-action", ["'self'"]),
    directive("object-src", ["'none'"]),
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}
