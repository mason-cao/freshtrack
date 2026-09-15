import { describe, expect, it } from "vitest";
import { itemFormPatch, itemFormValues, productFormPatch, serializeItemForm, suggestExpiration } from "./item-form";
import type { PantryItem } from "./pantry";

const item: PantryItem = {
  id: 1, name: "Yogurt", categoryId: 2, categoryName: "Dairy", categoryIcon: null,
  quantity: 2, unit: "tub", purchaseDate: "2026-09-10", expirationDate: "2026-09-20",
  costEstimate: 3, notes: "Keep cold", createdAt: "2026-09-10",
};

describe("shared pantry form values", () => {
  it("round trips custom units and produces only changed fields", () => {
    const values = itemFormValues(item);
    expect(itemFormPatch(values, item)).toEqual({});
    expect(itemFormPatch({ ...values, name: " Yogurt ", categoryId: "", costEstimate: "" }, item)).toEqual({
      categoryId: null, costEstimate: null,
    });
    expect(serializeItemForm(values).unit).toBe("tub");
    expect(itemFormPatch({ ...values, quantity: "", purchaseDate: "" }, item)).toEqual({});
  });

  it("only prefills quantities whose units the form can represent", () => {
    const product = { found: true, name: " Milk ", brand: null, categoryId: 2, quantity: 500, unit: "ml", imageUrl: null };
    expect(productFormPatch(product)).toEqual({ name: " Milk ", categoryId: "2" });
    expect(productFormPatch({ ...product, quantity: 12, unit: "ounces" })).toMatchObject({ quantity: "12", unit: "oz" });
  });

  it("suggests a date once categories arrive without replacing an explicit expiration", () => {
    const categories = [{ id: 2, name: "Dairy", icon: "milk", defaultShelfLifeDays: 7 }];
    const empty = { ...itemFormValues(), categoryId: "2" };
    expect(suggestExpiration(empty, []).expirationDate).toBe("");
    expect(suggestExpiration(empty, categories).expirationDate).not.toBe("");
    const existing = itemFormValues(item);
    expect(suggestExpiration(existing, categories)).toBe(existing);
  });
});
