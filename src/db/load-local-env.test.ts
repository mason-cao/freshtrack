import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadLocalEnv } from "./load-local-env";

describe("loadLocalEnv", () => {
  let dir: string;
  let envFile: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "freshtrack-env-"));
    envFile = join(dir, ".env.local");
    writeFileSync(envFile, "LOCAL_ENV_PROBE=from-file\n");
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    delete process.env.LOCAL_ENV_PROBE;
    vi.unstubAllEnvs();
    rmSync(dir, { recursive: true, force: true });
  });

  it("loads variables from the local env file", () => {
    loadLocalEnv(envFile);
    expect(process.env.LOCAL_ENV_PROBE).toBe("from-file");
  });

  it("lets variables already set in the shell win", () => {
    vi.stubEnv("LOCAL_ENV_PROBE", "from-shell");
    loadLocalEnv(envFile);
    expect(process.env.LOCAL_ENV_PROBE).toBe("from-shell");
  });

  it("ignores a missing file", () => {
    expect(() => loadLocalEnv(join(dir, "missing.env"))).not.toThrow();
  });

  it("never reads the file in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    loadLocalEnv(envFile);
    expect(process.env.LOCAL_ENV_PROBE).toBeUndefined();
  });
});
