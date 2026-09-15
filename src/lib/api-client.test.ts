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
  it("honors explicit cancellation before parsing a late response", async () => {
    const controller = new AbortController();
    controller.abort(new DOMException("Canceled", "AbortError"));
    const response = Response.json({ value: "stale" });
    vi.stubGlobal("fetch", vi.fn(async () => response));
    await expect(fetchJson("/api/example", { signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" });
    expect(response.bodyUsed).toBe(false);
  });

  it("keeps the timeout when a caller supplies its own cancellation signal", async () => {
    const timeout = new AbortController();
    const spy = vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeout.signal);
    vi.stubGlobal("fetch", vi.fn((_input, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal!.addEventListener("abort", () => reject(init.signal!.reason));
    })));
    try {
      const pending = fetchJson("/api/example", { signal: new AbortController().signal });
      const assertion = expect(pending).rejects.toThrow("The request took too long");
      timeout.abort();
      await assertion;
    } finally {
      spy.mockRestore();
    }
  });

});
