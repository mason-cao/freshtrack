"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatOneDReader } from "@zxing/browser";
import { motion } from "framer-motion";
import { Loader2, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Controls handle returned by ZXing's continuous decode; typed structurally so
// we don't depend on the interface's export name.
type ZxingControls = Awaited<ReturnType<BrowserMultiFormatOneDReader["decodeFromStream"]>>;

// Restrict the native detector to the 1D formats grocery products actually use.
// Fewer formats means faster, more reliable reads. The ZXing fallback uses the
// 1D-only reader, which is the equivalent restriction for browsers without the
// native API (iOS Safari, Firefox).
const NATIVE_FORMATS: BarcodeFormat[] = ["ean_13", "upc_a", "ean_8", "upc_e", "code_128"];

function supportsNativeDetector(): boolean {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

function describeCameraError(error: unknown): string {
  const name = error instanceof Error ? error.name : "";
  switch (name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access was blocked. Allow the camera in your browser settings, or enter the barcode by hand.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No camera was found on this device.";
    case "NotReadableError":
      return "The camera is already in use by another app.";
    default:
      return "We couldn't start the camera on this device.";
  }
}

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onCancel: () => void;
}

export function BarcodeScanner({ onDetected, onCancel }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<ZxingControls | null>(null);
  const nativeActiveRef = useRef(false);
  const nativeTimeoutRef = useRef<number | null>(null);
  const detectedRef = useRef(false);

  const [status, setStatus] = useState<"starting" | "scanning" | "error">("starting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stop = useCallback(() => {
    nativeActiveRef.current = false;
    if (nativeTimeoutRef.current !== null) {
      window.clearTimeout(nativeTimeoutRef.current);
      nativeTimeoutRef.current = null;
    }
    zxingControlsRef.current?.stop();
    zxingControlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const handleDetected = useCallback(
    (rawValue: string) => {
      if (detectedRef.current) return;
      const digits = rawValue.replace(/\D/g, "");
      if (digits.length < 8 || digits.length > 14) return; // ignore partial/garbage reads
      detectedRef.current = true;
      stop();
      onDetected(digits);
    },
    [onDetected, stop]
  );

  const startNativeLoop = useCallback(
    (video: HTMLVideoElement) => {
      const detector = new BarcodeDetector({ formats: NATIVE_FORMATS });
      nativeActiveRef.current = true;

      const tick = async () => {
        if (!nativeActiveRef.current) return;
        if (video.readyState >= 2) {
          try {
            const codes = await detector.detect(video);
            const raw = codes.find((code) => code.rawValue)?.rawValue;
            if (raw) {
              handleDetected(raw);
              return;
            }
          } catch {
            // transient per-frame decode errors are expected; keep scanning
          }
        }
        nativeTimeoutRef.current = window.setTimeout(tick, 250);
      };

      void tick();
    },
    [handleDetected]
  );

  const startZxing = useCallback(
    async (stream: MediaStream, video: HTMLVideoElement) => {
      const reader = new BrowserMultiFormatOneDReader();
      zxingControlsRef.current = await reader.decodeFromStream(stream, video, (result) => {
        if (result) handleDetected(result.getText());
      });
    },
    [handleDetected]
  );

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;

        if (supportsNativeDetector()) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
          startNativeLoop(video);
        } else {
          await startZxing(stream, video);
        }

        if (!cancelled) setStatus("scanning");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(describeCameraError(error));
      }
    }

    void start();

    return () => {
      cancelled = true;
      stop();
    };
  }, [startNativeLoop, startZxing, stop]);

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-stone-900 sm:aspect-square">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
      />

      {status === "scanning" && (
        <>
          {/* Framing reticle */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-40 w-[80%] max-w-xs rounded-xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
              <motion.div
                className="absolute inset-x-2 h-0.5 rounded-full bg-sage-400 shadow-[0_0_12px_2px_rgba(125,166,127,0.8)]"
                initial={{ top: "8%" }}
                animate={{ top: ["8%", "92%", "8%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-4 pb-5 pt-10 text-sm font-medium text-white">
            <ScanLine className="h-4 w-4" />
            Point the camera at a barcode
          </div>
        </>
      )}

      {status === "starting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900 text-white/80">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Starting the camera…</p>
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-stone-900 px-6 text-center text-white/90">
          <p className="text-sm leading-relaxed">{errorMessage}</p>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Close
          </Button>
        </div>
      )}

      {status !== "error" && (
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close scanner"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
