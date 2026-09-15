"use client";

import { useEffect, useRef, useState } from "react";
import { describeCameraError, startBarcodeCamera } from "@/lib/barcode-camera";

type Camera = NonNullable<Awaited<ReturnType<typeof startBarcodeCamera>>>;
type Status = "starting" | "scanning" | "error" | "manual";

export function useBarcodeCamera(onDetected: (barcode: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const callback = useRef(onDetected);
  const controller = useRef<AbortController | null>(null);
  const camera = useRef<Camera | null>(null);
  const [attempt, setAttempt] = useState<number | null>(0);
  const [status, setStatus] = useState<Status>("starting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => { callback.current = onDetected; }, [onDetected]);

  useEffect(() => {
    if (attempt === null || !videoRef.current) return;
    const request = new AbortController();
    controller.current = request;
    setStatus("starting");
    setErrorMessage(null);
    setTorchSupported(false);
    setTorchOn(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error");
      setErrorMessage("This browser can't open the camera. Enter the barcode by hand instead.");
      return;
    }
    startBarcodeCamera(videoRef.current, request.signal, (code) => callback.current(code)).then(
      (session) => {
        if (request.signal.aborted || !session) return;
        camera.current = session;
        setTorchSupported(session.torchSupported);
        setStatus("scanning");
      },
      (error: unknown) => {
        if (request.signal.aborted) return;
        setStatus("error");
        setErrorMessage(describeCameraError(error));
      }
    );
    return () => {
      request.abort();
      camera.current = null;
    };
  }, [attempt]);

  async function toggleTorch() {
    const session = camera.current;
    if (!session) return;
    const next = !torchOn;
    try {
      await session.setTorch(next);
      if (camera.current === session) setTorchOn(next);
    } catch {
      // Some cameras advertise torch support but reject the constraint.
    }
  }

  function openManual() {
    controller.current?.abort();
    setAttempt(null);
    setStatus("manual");
  }

  function restartScanning() {
    setStatus("starting");
    setAttempt((value) => (value ?? -1) + 1);
  }

  return { videoRef, status, errorMessage, torchSupported, torchOn, toggleTorch, openManual, restartScanning };
}
