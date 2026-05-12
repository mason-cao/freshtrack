import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Apple, Leaf } from "lucide-react";
import { getHeroImage } from "@/lib/food-images";

interface LandingHeroProps {
  isAuthenticated: boolean;
}

export function LandingHero({ isAuthenticated }: LandingHeroProps) {
  const ctaHref = isAuthenticated ? "/app" : "/login";
  const ctaLabel = isAuthenticated ? "Open your kitchen" : "Sign in with Google";

  return (
    <section className="relative isolate overflow-hidden bg-sage-500 text-warm-white">
      {/* Soft warm wash to keep the sage from feeling flat. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(110% 70% at 78% 25%, rgba(255, 247, 222, 0.30) 0%, rgba(255, 247, 222, 0) 55%), radial-gradient(80% 60% at 15% 95%, rgba(15, 35, 15, 0.25) 0%, rgba(15, 35, 15, 0) 60%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-24 lg:px-8 lg:pt-36 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-warm-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sage-50 backdrop-blur-sm ring-1 ring-warm-white/20">
              <Leaf className="h-3.5 w-3.5" />
              A kitchen ledger
            </p>

            <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight text-warm-white sm:text-5xl lg:text-6xl">
              Stop throwing out groceries.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-sage-50/90 sm:text-lg">
              FreshTrack is a free pantry tracker that shows what&apos;s about to expire,
              suggests recipes to use it up, and tells you how much you&apos;ve saved. Built
              for busy households, not factory inventory.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={ctaHref}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-warm-white px-5 text-sm font-semibold text-sage-700 shadow-warm-lg transition-all duration-200 hover:translate-y-[-1px] hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-sage-500"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-warm-white/30 bg-warm-white/5 px-5 text-sm font-semibold text-warm-white transition-colors duration-200 hover:bg-warm-white/10"
              >
                See how it works
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-sage-50/80">
              <li className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-warm-white/70" aria-hidden />
                Free forever
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-warm-white/70" aria-hidden />
                No app store
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-warm-white/70" aria-hidden />
                Your data stays in your account
              </li>
            </ul>
          </div>

          <div className="relative">
            {/* Editorial inset: real produce photo + a single composed "use today" badge. */}
            <div className="relative aspect-[5/6] overflow-hidden rounded-3xl shadow-warm-lg ring-1 ring-warm-white/20">
              <Image
                src={getHeroImage("seasonal produce", "Produce")}
                alt="Fresh leafy greens on a kitchen counter"
                fill
                priority
                sizes="(min-width: 1024px) 460px, (min-width: 640px) 80vw, 90vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/45 via-stone-900/0 to-stone-900/0" />
            </div>

            <div className="absolute -bottom-6 -left-4 w-[min(280px,80%)] rounded-2xl bg-warm-white p-4 shadow-warm-lg ring-1 ring-warm-100 sm:-left-6">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Apple className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="eyebrow text-stone-500">Use today</p>
                  <p className="mt-1 text-sm font-semibold text-stone-900">
                    Spinach, Greek yogurt
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Recipe ready: 25 minutes, four servings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
