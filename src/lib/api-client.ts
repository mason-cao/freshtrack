export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

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

  return response.json() as Promise<T>;
}
