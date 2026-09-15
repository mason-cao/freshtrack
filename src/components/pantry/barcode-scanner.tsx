"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flashlight, FlashlightOff, Keyboard, Loader2, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBarcodeCamera } from "@/hooks/use-barcode-camera";
import { sanitizeBarcode } from "@/lib/barcode";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onCancel: () => void;
}

export function BarcodeScanner({ onDetected, onCancel }: BarcodeScannerProps) {
  const reduceMotion = useReducedMotion();
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const { videoRef, status, errorMessage, torchSupported, torchOn, toggleTorch, openManual, restartScanning } = useBarcodeCamera((code) => {
    if (!reduceMotion) {
      navigator.vibrate?.(60);
      void import("canvas-confetti").then(({ default: confetti }) => confetti({
        particleCount: 36, spread: 55, origin: { x: 0.5, y: 0.45 },
        colors: ["#527a52", "#b8cdb8", "#d97706"], disableForReducedMotion: true,
      })).catch(() => undefined);
    }
    onDetected(code);
  });

  function handleManualSubmit(event: React.FormEvent) {
    event.preventDefault();
    const digits = manualValue.replace(/\D/g, "");
    if (!sanitizeBarcode(digits)) {
      setManualError("Enter the 8–14 digit number printed beneath the barcode.");
      return;
    }
    onDetected(digits);
  }

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-stone-900 sm:aspect-square">
      {status === "manual" ? (
        <form
          onSubmit={handleManualSubmit}
          className="absolute inset-0 flex flex-col justify-center gap-4 bg-stone-900 px-6 text-white"
        >
          <div className="space-y-1">
            <label htmlFor="manual-barcode" className="text-sm font-semibold">
              Enter barcode number
            </label>
            <p className="text-xs text-white/60">Type the digits printed beneath the barcode.</p>
          </div>
          <input
            id="manual-barcode"
            inputMode="numeric"
            autoComplete="off"
            pattern="[0-9 ]{8,20}"
            maxLength={20}
            autoFocus
            value={manualValue}
            onChange={(event) => {
              setManualValue(event.target.value);
              setManualError(null);
            }}
            placeholder="e.g. 0123456789012"
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-sage-400 focus:outline-none"
          />
          {manualError && <p role="alert" className="text-xs text-terracotta-300">{manualError}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              Look up
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={restartScanning}>
              Scan instead
            </Button>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-white/60 transition-colors hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="absolute inset-0 h-full w-full object-cover"
          />

          {status === "scanning" && (
            <>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="relative h-40 w-[80%] max-w-xs rounded-xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                  <motion.div
                    className="absolute inset-x-2 h-0.5 rounded-full bg-sage-400 shadow-[0_0_12px_2px_rgba(125,166,127,0.8)]"
                    initial={{ top: "8%" }}
                    animate={reduceMotion ? { top: "50%" } : { top: ["8%", "92%", "8%"] }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                    }
                  />
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pb-5 pt-12">
                <p className="flex items-center gap-2 text-sm font-medium text-white">
                  <ScanLine className="h-4 w-4" />
                  Point the camera at a barcode
                </p>
                <div className="flex items-center gap-2">
                  {torchSupported && (
                    <Button type="button" variant="secondary" size="sm" onClick={toggleTorch}>
                      {torchOn ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
                      {torchOn ? "Light off" : "Light on"}
                    </Button>
                  )}
                  <Button type="button" variant="secondary" size="sm" onClick={() => { setManualError(null); openManual(); }}>
                    <Keyboard className="h-4 w-4" />
                    Enter number
                  </Button>
                </div>
              </div>
            </>
          )}

          {status === "starting" && (
            <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900 text-white/80">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Starting the camera…</p>
            </div>
          )}

          {status === "error" && (
            <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-stone-900 px-6 text-center text-white/90">
              <p className="text-sm leading-relaxed">{errorMessage}</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button size="sm" onClick={() => { setManualError(null); openManual(); }}>
                  <Keyboard className="h-4 w-4" />
                  Enter number
                </Button>
                <Button variant="secondary" size="sm" onClick={restartScanning}>
                  Try again
                </Button>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-white/60 transition-colors hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          )}

          {(status === "scanning" || status === "starting") && (
            <button
              type="button"
              onClick={onCancel}
              aria-label="Close scanner"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
