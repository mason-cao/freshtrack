import Link from "next/link";
import { cn } from "@/lib/utils";

export function FooterLegal({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8",
        className
      )}
    >
      <p>FreshTrack keeps pantry tracking practical and account-based.</p>
      <nav className="flex items-center gap-4" aria-label="Legal">
        <Link href="/privacy" className="font-medium text-sage-700 hover:text-sage-800">
          Privacy
        </Link>
        <Link href="/terms" className="font-medium text-sage-700 hover:text-sage-800">
          Terms
        </Link>
      </nav>
    </footer>
  );
}
