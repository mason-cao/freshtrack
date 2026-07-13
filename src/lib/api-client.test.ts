import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchJson } from "./api-client";

describe("fetchJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults API reads to no-store and parses JSON", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ value: "ok" }, { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchJson<{ value: string }>("/api/example")).resolves.toEqual({
      value: "ok",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/example",
      expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) })
    );
  });

  it("surfaces JSON API errors and accepts empty success responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ error: "No access." }, { status: 403 }))
        .mockResolvedValueOnce(new Response(null, { status: 204 }))
    );

    await expect(fetchJson("/api/example")).rejects.toThrow("No access.");
    await expect(fetchJson<void>("/api/example", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("turns fetch failures into actionable network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    vi.stubGlobal("navigator", { onLine: true });

    await expect(fetchJson("/api/example")).rejects.toThrow(
      "Network error: Failed to fetch"
    );
  });
});
