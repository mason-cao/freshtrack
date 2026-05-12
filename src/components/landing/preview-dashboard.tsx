import Image from "next/image";
import { Clock3, ChefHat } from "lucide-react";
import { getFoodImage } from "@/lib/food-images";

const items = [
  {
    name: "Greek yogurt",
    detail: "1 container · Dairy",
    image: getFoodImage("greek yogurt", "Dairy"),
    daysLabel: "Use today",
    tone: "urgent" as const,
  },
  {
    name: "Spinach",
    detail: "1 bag · Produce",
    image: getFoodImage("spinach", "Produce"),
    daysLabel: "2 days left",
    tone: "soon" as const,
  },
  {
    name: "Salmon fillet",
    detail: "12 oz · Seafood",
    image: getFoodImage("salmon", "Seafood"),
    daysLabel: "3 days left",
    tone: "soon" as const,
  },
];

const toneClasses = {
  urgent: "bg-terracotta-50 text-terracotta-700 border border-terracotta-100",
  soon: "bg-amber-50 text-amber-800 border border-amber-100",
} satisfies Record<"urgent" | "soon", string>;

export function PreviewDashboard() {
  return (
    <div className="relative rounded-3xl bg-warm-white p-5 shadow-warm-lg ring-1 ring-warm-100 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow text-sage-700">Sunday afternoon</p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">
            Three items want your attention
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-2.5 py-1 text-xs font-semibold text-sage-700">
          <ChefHat className="h-3.5 w-3.5" />
          Recipe ready
        </span>
      </div>

      <div className="mt-5 divide-y divide-warm-100 rounded-2xl border border-warm-100 bg-cream/40">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3 p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-warm-50 ring-1 ring-warm-100">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-stone-900">{item.name}</p>
              <p className="truncate text-xs text-stone-500">{item.detail}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneClasses[item.tone]}`}
            >
              <Clock3 className="h-3 w-3" />
              {item.daysLabel}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-stone-500">
        Sort by expiry, category, or recipe match. Marking items used or wasted updates your savings instantly.
      </p>
    </div>
  );
}
