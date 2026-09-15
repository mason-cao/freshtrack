import type { FoodPageData } from "@/lib/foods";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Clock, Leaf, ChefHat, AlertTriangle } from "lucide-react";
import { getFoodImage } from "@/lib/food-images";

export function FoodGuideHero({ food }: { food: FoodPageData }) {
  const heroImage = getFoodImage(food.imageKey, "Produce");
  return (
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
              {(["counter", "fridge", "freezer"] as const).map((location) => food.quickStats[location] && (
                <div key={location} className="rounded-2xl bg-warm-white p-4 ring-1 ring-warm-100">
                  <dt className="eyebrow text-stone-500">{location.charAt(0).toUpperCase() + location.slice(1)}</dt>
                  <dd className="mt-1 text-sm font-semibold text-stone-900">{food.quickStats[location]}</dd>
                </div>
              ))}
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
  );
}
