import { describe, expect, it } from "vitest";
import {
  normalizeOpenFoodFactsProduct,
  parseProductQuantity,
  sanitizeBarcode,
} from "./barcode";

describe("sanitizeBarcode", () => {
  it("accepts retail barcodes of 8–14 digits", () => {
    expect(sanitizeBarcode("0123456789012")).toBe("0123456789012"); // EAN-13
    expect(sanitizeBarcode("036000291452")).toBe("036000291452"); // UPC-A
    expect(sanitizeBarcode("96385074")).toBe("96385074"); // EAN-8
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeBarcode("  036000291452 ")).toBe("036000291452");
  });

  it("rejects non-digit, too short, too long, and non-string input", () => {
    expect(sanitizeBarcode("12a45678")).toBeNull();
    expect(sanitizeBarcode("1234567")).toBeNull(); // 7 digits
    expect(sanitizeBarcode("123456789012345")).toBeNull(); // 15 digits
    expect(sanitizeBarcode("")).toBeNull();
    expect(sanitizeBarcode(undefined)).toBeNull();
    expect(sanitizeBarcode(36000291452)).toBeNull();
  });
});

describe("normalizeOpenFoodFactsProduct", () => {
  it("normalizes a complete product, preferring the English name", () => {
    const result = normalizeOpenFoodFactsProduct({
      status: 1,
      product: {
        product_name: "Yaourt Grec Nature",
        product_name_en: "Plain Greek Yogurt",
        generic_name: "Yogurt",
        brands: "Fage, Total",
        categories_tags_en: ["en:Dairies", "Fermented-Foods", "en:Yogurts"],
        product_quantity: "500",
        product_quantity_unit: "g",
        image_front_url: "https://images.openfoodfacts.org/images/products/front.jpg",
      },
    });

    expect(result).toEqual({
      found: true,
      name: "Plain Greek Yogurt",
      brand: "Fage",
      quantity: 500,
      unit: "g",
      imageUrl: "https://images.openfoodfacts.org/images/products/front.jpg",
      categoryTags: ["dairies", "fermented foods", "yogurts"],
    });
  });

  it("falls back through the name chain when the English name is missing", () => {
    const result = normalizeOpenFoodFactsProduct({
      status: 1,
      product: { generic_name: "Whole Milk" },
    });

    expect(result.found).toBe(true);
    expect(result.name).toBe("Whole Milk");
  });

  it("parses a freeform quantity string when structured fields are absent", () => {
    const result = normalizeOpenFoodFactsProduct({
      status: 1,
      product: { product_name: "Olive Oil", quantity: "1,5 L" },
    });

    expect(result.quantity).toBe(1.5);
    expect(result.unit).toBe("l");
  });

  it("treats a known barcode with no usable name as a miss", () => {
    const result = normalizeOpenFoodFactsProduct({
      status: 1,
      product: { brands: "Generic" },
    });
    expect(result.found).toBe(false);
    expect(result.name).toBeNull();
  });

  it("returns a clean miss for status 0, missing product, or junk payloads", () => {
    const miss = {
      found: false,
      name: null,
      brand: null,
      quantity: null,
      unit: null,
      imageUrl: null,
      categoryTags: [],
    };
    expect(normalizeOpenFoodFactsProduct({ status: 0 })).toEqual(miss);
    expect(normalizeOpenFoodFactsProduct({ status: 1 })).toEqual(miss);
    expect(normalizeOpenFoodFactsProduct(null)).toEqual(miss);
    expect(normalizeOpenFoodFactsProduct("nope")).toEqual(miss);
  });

  it("drops non-https product images", () => {
    const result = normalizeOpenFoodFactsProduct({
      status: 1,
      product: { product_name: "Soda", image_front_url: "http://insecure.example/x.jpg" },
    });
    expect(result.imageUrl).toBeNull();
  });

  it("caps untrusted upstream text and quantity fields", () => {
    const result = normalizeOpenFoodFactsProduct({
      status: 1,
      product: {
        product_name: "x".repeat(200),
        brands: "y".repeat(200),
        product_quantity: 1_000_001,
        product_quantity_unit: "g",
      },
    });

    expect(result.name).toBe("x".repeat(80));
    expect(result.brand).toBe("y".repeat(80));
    expect(result.quantity).toBeNull();
  });
});

describe("parseProductQuantity", () => {
  it("prefers the structured product_quantity over freeform text", () => {
    expect(
      parseProductQuantity({ product_quantity: "330", product_quantity_unit: "mL", quantity: "1 can" })
    ).toEqual({ quantity: 330, unit: "ml" });
  });

  it("returns nulls when nothing parses", () => {
    expect(parseProductQuantity({ quantity: "family size" })).toEqual({ quantity: null, unit: null });
    expect(parseProductQuantity({})).toEqual({ quantity: null, unit: null });
  });
});
