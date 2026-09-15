export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const timeout = AbortSignal.timeout(15_000);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  let response: Response;

  try {
    response = await fetch(input, {
      cache: "no-store",
      ...init,
      signal,
    });
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    if (timeout.aborted) {
      throw new Error("The request took too long. Check your connection and try again.");
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw new Error("You appear to be offline. Reconnect and try again.");
    }
    throw new Error(
      error instanceof Error && error.message
        ? `Network error: ${error.message}`
        : "A network error interrupted the request."
    );
  }

  signal.throwIfAborted();

  if (!response.ok) {
    // An expired session means every subsequent call fails; send the user
    // back to sign-in instead of surfacing raw fetch errors on each widget.
    if (response.status === 401 && typeof window !== "undefined") {
      window.location.assign("/login");
      throw new Error("Your session expired. Redirecting to sign-in…");
    }
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? `Request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("The server returned an unexpected response.");
  }

  return response.json() as Promise<T>;
}
