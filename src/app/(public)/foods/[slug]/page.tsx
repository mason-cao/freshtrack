import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Leaf,
  ChefHat,
  AlertTriangle,
} from "lucide-react";
import {
  foods,
  getFoodBySlug,
  getRelatedFoods,
  type FoodPageData,
} from "@/lib/foods";
import { starterRecipeSeedData } from "@/db/starter-recipes";
import { getFoodImage, getRecipeHeroImage } from "@/lib/food-images";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingFooter } from "@/components/landing/landing-footer";
import { Reveal } from "@/components/landing/reveal";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { serializeJsonLd } from "@/lib/structured-data";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.AUTH_URL ??
  "https://freshtrack.up.railway.app";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return foods.map((food) => ({ slug: food.slug }));
}

export function buildFoodMetadataTitle(food: Pick<FoodPageData, "h1">): string {
  return food.h1.replace(/\.$/, "");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const food = getFoodBySlug(slug);
  if (!food) {
    return { title: "Not found" };
  }
  const title = buildFoodMetadataTitle(food);
  return {
    title,
    description: food.metaDescription,
    alternates: { canonical: `/foods/${food.slug}` },
    openGraph: {
      type: "article",
      title,
      description: food.metaDescription,
      url: `${siteUrl}/foods/${food.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: food.metaDescription,
    },
  };
}

function getMatchedRecipes(food: FoodPageData) {
  const targets = food.recipeMatchIngredients.map((n) => n.toLowerCase());
  return starterRecipeSeedData.filter((recipe) =>
    recipe.ingredients.some((ing) =>
      targets.some((target) => ing.ingredientName.toLowerCase().includes(target))
    )
  );
}

function buildStructuredData(food: FoodPageData) {
  const url = `${siteUrl}/foods/${food.slug}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Foods",
        item: `${siteUrl}/foods`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: food.displayName,
        item: url,
      },
    ],
  };

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to store ${food.displayName.toLowerCase()} for maximum freshness`,
    description: food.intro,
    step: food.storageTips.map((tip, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text: tip,
    })),
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: food.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return [breadcrumb, howTo, faqPage];
}

export default async function FoodPage({ params }: PageProps) {
  const { slug } = await params;
  const food = getFoodBySlug(slug);
  if (!food) notFound();

  const ctaHref = "/login";
  const ctaLabel = "Sign in with Google";

  const matchedRecipes = getMatchedRecipes(food);
  const relatedFoods = getRelatedFoods(food.slug);
  const heroImage = getFoodImage(food.imageKey, "Produce");
  const structuredData = buildStructuredData(food);
  const lowerName = food.displayName.toLowerCase();
  const lowerPlural = (food.pluralDisplayName ?? food.displayName).toLowerCase();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <LandingNav isAuthenticated={false} />

      <main id="main-content">
        <article>
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

            <div className="relative mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
              <nav aria-label="Breadcrumb">
                <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-stone-500">
                  <li>
                    <Link href="/" className="transition-colors hover:text-stone-900">
                      Home
                    </Link>
                  </li>
                  <ChevronRight className="h-3 w-3 text-stone-400" aria-hidden />
                  <li>
                    <Link
                      href="/foods"
                      className="transition-colors hover:text-stone-900"
                    >
                      Foods
                    </Link>
                  </li>
                  <ChevronRight className="h-3 w-3 text-stone-400" aria-hidden />
                  <li className="text-stone-900" aria-current="page">
                    {food.displayName}
                  </li>
                </ol>
              </nav>

              <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
                <div className="max-w-2xl">
                  <p className="eyebrow text-sage-700">
                    Foods · {food.category.charAt(0).toUpperCase() + food.category.slice(1)}
                  </p>
                  <h1 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                    {food.h1}
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
                    {food.intro}
                  </p>
                  <div className="mt-5 flex max-w-xl items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-xs leading-5 text-stone-700" role="note">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                    <p>
                      Food-safety guidance assumes proper handling, a refrigerator at
                      40°F or below, and a freezer at 0°F. Harmful bacteria cannot
                      always be seen, smelled, or tasted; follow recalls and discard
                      food that was stored outside safe time or temperature limits.
                    </p>
                  </div>

                  <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                    {food.quickStats.counter && (
                      <div className="rounded-2xl bg-warm-white p-4 ring-1 ring-warm-100">
                        <dt className="eyebrow text-stone-500">Counter</dt>
                        <dd className="mt-1 text-sm font-semibold text-stone-900">
                          {food.quickStats.counter}
                        </dd>
                      </div>
                    )}
                    {food.quickStats.fridge && (
                      <div className="rounded-2xl bg-warm-white p-4 ring-1 ring-warm-100">
                        <dt className="eyebrow text-stone-500">Fridge</dt>
                        <dd className="mt-1 text-sm font-semibold text-stone-900">
                          {food.quickStats.fridge}
                        </dd>
                      </div>
                    )}
                    {food.quickStats.freezer && (
                      <div className="rounded-2xl bg-warm-white p-4 ring-1 ring-warm-100">
                        <dt className="eyebrow text-stone-500">Freezer</dt>
                        <dd className="mt-1 text-sm font-semibold text-stone-900">
                          {food.quickStats.freezer}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-500">
                    <a
                      href="#shelf-life"
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-stone-900"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Jump to shelf life
                    </a>
                    <a
                      href="#storage"
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-stone-900"
                    >
                      <Leaf className="h-3.5 w-3.5" />
                      Storage tips
                    </a>
                    <a
                      href="#recipes"
                      className="inline-flex items-center gap-1.5 transition-colors hover:text-stone-900"
                    >
                      <ChefHat className="h-3.5 w-3.5" />
                      Recipes
                    </a>
                  </div>
                </div>

                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-warm-lg ring-1 ring-warm-100">
                  <Image
                    src={heroImage}
                    alt={food.imageAlt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 480px, (min-width: 640px) 60vw, 90vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* SHELF LIFE TABLE */}
          <section id="shelf-life" className="relative bg-warm-white">
            <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
              <Reveal>
                <div className="max-w-2xl">
                  <p className="eyebrow text-sage-700">Shelf life</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                    How long does {lowerName} last?
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
                    Concrete numbers by storage condition. Use the longest viable
                    option you have time for.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-10 overflow-hidden rounded-2xl ring-1 ring-warm-100">
                  <table className="w-full text-left text-sm sm:text-base">
                    <thead>
                      <tr className="bg-cream/70 text-xs uppercase tracking-[0.12em] text-stone-500">
                        <th className="py-3 pl-5 pr-3 font-semibold sm:py-4">Condition</th>
                        <th className="py-3 px-3 font-semibold sm:py-4">Time</th>
                        <th className="hidden py-3 px-3 font-semibold sm:table-cell sm:py-4">
                          Note
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-100">
                      {food.shelfLife.map((row) => (
                        <tr key={row.condition} className="align-top">
                          <td className="py-4 pl-5 pr-3 font-medium text-stone-900">
                            {row.condition}
                          </td>
                          <td className="py-4 px-3 text-stone-700">{row.duration}</td>
                          <td className="hidden py-4 px-3 text-stone-500 sm:table-cell">
                            {row.note ?? ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            </div>
          </section>

          {/* STORAGE TIPS */}
          <section id="storage" className="relative bg-cream">
            <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
              <Reveal>
                <div className="max-w-2xl">
                  <p className="eyebrow text-sage-700">Storage</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                    How to store {lowerPlural} for maximum freshness.
                  </h2>
                </div>
              </Reveal>

              <ol className="mt-10 space-y-6">
                {food.storageTips.map((tip, i) => (
                  <Reveal key={tip} delay={0.06 * i}>
                    <li className="flex gap-5">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-500 text-sm font-bold text-warm-white shadow-warm-sm">
                        {i + 1}
                      </span>
                      <p className="pt-1 text-base leading-relaxed text-stone-700 sm:text-lg">
                        {tip}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </section>

          {/* SPOILAGE */}
          <section id="spoilage" className="relative bg-warm-white">
            <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
              <Reveal>
                <div className="max-w-2xl">
                  <p className="eyebrow text-sage-700">Spoilage</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                    How to tell if {lowerName} has gone bad.
                  </h2>
                </div>
              </Reveal>

              <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                {food.spoilageSigns.map((sign, i) => (
                  <Reveal key={sign} delay={0.06 * i}>
                    <li className="flex gap-3 rounded-2xl bg-cream/70 p-5 ring-1 ring-warm-100">
                      <AlertTriangle
                        className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                        aria-hidden
                      />
                      <p className="text-sm leading-relaxed text-stone-700 sm:text-base">
                        {sign}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </section>

          {/* RECIPES */}
          {matchedRecipes.length > 0 && (
            <section id="recipes" className="relative bg-cream">
              <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                <Reveal>
                  <div className="max-w-2xl">
                    <p className="eyebrow text-sage-700">Use it up</p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                      Recipes that use {lowerName}.
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-stone-600 sm:text-lg">
                      Real recipes from FreshTrack&apos;s starter set, all built
                      around what is already in your kitchen.
                    </p>
                  </div>
                </Reveal>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {matchedRecipes.slice(0, 6).map((recipe, i) => (
                    <Reveal key={recipe.id} delay={0.06 * i}>
                      <article className="group relative h-full overflow-hidden rounded-3xl bg-warm-white shadow-warm-sm ring-1 ring-warm-100 transition-shadow duration-300 hover:shadow-warm-lg">
                        <div className="relative h-44 w-full overflow-hidden bg-warm-50">
                          <Image
                            src={getRecipeHeroImage(recipe.name)}
                            alt={recipe.name}
                            fill
                            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent" />
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold tracking-tight text-stone-900">
                            {recipe.name}
                          </h3>
                          {recipe.description && (
                            <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                              {recipe.description}
                            </p>
                          )}
                          <div className="mt-4 flex items-center gap-4 text-xs text-stone-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {(recipe.prepTimeMinutes ?? 0) +
                                (recipe.cookTimeMinutes ?? 0)}{" "}
                              minutes
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <ChefHat className="h-3.5 w-3.5" />
                              Serves {recipe.servings ?? "?"}
                            </span>
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* FAQ */}
          <section id="faq" className="relative bg-warm-white">
            <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
              <Reveal>
                <div className="max-w-2xl">
                  <p className="eyebrow text-sage-700">Common questions</p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                    About {lowerName}.
                  </h2>
                </div>
              </Reveal>

              <div className="mt-12">
                <FaqAccordion faqs={food.faqs} idPrefix={`${food.slug}-faq`} />
              </div>
            </div>
          </section>

          {/* RELATED FOODS */}
          {relatedFoods.length > 0 && (
            <section id="related" className="relative bg-cream">
              <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                <Reveal>
                  <div className="max-w-2xl">
                    <p className="eyebrow text-sage-700">Related foods</p>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
                      Foods that go bad on the same shelf.
                    </h2>
                  </div>
                </Reveal>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedFoods.map((related, i) => (
                    <Reveal key={related.slug} delay={0.06 * i}>
                      <Link
                        href={`/foods/${related.slug}`}
                        className="group block overflow-hidden rounded-3xl bg-warm-white shadow-warm-sm ring-1 ring-warm-100 transition-shadow duration-300 hover:shadow-warm-lg"
                      >
                        <div className="relative h-40 w-full overflow-hidden bg-warm-50">
                          <Image
                            src={getFoodImage(related.imageKey)}
                            alt={related.imageAlt}
                            fill
                            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex items-center justify-between p-5">
                          <div>
                            <p className="eyebrow text-stone-500">
                              {related.category.charAt(0).toUpperCase() +
                                related.category.slice(1)}
                            </p>
                            <h3 className="mt-1 text-base font-bold tracking-tight text-stone-900">
                              {related.displayName}
                            </h3>
                          </div>
                          <ArrowRight className="h-4 w-4 text-stone-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-sage-700" />
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

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

          {/* SOURCES */}
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
        </article>
      </main>

      <LandingFooter />
    </>
  );
}
