import { describe, expect, it } from "vitest";
import { buildReminderEmail, type ReminderEmailInput } from "./reminder-email";

const links = {
  pantry: "https://myfreshtrack.app/pantry?utm_source=reminder&utm_medium=email",
  recipes: "https://myfreshtrack.app/recipes?utm_source=reminder&utm_medium=email",
  settings: "https://myfreshtrack.app/settings",
  unsubscribe: "https://myfreshtrack.app/unsubscribe?token=abc.def",
};

function input(overrides: Partial<ReminderEmailInput> = {}): ReminderEmailInput {
  return {
    name: "Mason Cao",
    today: "2026-09-28",
    items: [
      { name: "Greek Yogurt", expirationDate: "2026-09-29" },
      { name: "Spinach", expirationDate: "2026-09-28" },
    ],
    recipe: null,
    links,
    ...overrides,
  };
}

describe("buildReminderEmail subject", () => {
  it("names a single item and when it expires", () => {
    expect(
      buildReminderEmail(input({ items: [{ name: "Greek Yogurt", expirationDate: "2026-09-29" }] })).subject
    ).toBe("Greek Yogurt expires tomorrow");
  });

  it("lists the soonest items first", () => {
    expect(buildReminderEmail(input()).subject).toBe("Spinach and Greek Yogurt expire soon");
    expect(
      buildReminderEmail(
        input({
          items: [
            { name: "Milk", expirationDate: "2026-09-30" },
            { name: "Greek Yogurt", expirationDate: "2026-09-29" },
            { name: "Spinach", expirationDate: "2026-09-28" },
            { name: "Basil", expirationDate: "2026-09-30" },
          ],
        })
      ).subject
    ).toBe("Spinach, Greek Yogurt, and 2 more expire soon");
  });

  it("keeps the subject on one line", () => {
    expect(
      buildReminderEmail(input({ items: [{ name: "Oat\nMilk", expirationDate: "2026-09-28" }] })).subject
    ).toBe("Oat Milk expires today");
  });
});

describe("buildReminderEmail body", () => {
  it("greets by first name and lists each item with its expiry", () => {
    const { html, text } = buildReminderEmail(input());
    expect(text).toContain("Hi Mason,");
    expect(text).toContain("- Spinach: expires today");
    expect(text).toContain("- Greek Yogurt: expires tomorrow");
    expect(html).toContain("Hi Mason,");
    expect(html).toContain("Spinach");
    expect(html).toContain("expires today");
  });

  it("falls back to a neutral greeting", () => {
    expect(buildReminderEmail(input({ name: null })).text).toContain("Hi there,");
  });

  it("escapes item names in the HTML", () => {
    const { html } = buildReminderEmail(
      input({ items: [{ name: `<img src=x onerror="alert(1)">`, expirationDate: "2026-09-28" }] })
    );
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  });

  it("suggests a recipe that uses the expiring items", () => {
    const { html, text } = buildReminderEmail(
      input({ recipe: { name: "Spinach Frittata", matchingIngredients: ["spinach", "greek yogurt"] } })
    );
    expect(text).toContain("Try tonight: Spinach Frittata (uses spinach, greek yogurt)");
    expect(html).toContain("Spinach Frittata");
    expect(html).toContain(links.recipes.replace(/&/g, "&amp;"));
  });

  it("caps the list and says how many more are waiting", () => {
    const items = Array.from({ length: 10 }, (_, index) => ({
      name: `Item ${String(index).padStart(2, "0")}`,
      expirationDate: "2026-09-28",
    }));
    const { text } = buildReminderEmail(input({ items }));
    expect(text).toContain("- Item 07: expires today");
    expect(text).not.toContain("Item 08");
    expect(text).toContain("+2 more in your pantry");
  });

  it("always offers a way to stop the emails", () => {
    const { html, text } = buildReminderEmail(input());
    expect(text).toContain(`Stop these emails: ${links.unsubscribe}`);
    expect(html).toContain(links.unsubscribe);
    expect(html).toContain(links.settings);
  });
});
