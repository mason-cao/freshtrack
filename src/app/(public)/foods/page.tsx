import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronRight, Leaf } from "lucide-react";
import { foods, type FoodCategory, type FoodPageData } from "@/lib/foods";
import { getFoodImage } from "@/lib/food-images";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://freshtrack.up.railway.app";

const categoryOrder: FoodCategory[] = [
  "produce",
  "dairy",
  "meat",
  "seafood",
  "bakery",
  "grains",
];

const categoryLabels: Record<FoodCategory, string> = {
  produce: "Produce",
  dairy: "Dairy & eggs",
  meat: "Meat & poultry",
  seafood: "Seafood",
  bakery: "Bakery",
  grains: "Grains",
};

const categoryBlurbs: Record<FoodCategory, string> = {
  produce: "Fresh produce wilts the fastest. The right paper towel, the right drawer, and the right neighbors can double shelf life.",
  dairy: "Dairy is more durable than the sell-by date suggests, but only if the temperature stays cold and stable.",
  meat: "Raw poultry has the shortest fridge window of common proteins. The food safety rules are mostly about timing and handling.",
  seafood: "Fresh fish has a tight window. Time and temperature matter more than appearance, and the freezer is the right answer when you cannot cook it promptly.",
  bakery: "Bread storage is counterintuitive. The fridge actually accelerates staling, and visible mold means the whole loaf goes.",
  grains: "Cooked grains carry food safety considerations most people miss. Cool fast, refrigerate fast, reheat hot.",
};

function groupByCategory(items: FoodPageData[]) {
  const groups = new Map<FoodCategory, FoodPageData[]>();
  for (const food of items) {
    const existing = groups.get(food.category) ?? [];
    existing.push(food);
    groups.set(food.category, existing);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
  return groups;
}

export const metadata: Metadata = {
  title: "Food shelf life and storage guides · FreshTrack",
  description:
    "How long common foods last, how to store them, and how to tell when they have gone bad. Free guides for busy households, sourced from USDA FoodKeeper.",
  alternates: { canonical: "/foods" },
  openGraph: {
    type: "website",
    title: "Food shelf life and storage guides · FreshTrack",
    description:
      "How long common foods last, how to store them, and how to tell when they have gone bad. Free guides for busy households, sourced from USDA FoodKeeper.",
    url: `${siteUrl}/foods`,
  },
};

export default function FoodsIndexPage() {
  const ctaHref = "/login";
  const ctaLabel = "Sign in with Google";

  const groups = groupByCategory(foods);
  const activeCategories = categoryOrder.filter((cat) => groups.has(cat));

  return (
    <>
      <LandingNav isAuthenticated={false} />

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

          <div className="relative mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
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

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div className="max-w-3xl">
                <p className="eyebrow text-sage-700">
                  <Leaf className="mr-1.5 inline-block h-3.5 w-3.5" />
                  Shelf life and storage guides
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                  How long does food last? Honest answers, by item.
                </h1>
                <p className="mt-5 text-base leading-relaxed text-stone-600 sm:text-lg">
                  Concrete shelf life numbers, storage tips that actually work,
                  and how to tell when an item has crossed the line. Sourced
                  from USDA FoodKeeper, USDA FSIS, and academic postharvest
                  research.
                </p>
              </div>

              <dl className="grid grid-cols-3 gap-3 lg:max-w-sm">
                <div className="rounded-2xl bg-warm-white p-4 ring-1 ring-warm-100">
                  <dt className="eyebrow text-stone-500">Guides</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
                    {foods.length}
                  </dd>
                </div>
                <div className="rounded-2xl bg-warm-white p-4 ring-1 ring-warm-100">
                  <dt className="eyebrow text-stone-500">Categories</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight text-stone-900">
                    {activeCategories.length}
                  </dd>
                </div>
                <div className="rounded-2xl bg-warm-white p-4 ring-1 ring-warm-100">
                  <dt className="eyebrow text-stone-500">Cost</dt>
                  <dd className="mt-1 text-2xl font-bold tracking-tight text-sage-700">
                    Free
                  </dd>
                </div>
              </dl>
            </div>

            {/* CATEGORY CHIP NAV */}
            <nav
              aria-label="Jump to category"
              className="mt-10 flex flex-wrap gap-2"
            >
              {activeCategories.map((cat) => (
                <a
                  key={cat}
                  href={`#${cat}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-warm-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-warm-100 transition-all duration-200 hover:translate-y-[-1px] hover:bg-sage-50 hover:text-sage-700 hover:ring-sage-100"
                >
                  {categoryLabels[cat]}
                  <span className="text-stone-400">{groups.get(cat)?.length}</span>
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* CATEGORY SECTIONS */}
        <div className="bg-warm-white">
          {activeCategories.map((cat, sectionIndex) => {
            const items = groups.get(cat) ?? [];
            return (
              <section
                key={cat}
                id={cat}
                className={`scroll-mt-24 ${
                  sectionIndex % 2 === 0 ? "bg-warm-white" : "bg-cream"
                }`}
              >
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                  <Reveal>
                    <div className="flex items-end justify-between gap-6">
                      <div className="max-w-2xl">
                        <p className="eyebrow text-sage-700">
                          {String(sectionIndex + 1).padStart(2, "0")} ·{" "}
                          {categoryLabels[cat]}
                        </p>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                          {categoryLabels[cat]}.
                        </h2>
                        <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
                          {categoryBlurbs[cat]}
                        </p>
                      </div>
                      <p className="hidden text-sm text-stone-500 sm:block">
                        {items.length} {items.length === 1 ? "guide" : "guides"}
                      </p>
                    </div>
                  </Reveal>

                  <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((food, i) => (
                      <Reveal key={food.slug} delay={0.04 * i}>
                        <Link
                          href={`/foods/${food.slug}`}
                          className="group block h-full overflow-hidden rounded-3xl bg-warm-white shadow-warm-sm ring-1 ring-warm-100 transition-shadow duration-300 hover:shadow-warm-lg"
                        >
                          <div className="relative h-40 w-full overflow-hidden bg-warm-50 sm:h-44">
                            <Image
                              src={getFoodImage(food.imageKey)}
                              alt={food.imageAlt}
                              fill
                              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex items-start justify-between gap-4 p-5">
                            <div className="min-w-0 flex-1">
                              <p className="eyebrow text-stone-500">
                                {categoryLabels[food.category]}
                              </p>
                              <h3 className="mt-1 text-lg font-bold tracking-tight text-stone-900 group-hover:text-sage-700">
                                {food.displayName}
                              </h3>
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
            );
          })}
        </div>

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
                <p className="inline-flex items-center gap-2 rounded-full bg-warm-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-warm-white ring-1 ring-warm-white/20">
                  <Leaf className="h-3.5 w-3.5" />
                  The whole pitch
                </p>
                <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-warm-white sm:text-4xl">
                  Track these foods in your actual kitchen.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-warm-white sm:text-lg">
                  FreshTrack surfaces items before they expire, suggests recipes
                  that use what is about to go off, and tracks money saved over
                  time. Free to use.
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
