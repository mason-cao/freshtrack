import type { FoodPageData } from "@/lib/foods";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getRelatedFoods } from "@/lib/foods";
import { getFoodImage } from "@/lib/food-images";
import { Reveal } from "@/components/landing/reveal";

export function RelatedFoodGuides({ food }: { food: FoodPageData }) {
  const relatedFoods = getRelatedFoods(food.slug);
  return (
    <>
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
    </>
  );
}
