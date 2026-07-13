interface ContentSecurityPolicyOptions {
  nonce?: string;
  allowInlineScripts?: boolean;
  isProduction?: boolean;
}

const NONCE_PATTERN = /^[A-Za-z0-9+/_-]+={0,2}$/;

function directive(name: string, values: string[]) {
  return `${name} ${values.join(" ")}`;
}

export function buildContentSecurityPolicy({
  nonce,
  allowInlineScripts = false,
  isProduction = process.env.NODE_ENV === "production",
}: ContentSecurityPolicyOptions): string {
  if (nonce && !NONCE_PATTERN.test(nonce)) {
    throw new Error("CSP nonce contains invalid characters.");
  }

  if (!nonce && !allowInlineScripts) {
    throw new Error("CSP requires a nonce unless inline scripts are allowed.");
  }

  const scriptSrc = ["'self'"];
  const styleSrc = ["'self'", "https://fonts.googleapis.com"];

  if (nonce) {
    scriptSrc.push(`'nonce-${nonce}'`, "'strict-dynamic'");
    styleSrc.push(`'nonce-${nonce}'`);
  }

  if (allowInlineScripts) {
    scriptSrc.push("'unsafe-inline'");
    styleSrc.push("'unsafe-inline'");
  }

  if (!isProduction) {
    scriptSrc.push("'unsafe-eval'");
    if (!scriptSrc.includes("'unsafe-inline'")) scriptSrc.push("'unsafe-inline'");
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
