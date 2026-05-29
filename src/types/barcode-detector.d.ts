// Minimal ambient types for the native Barcode Detection API.
// Not yet part of TypeScript's DOM lib; we declare only what the scanner uses.
// https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector

type BarcodeFormat =
  | "aztec"
  | "code_128"
  | "code_39"
  | "code_93"
  | "codabar"
  | "data_matrix"
  | "ean_13"
  | "ean_8"
  | "itf"
  | "pdf417"
  | "qr_code"
  | "upc_a"
  | "upc_e"
  | "unknown";

interface DetectedBarcode {
  readonly boundingBox: DOMRectReadOnly;
  readonly rawValue: string;
  readonly format: BarcodeFormat;
  readonly cornerPoints: ReadonlyArray<{ x: number; y: number }>;
}

interface BarcodeDetectorOptions {
  formats?: BarcodeFormat[];
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions);
  static getSupportedFormats(): Promise<BarcodeFormat[]>;
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}
