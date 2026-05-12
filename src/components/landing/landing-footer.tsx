import Link from "next/link";
import { Leaf } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-warm-100 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sage-500 text-warm-white shadow-warm-sm">
            <Leaf className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-stone-900">FreshTrack</p>
            <p className="text-xs text-stone-500">A kitchen ledger.</p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm text-stone-600">
          <Link href="/privacy" className="transition-colors hover:text-stone-900">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-stone-900">
            Terms
          </Link>
          <Link href="/login" className="transition-colors hover:text-stone-900">
            Sign in
          </Link>
        </nav>

        <p className="text-xs text-stone-400">
          © {new Date().getFullYear()} FreshTrack
        </p>
      </div>
    </footer>
  );
}
