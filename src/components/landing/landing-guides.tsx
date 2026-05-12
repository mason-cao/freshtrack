import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";
import { foods } from "@/lib/foods";
import { getFoodImage } from "@/lib/food-images";
import { Reveal } from "./reveal";

const FEATURED_SLUGS = [
  "avocado",
  "eggs",
  "salmon",
  "chicken-breast",
  "bread",
  "greek-yogurt",
];

export function LandingGuides() {
  const featured = FEATURED_SLUGS.map((slug) =>
    foods.find((f) => f.slug === slug)
  ).filter((f): f is NonNullable<typeof f> => f !== undefined);

  return (
    <section id="guides" className="relative bg-warm-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="eyebrow text-sage-700">
                <BookOpen className="mr-1.5 inline-block h-3.5 w-3.5" />
                Free guides
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                How long does food actually last?
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
                {foods.length} shelf-life and storage guides for the foods you
                actually buy. Concrete numbers, storage tips, and spoilage
                signs, sourced from USDA FoodKeeper and academic postharvest
                research.
              </p>
            </div>

            <Link
              href="/foods"
              className="group inline-flex items-center gap-1.5 rounded-xl bg-cream px-4 py-2 text-sm font-semibold text-sage-700 ring-1 ring-warm-100 transition-all duration-200 hover:translate-y-[-1px] hover:bg-sage-50 hover:ring-sage-100"
            >
              Browse all {foods.length} guides
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((food, i) => (
            <Reveal key={food.slug} delay={0.05 * i}>
              <Link
                href={`/foods/${food.slug}`}
                className="group block h-full overflow-hidden rounded-3xl bg-cream shadow-warm-sm ring-1 ring-warm-100 transition-shadow duration-300 hover:shadow-warm-lg"
              >
                <div className="relative h-44 w-full overflow-hidden bg-warm-50">
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
                      How long does {food.displayName.toLowerCase()} last?
                    </p>
                    <h3 className="mt-1 text-lg font-bold tracking-tight text-stone-900 group-hover:text-sage-700">
                      {food.displayName}
                    </h3>
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
}
