import { sanitizeBarcode } from "./barcode";

type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };
type TorchConstraints = MediaTrackConstraintSet & { torch?: boolean };
const NATIVE_FORMATS: BarcodeFormat[] = ["ean_13", "upc_a", "ean_8", "upc_e", "code_128"];

export function describeCameraError(error: unknown): string {
  switch (error instanceof Error ? error.name : "") {
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

export async function startBarcodeCamera(
  video: HTMLVideoElement,
  signal: AbortSignal,
  onDetected: (barcode: string) => void
) {
  let stream: MediaStream | undefined;
  let controls: { stop: () => void } | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = signal.aborted;
  let pendingCode: string | null = null;

  function stop() {
    stopped = true;
    clearTimeout(timer);
    controls?.stop();
    stream?.getTracks().forEach((track) => track.stop());
    if (video.srcObject === stream) video.srcObject = null;
    signal.removeEventListener("abort", stop);
  }

  function accept(rawValue: string) {
    if (stopped) return;
    const code = sanitizeBarcode(rawValue.replace(/\D/g, ""));
    if (!code) return;
    // A second matching frame avoids accepting an isolated misread.
    if (pendingCode !== code) {
      pendingCode = code;
      return;
    }
    stop();
    onDetected(code);
  }

  signal.addEventListener("abort", stop, { once: true });
  try {
    signal.throwIfAborted();
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }, audio: false,
    });
    if (stopped) { stop(); return null; }
    const track = stream.getVideoTracks()[0];
    const torchSupported = Boolean((track?.getCapabilities?.() as TorchCapabilities)?.torch);

    if ("BarcodeDetector" in globalThis) {
      const detector = new BarcodeDetector({ formats: NATIVE_FORMATS });
      video.srcObject = stream;
      await video.play();
      if (stopped) { stop(); return null; }
      const tick = async () => {
        if (stopped) return;
        if (video.readyState >= 2) {
          try {
            const codes = await detector.detect(video);
            const raw = codes.find((code) => code.rawValue)?.rawValue;
            if (raw) accept(raw);
          } catch {
            // A frame without a decodable barcode is expected.
          }
        }
        if (!stopped) timer = setTimeout(tick, 250);
      };
      void tick();
    } else {
      const { BrowserMultiFormatOneDReader } = await import("@zxing/browser");
      if (stopped) { stop(); return null; }
      controls = await new BrowserMultiFormatOneDReader().decodeFromStream(stream, video, (result) => {
        if (result) accept(result.getText());
      });
      // Decoding may finish starting after unmount or after a successful read.
      if (stopped) { stop(); return null; }
    }
    return {
      torchSupported,
      setTorch: (on: boolean) => track.applyConstraints({ advanced: [{ torch: on } as TorchConstraints] }),
    };
  } catch (error) {
    stop();
    throw error;
  }
}
