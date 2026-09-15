import { afterEach, describe, expect, it, vi } from "vitest";
import { startBarcodeCamera } from "./barcode-camera";

const decode = vi.hoisted(() => vi.fn());
vi.mock("@zxing/browser", () => ({ BrowserMultiFormatOneDReader: class { decodeFromStream = decode; } }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
function fixture() {
  const stop = vi.fn();
  const track = { stop, getCapabilities: () => ({ torch: true }), applyConstraints: vi.fn() };
  const stream = { getTracks: () => [track], getVideoTracks: () => [track] } as unknown as MediaStream;
  const video = { srcObject: null, readyState: 2, play: vi.fn(async () => {}) } as unknown as HTMLVideoElement;
  vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: vi.fn(async () => stream) } });
  return { stop, track, stream, video };
}
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); decode.mockReset(); });

describe("barcode camera ownership", () => {
  it("releases a stream that arrives after cancellation", async () => {
    const { stop, stream, video } = fixture();
    const media = deferred<MediaStream>();
    vi.stubGlobal("navigator", { mediaDevices: { getUserMedia: () => media.promise } });
    const request = new AbortController();
    const detected = vi.fn();
    const session = startBarcodeCamera(video, request.signal, detected);
    request.abort();
    media.resolve(stream);
    expect(await session).toBeNull();
    expect(stop).toHaveBeenCalled();
    expect(detected).not.toHaveBeenCalled();
  });

  it("does not start native decoding after canceled video playback", async () => {
    const { stop, video } = fixture();
    const playback = deferred<void>();
    video.play = () => playback.promise;
    const detect = vi.fn();
    vi.stubGlobal("BarcodeDetector", class { detect = detect; });
    const request = new AbortController();
    const session = startBarcodeCamera(video, request.signal, vi.fn());
    await Promise.resolve();
    request.abort();
    playback.resolve();
    expect(await session).toBeNull();
    expect(stop).toHaveBeenCalled();
    expect(detect).not.toHaveBeenCalled();
  });

  it("stops fallback controls that finish starting after cancellation", async () => {
    const { stop, video } = fixture();
    const started = deferred<{ stop: () => void }>();
    const decoding = deferred<void>();
    decode.mockImplementation(() => { decoding.resolve(); return started.promise; });
    const request = new AbortController();
    const session = startBarcodeCamera(video, request.signal, vi.fn());
    await decoding.promise;
    request.abort();
    const stopDecoder = vi.fn();
    started.resolve({ stop: stopDecoder });
    expect(await session).toBeNull();
    expect(stop).toHaveBeenCalled();
    expect(stopDecoder).toHaveBeenCalledOnce();
  });

  it("requires two matching reads, then closes the camera and emits once", async () => {
    vi.useFakeTimers();
    const { stop, video } = fixture();
    const detect = vi.fn(async () => [{ rawValue: "012345678901" }]);
    vi.stubGlobal("BarcodeDetector", class { detect = detect; });
    const detected = vi.fn();
    const request = new AbortController();
    await startBarcodeCamera(video, request.signal, detected);
    expect(detected).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(250);
    expect(detected).toHaveBeenCalledExactlyOnceWith("012345678901");
    expect(stop).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    expect(detect).toHaveBeenCalledTimes(2);
  });

  it("cleans up on startup failure", async () => {
    const { stop, video } = fixture();
    decode.mockRejectedValueOnce(new Error("Decoder failed"));
    await expect(startBarcodeCamera(video, new AbortController().signal, vi.fn())).rejects.toThrow("Decoder failed");
    expect(stop).toHaveBeenCalled();
  });
});
