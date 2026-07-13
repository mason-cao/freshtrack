"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("FreshTrack render error", error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-[70vh] items-center justify-center bg-cream px-4 py-12"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-warm-100 bg-warm-white p-6 text-center shadow-warm"
        role="alert"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-50 text-terracotta-700">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-stone-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          The page could not be completed. Your saved pantry data has not been changed.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sage-500 px-4 text-sm font-semibold text-warm-white hover:bg-sage-600"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg border border-warm-200 px-4 text-sm font-semibold text-stone-700 hover:bg-warm-50"
          >
            Go to FreshTrack
          </Link>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-stone-500">Reference: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
