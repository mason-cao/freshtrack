export type FoodCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "seafood"
  | "bakery"
  | "grains";

export interface ShelfLifeRow {
  condition: string;
  duration: string;
  note?: string;
}

export interface FoodSource {
  label: string;
  url: string;
}

export interface FoodPageData {
  slug: string;
  displayName: string;
  pluralDisplayName?: string;
  category: FoodCategory;
  h1: string;
  intro: string;
  metaDescription: string;
  imageKey: string;
  imageAlt: string;
  quickStats: {
    counter?: string;
    fridge?: string;
    freezer?: string;
  };
  shelfLife: ShelfLifeRow[];
  storageTips: string[];
  spoilageSigns: string[];
  faqs: { q: string; a: string }[];
  recipeMatchIngredients: string[];
  relatedFoods: string[];
  sources: FoodSource[];
}

export const foods: FoodPageData[] = [
  {
    slug: "avocado",
    displayName: "Avocado",
    pluralDisplayName: "Avocados",
    category: "produce",
    h1: "How long does avocado last? And how to keep it fresh longer.",
    intro:
      "Avocados ripen on the counter and slow down in the fridge. Knowing when to move them, and how to store the cut half, is the difference between a perfect avocado toast and a sad brown lump.",
    metaDescription:
      "How long avocados last on the counter, in the fridge, and frozen. Storage tips, spoilage signs, recipes, and FAQs from a free pantry tracker for busy households.",
    imageKey: "avocado",
    imageAlt: "Whole and halved avocados on a wooden board",
    quickStats: {
      counter: "3-5 days (until ripe)",
      fridge: "1-2 weeks (whole) / 1-3 days (cut)",
      freezer: "4-6 months (mashed)",
    },
    shelfLife: [
      {
        condition: "Whole, unripe, counter",
        duration: "3-5 days",
        note: "Until soft to gentle pressure.",
      },
      {
        condition: "Whole, ripe, counter",
        duration: "1-2 days",
        note: "Move to the fridge once ripe.",
      },
      {
        condition: "Whole, unripe, fridge",
        duration: "7-10 days",
        note: "Cold slows ripening significantly.",
      },
      {
        condition: "Whole, ripe, fridge",
        duration: "3-5 days",
        note: "Best holding window for ripe fruit.",
      },
      {
        condition: "Cut, with pit, fridge",
        duration: "1-2 days",
        note: "Brush with lemon or lime juice and seal airtight.",
      },
      {
        condition: "Mashed, frozen",
        duration: "4-6 months",
        note: "Mix with a teaspoon of lemon juice per avocado.",
      },
    ],
    storageTips: [
      "Buy avocados firm and dark green if you do not plan to eat them within two days. They ripen on the counter at room temperature.",
      "Speed up ripening by placing avocados in a paper bag with a banana or apple. The ethylene gas from the other fruit accelerates the process.",
      "Once ripe, move avocados to the refrigerator. Cold storage slows further ripening by three to five days.",
      "For a cut avocado, leave the pit in the unused half, brush the exposed flesh with lemon or lime juice, and store airtight. The pit does not actually prevent browning, but reducing air contact does.",
      "To freeze, peel and mash the flesh with a teaspoon of lemon juice per avocado. Store in airtight containers or freezer bags with the air pressed out. Texture changes on thaw, so use frozen avocado for guacamole, smoothies, or baking, not for slicing.",
    ],
    spoilageSigns: [
      "Black, stringy strands running through the flesh (not just surface browning from oxidation).",
      "A sour, rancid, or chemical smell when you cut into it.",
      "Visible mold on the skin or inside the fruit.",
      "Flesh that has gone fully black and mushy, beyond a bruised spot.",
      "The pit feels loose and rattles when you shake the whole fruit.",
    ],
    faqs: [
      {
        q: "Can you freeze whole avocados?",
        a: "Whole avocados do not freeze well. The texture turns watery and stringy on thaw. Freeze mashed avocado with lemon juice instead, and use it for guacamole, smoothies, or baked goods.",
      },
      {
        q: "Is brown avocado safe to eat?",
        a: "Surface browning from oxidation is harmless. Scrape it off and eat the green flesh underneath. Avocado that is brown throughout, accompanied by a sour smell or stringy texture, has gone bad and should be discarded.",
      },
      {
        q: "How do you ripen an avocado overnight?",
        a: "Place the avocado in a brown paper bag with a banana or apple and leave it on the counter. The trapped ethylene gas can ripen a firm avocado in 18 to 36 hours.",
      },
      {
        q: "Does keeping the pit prevent the cut half from browning?",
        a: "Not really. The pit just covers a small area of flesh. What actually slows browning is reducing oxygen contact, so brush the surface with lemon or lime juice and store the cut half airtight.",
      },
    ],
    recipeMatchIngredients: ["avocado"],
    relatedFoods: ["banana", "tomato", "lettuce"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "California Avocado Commission storage guidance",
        url: "https://www.californiaavocado.com/how-tos/storage",
      },
    ],
  },
  {
    slug: "spinach",
    displayName: "Spinach",
    category: "produce",
    h1: "How long does spinach last, and how to keep it from going slimy.",
    intro:
      "Spinach is one of the fastest produce items to wilt and slime. The good news: a single paper towel and a high-humidity drawer can double how long it stays usable.",
    metaDescription:
      "How long spinach lasts in the fridge and freezer, how to store it without going slimy, signs of spoilage, recipes, and FAQs.",
    imageKey: "spinach",
    imageAlt: "Fresh spinach leaves in a colander",
    quickStats: {
      counter: "Not recommended",
      fridge: "5-10 days",
      freezer: "8-12 months (blanched)",
    },
    shelfLife: [
      {
        condition: "Counter, room temperature",
        duration: "A few hours",
        note: "Wilts visibly within half a day. Not a storage option.",
      },
      {
        condition: "Fridge, original clamshell",
        duration: "5-7 days",
        note: "Check daily, remove any slimy leaves.",
      },
      {
        condition: "Fridge, washed and dried in paper towels",
        duration: "7-10 days",
        note: "The paper towel absorbs the moisture that causes slime.",
      },
      {
        condition: "Frozen, blanched",
        duration: "8-12 months",
        note: "Blanch one minute, ice bath, drain, freeze.",
      },
      {
        condition: "Frozen, raw (unblanched)",
        duration: "1-2 months",
        note: "Texture turns mushy and slightly bitter on thaw.",
      },
    ],
    storageTips: [
      "Do not wash spinach until you are ready to use it. Surface moisture accelerates slime and wilting by two to three days.",
      "If the original container has condensation, transfer the spinach to a bag or container lined with a paper towel. The towel pulls excess moisture away from the leaves.",
      "Store spinach in the crisper drawer set to high humidity. Most fridges have a slider on the drawer that controls this.",
      "Check bagged spinach daily and remove any wilted, yellow, or slimy leaves. One bad leaf accelerates spoilage in the leaves around it.",
      "To freeze, blanch the leaves in boiling water for one minute, plunge into ice water, drain thoroughly, and store in airtight portions. Skip blanching and the texture suffers significantly.",
    ],
    spoilageSigns: [
      "Slimy or mushy texture on the leaves, especially in the bag or container.",
      "Yellow or brown discoloration spreading from the edges inward.",
      "A sour or off smell when you open the container.",
      "Watery liquid pooling at the bottom of the bag.",
      "Wilted leaves that do not perk up after a brief cold water bath.",
    ],
    faqs: [
      {
        q: "Can you eat slimy spinach?",
        a: "No. Slime indicates bacterial breakdown. Washing does not make it safe, and the leaves often have an off taste even when the slime is rinsed away. Compost the bag.",
      },
      {
        q: "Should you wash spinach before storing it?",
        a: "No. Wash right before use. Wet leaves spoil two to three times faster than dry ones, even in the fridge.",
      },
      {
        q: "Can you freeze fresh spinach without blanching?",
        a: "Technically yes, but the texture turns mushy and the flavor goes bitter within a month or two. Blanching preserves texture, color, and shelf life for up to a year.",
      },
      {
        q: "Is wilted spinach still good?",
        a: "Soft wilting with no slime or smell is usually fine. Submerge the leaves in cold water for ten minutes to revive them. Yellow leaves, slime, or a sour smell mean the spinach is past saving.",
      },
    ],
    recipeMatchIngredients: ["spinach"],
    relatedFoods: ["lettuce", "broccoli", "avocado"],
    sources: [
      {
        label: "USDA FoodKeeper App",
        url: "https://www.foodsafety.gov/keep-food-safe/foodkeeper-app",
      },
      {
        label: "UC Davis Postharvest Technology Center",
        url: "https://postharvest.ucdavis.edu/Commodity_Resources/Fact_Sheets/",
      },
    ],
  },
];

export function getFoodBySlug(slug: string): FoodPageData | undefined {
  return foods.find((f) => f.slug === slug);
}

export function getAllFoodSlugs(): string[] {
  return foods.map((f) => f.slug);
}

export function getRelatedFoods(slug: string): FoodPageData[] {
  const food = getFoodBySlug(slug);
  if (!food) return [];
  return food.relatedFoods
    .map((relatedSlug) => getFoodBySlug(relatedSlug))
    .filter((f): f is FoodPageData => f !== undefined);
}
