import { TrendingDown, ArrowUpRight, Leaf } from "lucide-react";

const bars = [
  { label: "Jan", value: 52 },
  { label: "Feb", value: 41 },
  { label: "Mar", value: 33 },
  { label: "Apr", value: 28 },
  { label: "May", value: 19, current: true },
];

export function PreviewStats() {
  const maxValue = Math.max(...bars.map((b) => b.value));

  return (
    <div className="relative rounded-3xl bg-warm-white p-5 shadow-warm-lg ring-1 ring-warm-100 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-sage-700">Saved this month</p>
          <p className="num mt-2 text-5xl font-bold tracking-tight text-stone-900 sm:text-6xl">
            $142
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-sage-700">
            <TrendingDown className="h-4 w-4" />
            Waste rate dropped 63%
          </p>
        </div>
        <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-sage-500 text-warm-white shadow-warm-sm">
          <Leaf className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-warm-100 bg-cream/40 p-4">
        <div className="flex items-end justify-between gap-3">
          {bars.map((bar) => (
            <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    bar.current ? "bg-sage-500" : "bg-warm-200"
                  }`}
                  style={{ height: `${(bar.value / maxValue) * 100}%` }}
                  aria-hidden
                />
              </div>
              <p
                className={`text-[10px] font-semibold ${
                  bar.current ? "text-sage-700" : "text-stone-400"
                }`}
              >
                {bar.label}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Pounds of food wasted, month over month.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
        <span>Updated as you mark items used or wasted</span>
        <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}
