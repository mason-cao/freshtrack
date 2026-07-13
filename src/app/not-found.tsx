import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-cream px-4 py-12"
    >
      <div className="w-full max-w-md rounded-2xl border border-warm-100 bg-warm-white p-7 text-center shadow-warm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sage-50 text-sage-700">
          <Leaf className="h-6 w-6" aria-hidden="true" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-sage-700">
          404 · Not found
        </p>
        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          This page is not in the pantry
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          The address may be outdated or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-sage-500 px-4 text-sm font-semibold text-warm-white hover:bg-sage-600"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to FreshTrack
        </Link>
      </div>
    </main>
  );
}
