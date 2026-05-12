import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, Leaf } from "lucide-react";
import { auth } from "@/auth";
import { foods } from "@/lib/foods";
import { getFoodImage } from "@/lib/food-images";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://freshtrack.up.railway.app";

export const metadata: Metadata = {
  title: "Food shelf life and storage guides · FreshTrack",
  description:
    "How long common foods last, how to store them, and how to tell when they have gone bad. Free guides for busy households.",
  alternates: { canonical: "/foods" },
  openGraph: {
    type: "website",
    title: "Food shelf life and storage guides · FreshTrack",
    description:
      "How long common foods last, how to store them, and how to tell when they have gone bad. Free guides for busy households.",
    url: `${siteUrl}/foods`,
  },
};

export default async function FoodsIndexPage() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);
  const ctaHref = isAuthenticated ? "/app" : "/login";
  const ctaLabel = isAuthenticated ? "Open your kitchen" : "Sign in with Google";

  return (
    <>
      <LandingNav isAuthenticated={isAuthenticated} />

      <main id="main-content">
        {/* HERO */}
        <section className="relative isolate overflow-hidden bg-cream pt-24 sm:pt-28 lg:pt-32">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(70% 50% at 80% 20%, rgba(82, 122, 82, 0.10) 0%, rgba(82, 122, 82, 0) 60%)",
            }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-stone-500">
                <li>
                  <Link href="/" className="transition-colors hover:text-stone-900">
                    Home
                  </Link>
                </li>
                <ChevronRight className="h-3 w-3 text-stone-400" aria-hidden />
                <li className="text-stone-900" aria-current="page">
                  Foods
                </li>
              </ol>
            </nav>

            <div className="mt-8 max-w-3xl">
              <p className="eyebrow text-sage-700">
                <Leaf className="mr-1.5 inline-block h-3.5 w-3.5" />
                Shelf life and storage guides
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                How long does food last? Honest answers, by item.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-stone-600 sm:text-lg">
                Concrete shelf life numbers, storage tips that actually work,
                and how to tell when an item has crossed the line. Sourced from
                USDA FoodKeeper and academic postharvest research.
              </p>
            </div>
          </div>
        </section>

        {/* FOOD GRID */}
        <section className="bg-warm-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {foods.map((food, i) => (
                <Reveal key={food.slug} delay={0.04 * i}>
                  <Link
                    href={`/foods/${food.slug}`}
                    className="group block overflow-hidden rounded-3xl bg-warm-white shadow-warm-sm ring-1 ring-warm-100 transition-shadow duration-300 hover:shadow-warm-lg"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-warm-50">
                      <Image
                        src={getFoodImage(food.imageKey)}
                        alt={food.imageAlt}
                        fill
                        sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4 p-5">
                      <div>
                        <p className="eyebrow text-stone-500">
                          {food.category.charAt(0).toUpperCase() +
                            food.category.slice(1)}
                        </p>
                        <h2 className="mt-1 text-lg font-bold tracking-tight text-stone-900 group-hover:text-sage-700">
                          {food.displayName}
                        </h2>
                        <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                          {food.intro}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-stone-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-sage-700" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
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
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-warm-white sm:text-4xl">
                  Track these foods in your actual kitchen.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-sage-50/90 sm:text-lg">
                  FreshTrack surfaces items before they expire, suggests recipes
                  that use what is about to go off, and tracks money saved over
                  time. Free forever.
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
      </main>

      <LandingFooter />
    </>
  );
}
