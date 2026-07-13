import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy } from "./security-headers";

function getDirective(policy: string, name: string) {
  return policy
    .split("; ")
    .find((directive) => directive.startsWith(`${name} `));
}

describe("buildContentSecurityPolicy", () => {
  it("requires a valid nonce", () => {
    expect(() =>
      buildContentSecurityPolicy({ nonce: "bad nonce", isProduction: true })
    ).toThrow("CSP nonce contains invalid characters.");
  });

  it("blocks inline and eval scripts in production", () => {
    const policy = buildContentSecurityPolicy({
      nonce: "test-nonce",
      isProduction: true,
    });
    const scriptSrc = getDirective(policy, "script-src");

    expect(scriptSrc).toBe(
      "script-src 'self' 'nonce-test-nonce' 'strict-dynamic'"
    );
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(scriptSrc).not.toContain("'unsafe-eval'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("upgrade-insecure-requests");
  });

  it("supports prerendered public pages without request-specific nonces", () => {
    const policy = buildContentSecurityPolicy({
      allowInlineScripts: true,
      isProduction: true,
    });

    expect(getDirective(policy, "script-src")).toBe(
      "script-src 'self' 'unsafe-inline'"
    );
    expect(policy).not.toContain("nonce-");
  });

  it("does not silently produce a script policy with no execution path", () => {
    expect(() =>
      buildContentSecurityPolicy({ isProduction: true })
    ).toThrow("CSP requires a nonce unless inline scripts are allowed.");
  });

  it("keeps development script allowances isolated to non-production", () => {
    const policy = buildContentSecurityPolicy({
      nonce: "test-nonce",
      isProduction: false,
    });
    const scriptSrc = getDirective(policy, "script-src");

    expect(scriptSrc).toContain("'unsafe-eval'");
    expect(scriptSrc).toContain("'unsafe-inline'");
    expect(policy).not.toContain("upgrade-insecure-requests");
  });
});
