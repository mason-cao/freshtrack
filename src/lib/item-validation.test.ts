import { describe, expect, it } from "vitest";
import { parseItemId, validateCreateItemPayload, validatePatchItemPayload } from "./item-validation";

const required = { name: " Yogurt ", expirationDate: "2026-09-20" };

describe("item field validation", () => {
  it("defaults create fields while a patch only contains supplied fields", () => {
    expect(validateCreateItemPayload(required)).toEqual({ ok: true, data: {
      name: "Yogurt", expirationDate: "2026-09-20", purchaseDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      categoryId: null, quantity: 1, unit: "count", costEstimate: null, notes: null,
    } });
    expect(validatePatchItemPayload({ name: " Yogurt " })).toEqual({ ok: true, data: { name: "Yogurt" } });
  });

  it.each([true, false, [], [1], {}, " ", "NaN", "Infinity"])("rejects coercible non-numeric input %j", (value) => {
    expect(validateCreateItemPayload({ ...required, quantity: value }).ok).toBe(false);
    expect(validatePatchItemPayload({ quantity: value }).ok).toBe(false);
    expect(validatePatchItemPayload({ costEstimate: value }).ok).toBe(false);
    expect(parseItemId(value)).toBeNull();
  });

  it("validates calendar dates and preserves explicit clears and zero costs", () => {
    expect(validateCreateItemPayload({ ...required, expirationDate: "2026-02-30" }).ok).toBe(false);
    expect(validatePatchItemPayload({ purchaseDate: "2026-02-30" }).ok).toBe(false);
    expect(validatePatchItemPayload({ categoryId: null, notes: "", costEstimate: 0 })).toEqual({
      ok: true, data: { categoryId: null, notes: null, costEstimate: 0 },
    });
    expect(validatePatchItemPayload({ costEstimate: "" })).toEqual({ ok: true, data: { costEstimate: null } });
    expect(validatePatchItemPayload({ unknown: 1 }).ok).toBe(false);
  });
});
