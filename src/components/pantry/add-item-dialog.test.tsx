import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AddItemDialog } from "./add-item-dialog";

describe("AddItemDialog", () => {
  it("renders its default trigger for inline use", () => {
    const html = renderToStaticMarkup(<AddItemDialog onItemAdded={() => undefined} />);

    expect(html).toContain("Add Item");
  });

  it("can hide its trigger when opened by an external control", () => {
    const html = renderToStaticMarkup(
      <AddItemDialog
        onItemAdded={() => undefined}
        open={false}
        onOpenChange={() => undefined}
        showTrigger={false}
      />
    );

    expect(html).not.toContain("Add Item");
  });
});
