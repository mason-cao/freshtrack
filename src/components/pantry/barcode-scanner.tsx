"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flashlight, FlashlightOff, Keyboard, Loader2, ScanLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Controls handle returned by ZXing's continuous decode; typed structurally so
// we don't depend on the interface's export name.
type ZxingControls = { stop: () => void };

// The torch (flashlight) capability isn't in the standard DOM types yet.
interface TorchCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}
interface TorchConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
}

// Restrict the native detector to the 1D formats grocery products actually use.
// Fewer formats means faster, more reliable reads. The ZXing fallback uses the
// 1D-only reader, which is the equivalent restriction for browsers without the
// native API (iOS Safari, Firefox).
const NATIVE_FORMATS: BarcodeFormat[] = ["ean_13", "upc_a", "ean_8", "upc_e", "code_128"];

function supportsNativeDetector(): boolean {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

function isPlausibleBarcode(digits: string): boolean {
  return digits.length >= 8 && digits.length <= 14;
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

type Status = "starting" | "scanning" | "error" | "manual";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onCancel: () => void;
}

export function BarcodeScanner({ onDetected, onCancel }: BarcodeScannerProps) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<ZxingControls | null>(null);
  const nativeActiveRef = useRef(false);
  const nativeTimeoutRef = useRef<number | null>(null);
  const detectedRef = useRef(false);
  // Last plausible read awaiting a confirming second read (cuts misreads).
  const pendingCodeRef = useRef<string | null>(null);

  // Keep the latest onDetected without re-running the camera effect when the
  // parent re-renders with a new callback identity.
  const onDetectedRef = useRef(onDetected);
  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const [status, setStatus] = useState<Status>("starting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);

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
      if (!isPlausibleBarcode(digits)) return;

      // Require two matching reads before accepting, so a single misread frame
      // can't send the user to the wrong product.
      if (pendingCodeRef.current !== digits) {
        pendingCodeRef.current = digits;
        return;
      }

      detectedRef.current = true;
      stop();
      if (!reduceMotion) {
        navigator.vibrate?.(60);
        void import("canvas-confetti")
          .then(({ default: confetti }) =>
            confetti({
              particleCount: 36,
              spread: 55,
              origin: { x: 0.5, y: 0.45 },
              colors: ["#527a52", "#b8cdb8", "#d97706"],
              disableForReducedMotion: true,
            })
          )
          .catch(() => undefined);
      }
      onDetectedRef.current(digits);
    },
    [reduceMotion, stop]
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
            if (raw) handleDetected(raw);
          } catch {
            // transient per-frame decode errors are expected; keep scanning
          }
        }
        if (nativeActiveRef.current) {
          nativeTimeoutRef.current = window.setTimeout(tick, 250);
        }
      };

      void tick();
    },
    [handleDetected]
  );

  const startZxing = useCallback(
    async (stream: MediaStream, video: HTMLVideoElement) => {
      // Most Chromium browsers use the native detector. Load ZXing only for
      // browsers that actually need the fallback (notably Safari/Firefox).
      const { BrowserMultiFormatOneDReader } = await import("@zxing/browser");
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
      detectedRef.current = false;
      pendingCodeRef.current = null;
      setStatus("starting");
      setErrorMessage(null);
      setTorchOn(false);
      setTorchSupported(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("error");
        setErrorMessage("This browser can't open the camera. Enter the barcode by hand instead.");
        return;
      }

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

        const track = stream.getVideoTracks()[0];
        const capabilities = track?.getCapabilities?.() as TorchCapabilities | undefined;
        if (!cancelled) setTorchSupported(Boolean(capabilities?.torch));

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
  }, [restartKey, startNativeLoop, startZxing, stop]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as TorchConstraintSet] });
      setTorchOn(next);
    } catch {
      // some devices report torch support but reject the constraint; ignore
    }
  }, [torchOn]);

  const openManual = useCallback(() => {
    stop();
    setManualError(null);
    setStatus("manual");
  }, [stop]);

  const restartScanning = useCallback(() => {
    setStatus("starting");
    setRestartKey((key) => key + 1);
  }, []);

  function handleManualSubmit(event: React.FormEvent) {
    event.preventDefault();
    const digits = manualValue.replace(/\D/g, "");
    if (!isPlausibleBarcode(digits)) {
      setManualError("Enter the 8–14 digit number printed beneath the barcode.");
      return;
    }
    onDetectedRef.current(digits);
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
              {/* Framing reticle */}
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
                  <Button type="button" variant="secondary" size="sm" onClick={openManual}>
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
                <Button size="sm" onClick={openManual}>
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
