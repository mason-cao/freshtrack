import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ user: vi.fn(), limit: vi.fn(), complete: vi.fn(), restore: vi.fn() }));
vi.mock("@/lib/session", () => ({ getCurrentUserId: mocks.user }));
vi.mock("@/lib/rate-limits", () => ({ checkItemMutationRateLimit: mocks.limit }));
vi.mock("@/db/items", () => ({ completeItem: mocks.complete, restoreItem: mocks.restore }));
import { POST as consume } from "./[id]/consume/route";
import { POST as waste } from "./[id]/waste/route";
import { POST as restore } from "./[id]/restore/route";

const origin = "https://freshtrack.test";
const request = (requestOrigin = origin) => new Request(`${origin}/api/items/7/consume`, {
  method: "POST", headers: { Origin: requestOrigin },
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", origin);
  vi.stubEnv("AUTH_URL", origin);
  mocks.user.mockResolvedValue("owner");
  mocks.limit.mockReturnValue({ ok: true });
  mocks.complete.mockResolvedValue({ status: 200, body: { success: true } });
  mocks.restore.mockResolvedValue({ status: 200, body: { success: true } });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each([consume, waste, restore])("item action guards", (post) => {
  it("blocks cross-origin requests before authentication or mutation", async () => {
    const response = await post(request("https://elsewhere.test"), { params: Promise.resolve({ id: "7" }) });
    expect(response.status).toBe(403);
    expect(mocks.user).not.toHaveBeenCalled();
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(mocks.restore).not.toHaveBeenCalled();
  });

  it("rejects invalid identifiers and propagates Retry-After", async () => {
    expect((await post(request(), { params: Promise.resolve({ id: "nope" }) })).status).toBe(400);
    mocks.limit.mockReturnValue({ ok: false, retryAfterSeconds: 12 });
    const response = await post(request(), { params: Promise.resolve({ id: "7" }) });
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("12");
  });
});

it("routes each action with the authenticated owner and returns database conflicts", async () => {
  const params = { params: Promise.resolve({ id: "7" }) };
  await consume(request(), params);
  await waste(request(), params);
  await restore(request(), params);
  expect(mocks.complete).toHaveBeenCalledWith(7, "owner", "consumed");
  expect(mocks.complete).toHaveBeenCalledWith(7, "owner", "wasted");
  expect(mocks.restore).toHaveBeenCalledWith(7, "owner");
  mocks.complete.mockResolvedValue({ status: 409, body: { error: "Already completed" } });
  const response = await consume(request(), params);
  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({ error: "Already completed" });
});
