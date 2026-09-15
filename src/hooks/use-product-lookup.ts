"use client";

import { useEffect, useRef, useState } from "react";
import { fetchJson } from "@/lib/api-client";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import type { ProductLookupResult } from "@/lib/barcode";

type LookupNote = { tone: "ok" | "warn"; text: string };

export function useProductLookup(open: boolean) {
  const request = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState<LookupNote | null>(null);

  function cancel() {
    request.current?.abort();
    request.current = null;
    setPending(false);
    setNote(null);
  }

  useEffect(() => {
    if (!open) cancel();
    return () => request.current?.abort();
  }, [open]);

  async function lookup(barcode: string, apply: (product: ProductLookupResult) => void) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setNote(null);
    trackAnalyticsEvent("barcode_scanned");
    try {
      const product = await fetchJson<ProductLookupResult>(`/api/products/${barcode}`, { signal: controller.signal });
      if (controller.signal.aborted) return;
      trackAnalyticsEvent(product.found ? "barcode_lookup_hit" : "barcode_lookup_miss");
      if (product.found) {
        apply(product);
        setNote({ tone: "ok", text: product.name
          ? `Prefilled “${product.name}”. Review and save.`
          : "Prefilled from the scanned product. Review and save." });
      } else {
        setNote({ tone: "warn", text: "We couldn't find that product. Add the details below." });
      }
    } catch {
      if (controller.signal.aborted) return;
      trackAnalyticsEvent("barcode_lookup_miss");
      setNote({ tone: "warn", text: "Lookup failed. Add the details below." });
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  }

  return { pending, note, lookup, cancel, clearNote: () => setNote(null) };
}
