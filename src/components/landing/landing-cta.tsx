import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { Reveal } from "./reveal";

interface LandingCtaProps {
  isAuthenticated: boolean;
}

const promises = [
  {
    title: "Free to use",
    body: "There is currently no paywall, paid tier, or advertising in FreshTrack.",
  },
  {
    title: "No app store",
    body: "Add it to your home screen from any browser. Works on phone and desktop.",
  },
  {
    title: "Your kitchen, your data",
    body: "Your pantry and waste history are scoped to your Google account and are not sold or used for advertising.",
  },
];

export function LandingCta({ isAuthenticated }: LandingCtaProps) {
  const ctaHref = isAuthenticated ? "/app" : "/login";
  const ctaLabel = isAuthenticated ? "Open your kitchen" : "Sign in with Google";

  return (
    <section id="free" className="relative isolate overflow-hidden bg-sage-500 text-warm-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(90% 60% at 20% 0%, rgba(255, 247, 222, 0.30) 0%, rgba(255, 247, 222, 0) 55%), radial-gradient(80% 60% at 90% 100%, rgba(15, 35, 15, 0.30) 0%, rgba(15, 35, 15, 0) 60%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <Reveal>
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-warm-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-warm-white ring-1 ring-warm-white/20">
              <Leaf className="h-3.5 w-3.5" />
              The whole pitch
            </p>
            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-warm-white sm:text-4xl lg:text-5xl">
              Free to use. No paywall, no ads.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-warm-white sm:text-lg">
              FreshTrack is one person&apos;s project, kept free on purpose. Sign in,
              start tracking, see what changes. That&apos;s the whole pitch.
            </p>
          </div>
        </Reveal>

        <dl className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-10">
          {promises.map((promise, i) => (
            <Reveal key={promise.title} delay={0.1 + i * 0.08}>
              <div className="border-t border-warm-white/25 pt-5">
                <dt className="text-base font-semibold text-warm-white">{promise.title}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-warm-white">
                  {promise.body}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={0.3} className="mt-14 flex flex-wrap items-center gap-4">
          <Link
            href={ctaHref}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-warm-white px-6 text-sm font-semibold text-sage-700 shadow-warm-lg transition-all duration-200 hover:translate-y-[-1px] hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-sage-500"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-warm-white">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-warm-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-warm-white">
              Privacy
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}
