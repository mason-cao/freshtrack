export type LimitedJsonBodyResult =
  | { ok: true; body: unknown }
  | { ok: false; status: 400 | 413 | 415; error: string };

type ReadableBodySource = Pick<Request, "body" | "headers">;

export function isRequestBodyOverLimit(
  request: ReadableBodySource,
  maxBytes: number
): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;

  const byteLength = Number(contentLength);
  return Number.isFinite(byteLength) && byteLength > maxBytes;
}

/**
 * Read JSON without first buffering an unbounded request body in memory.
 * Content-Length is only an early rejection hint; streamed bytes are always
 * counted because clients can omit or forge that header.
 */
export async function readLimitedJsonBody(
  request: ReadableBodySource,
  maxBytes: number,
  options: { requireJsonContentType?: boolean } = {}
): Promise<LimitedJsonBodyResult> {
  if (
    options.requireJsonContentType &&
    !request.headers.get("content-type")?.toLowerCase().includes("application/json")
  ) {
    return {
      ok: false,
      status: 415,
      error: "Content-Type must be application/json.",
    };
  }

  if (isRequestBodyOverLimit(request, maxBytes)) {
    return { ok: false, status: 413, error: "Request body is too large." };
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return { ok: false, status: 400, error: "Invalid JSON body." };
  }

  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    byteLength += value.byteLength;
    if (byteLength > maxBytes) {
      await reader.cancel().catch(() => undefined);
      return { ok: false, status: 413, error: "Request body is too large." };
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();

  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body." };
  }
}
