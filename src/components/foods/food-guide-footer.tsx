import type { FoodPageData } from "@/lib/foods";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

export function FoodGuideFooter({ food }: { food: FoodPageData }) {
  const lowerName = food.displayName.toLowerCase();
  const ctaHref = "/login";
  const ctaLabel = "Sign in with Google";
  return (
    <>
      <section className="relative isolate overflow-hidden bg-sage-500 text-warm-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(80% 60% at 20% 0%, rgba(255, 247, 222, 0.20) 0%, rgba(255, 247, 222, 0) 60%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-warm-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-warm-white ring-1 ring-warm-white/20">
                <Leaf className="h-3.5 w-3.5" />
                A kitchen ledger
              </p>
              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-warm-white sm:text-4xl">
                Stop wasting {lowerName}.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-warm-white sm:text-lg">
                FreshTrack is a free pantry tracker that surfaces items
                before they expire, ranks recipes by what you already have,
                and tracks money saved over time. Built for busy households,
                not factory inventory.
              </p>
              <Link
                href={ctaHref}
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-warm-white px-6 text-sm font-semibold text-sage-700 shadow-warm-lg transition-all duration-200 hover:translate-y-[-1px] hover:bg-cream"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {food.sources.length > 0 && (
        <section className="bg-warm-white">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
            <p className="eyebrow text-stone-500">Sources</p>
            <ul className="mt-3 space-y-1.5 text-sm text-stone-500">
              {food.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 transition-colors hover:text-stone-900"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
