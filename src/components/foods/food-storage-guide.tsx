import type { FoodPageData } from "@/lib/foods";
import { AlertTriangle } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

export function FoodStorageGuide({ food }: { food: FoodPageData }) {
  const lowerName = food.displayName.toLowerCase();
  const lowerPlural = (food.pluralDisplayName ?? food.displayName).toLowerCase();
  return (
    <>
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
    </>
  );
}
