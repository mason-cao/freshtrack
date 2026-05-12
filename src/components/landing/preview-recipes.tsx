"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Clock, ChefHat, Sparkles } from "lucide-react";
import { getRecipeHeroImage } from "@/lib/food-images";

interface Recipe {
  id: string;
  name: string;
  alt: string;
  matches: number;
  time: string;
  serves: string;
  ingredients: string[];
}

const recipes: Recipe[] = [
  {
    id: "salmon-spinach",
    name: "Garlic Butter Salmon with Wilted Spinach",
    alt: "Pan-seared salmon with wilted spinach",
    matches: 3,
    time: "25 minutes",
    serves: "Serves 4",
    ingredients: ["Salmon fillet", "Spinach", "Lemon", "Garlic"],
  },
  {
    id: "yogurt-bowl",
    name: "Honey Yogurt Bowl with Roasted Pears",
    alt: "A bowl of Greek yogurt with sliced pears and honey",
    matches: 2,
    time: "15 minutes",
    serves: "Serves 2",
    ingredients: ["Greek yogurt", "Pears", "Honey", "Walnuts"],
  },
  {
    id: "veg-pasta",
    name: "One-Pan Tomato Pasta with Basil",
    alt: "Tomato pasta in a wide pan, topped with fresh basil",
    matches: 4,
    time: "20 minutes",
    serves: "Serves 4",
    ingredients: ["Tomatoes", "Basil", "Garlic", "Pasta"],
  },
];

const INTERVAL_MS = 5400;

export function PreviewRecipes() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % recipes.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const recipe = recipes[index];

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-3xl bg-warm-white shadow-warm-lg ring-1 ring-warm-100"
    >
      <div className="relative h-44 w-full overflow-hidden bg-warm-50 sm:h-52">
        <AnimatePresence mode="wait">
          <motion.div
            key={recipe.id}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={getRecipeHeroImage(recipe.name)}
              alt={recipe.alt}
              fill
              sizes="(min-width: 768px) 480px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/55 via-stone-900/10 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <motion.span
          key={`badge-${recipe.id}`}
          initial={reduceMotion ? false : { y: -4, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-warm-white/95 px-2.5 py-1 text-xs font-semibold text-sage-700 shadow-warm-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Uses {recipe.matches} expiring items
        </motion.span>

        <div
          className="absolute bottom-3 right-3 flex items-center gap-1.5"
          aria-hidden
        >
          {recipes.map((r, i) => (
            <span
              key={r.id}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-warm-white" : "w-1.5 bg-warm-white/55"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <p className="eyebrow text-sage-700">Try tonight</p>
          <AnimatePresence mode="wait">
            <motion.h3
              key={`title-${recipe.id}`}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-1 text-xl font-bold tracking-tight text-stone-900"
            >
              {recipe.name}
            </motion.h3>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`pills-${recipe.id}`}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-1.5"
          >
            {recipe.ingredients.map((ing) => (
              <span
                key={ing}
                className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-100"
              >
                {ing}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-warm-100 pt-3 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {recipe.time}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ChefHat className="h-3.5 w-3.5" />
            {recipe.serves}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
