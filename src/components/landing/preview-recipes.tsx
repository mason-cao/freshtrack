import Image from "next/image";
import { Clock, ChefHat, Sparkles } from "lucide-react";
import { getRecipeHeroImage } from "@/lib/food-images";

const ingredients = ["Salmon fillet", "Spinach", "Lemon", "Garlic"];

export function PreviewRecipes() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-warm-white shadow-warm-lg ring-1 ring-warm-100">
      <div className="relative h-44 w-full overflow-hidden bg-warm-50 sm:h-52">
        <Image
          src={getRecipeHeroImage("Garlic Butter Salmon with Spinach")}
          alt="Pan-seared salmon with wilted spinach"
          fill
          sizes="(min-width: 768px) 480px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/55 via-stone-900/10 to-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-warm-white/95 px-2.5 py-1 text-xs font-semibold text-sage-700 shadow-warm-sm">
          <Sparkles className="h-3.5 w-3.5" />
          Uses 3 expiring items
        </span>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <p className="eyebrow text-sage-700">Try tonight</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-stone-900">
            Garlic Butter Salmon with Wilted Spinach
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ingredients.map((ing) => (
            <span
              key={ing}
              className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-100"
            >
              {ing}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-warm-100 pt-3 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            25 minutes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ChefHat className="h-3.5 w-3.5" />
            Serves 4
          </span>
        </div>
      </div>
    </div>
  );
}
