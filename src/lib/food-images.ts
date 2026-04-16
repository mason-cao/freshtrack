// Curated Unsplash food photography mapped to food items and categories.
// Each URL uses Unsplash's CDN with specific crop parameters for consistency.

const foodImageMap: Record<string, string> = {
  // Produce
  avocado: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop&auto=format&q=80",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop&auto=format&q=80",
  basil: "https://images.unsplash.com/photo-1618164435735-413d3b066c9a?w=400&h=400&fit=crop&auto=format&q=80",
  "bell pepper": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop&auto=format&q=80",
  pepper: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop&auto=format&q=80",
  carrot: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop&auto=format&q=80",
  strawberr: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop&auto=format&q=80",

  // Dairy
  yogurt: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop&auto=format&q=80",
  milk: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&auto=format&q=80",
  cheese: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop&auto=format&q=80",
  "sour cream": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop&auto=format&q=80",
  egg: "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=400&h=400&fit=crop&auto=format&q=80",

  // Meat
  chicken: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop&auto=format&q=80",
  salmon: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=400&fit=crop&auto=format&q=80",
  turkey: "https://images.unsplash.com/photo-1602473812169-36a0e5d7de9b?w=400&h=400&fit=crop&auto=format&q=80",

  // Bakery
  bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&auto=format&q=80",
  tortilla: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop&auto=format&q=80",

  // Frozen
  frozen: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop&auto=format&q=80",
  berri: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop&auto=format&q=80",
  pizza: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop&auto=format&q=80",

  // Canned
  canned: "https://images.unsplash.com/photo-1534483509719-8b638f8b6be1?w=400&h=400&fit=crop&auto=format&q=80",
  tomato: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=400&h=400&fit=crop&auto=format&q=80",

  // Beverages
  juice: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop&auto=format&q=80",
  almond: "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=400&h=400&fit=crop&auto=format&q=80",

  // Snacks
  cracker: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop&auto=format&q=80",
  trail: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=400&fit=crop&auto=format&q=80",
  hummus: "https://images.unsplash.com/photo-1577805947697-89340dde0e81?w=400&h=400&fit=crop&auto=format&q=80",

  // Grains / Condiments
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&auto=format&q=80",
  pasta: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop&auto=format&q=80",
  olive: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop&auto=format&q=80",
  honey: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop&auto=format&q=80",
  peanut: "https://images.unsplash.com/photo-1600189020840-13e3f1bca898?w=400&h=400&fit=crop&auto=format&q=80",
  butter: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop&auto=format&q=80",
  mushroom: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=400&fit=crop&auto=format&q=80",
  onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop&auto=format&q=80",
  lemon: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=400&fit=crop&auto=format&q=80",
  garlic: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2571?w=400&h=400&fit=crop&auto=format&q=80",
  cucumber: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400&h=400&fit=crop&auto=format&q=80",
  shrimp: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=400&fit=crop&auto=format&q=80",
  bacon: "https://images.unsplash.com/photo-1606851094291-6efae152bb87?w=400&h=400&fit=crop&auto=format&q=80",
  apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop&auto=format&q=80",
  banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&auto=format&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop&auto=format&q=80",

  // Recipes
  "stir fry": "https://images.unsplash.com/photo-1512058564366-18510be2db87?w=600&h=400&fit=crop&auto=format&q=80",
  parfait: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop&auto=format&q=80",
  "grilled cheese": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop&auto=format&q=80",
  quesadilla: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop&auto=format&q=80",
  scramble: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop&auto=format&q=80",
  burrito: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop&auto=format&q=80",
  soup: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop&auto=format&q=80",
  smoothie: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&h=400&fit=crop&auto=format&q=80",
  melt: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop&auto=format&q=80",
};

// Category-level fallback images
const categoryImageMap: Record<string, string> = {
  produce: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop&auto=format&q=80",
  dairy: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&auto=format&q=80",
  meat: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop&auto=format&q=80",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&auto=format&q=80",
  frozen: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop&auto=format&q=80",
  canned: "https://images.unsplash.com/photo-1534483509719-8b638f8b6be1?w=400&h=400&fit=crop&auto=format&q=80",
  beverages: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop&auto=format&q=80",
  snacks: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=400&fit=crop&auto=format&q=80",
};

const defaultImage = "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=400&fit=crop&auto=format&q=80";

/**
 * Get a stock food image URL for an item name, with optional category fallback.
 */
export function getFoodImage(name: string, category?: string | null): string {
  const lower = name.toLowerCase();

  // Try exact item match first
  for (const [key, url] of Object.entries(foodImageMap)) {
    if (lower.includes(key)) return url;
  }

  // Fall back to category
  if (category) {
    const catLower = category.toLowerCase();
    if (categoryImageMap[catLower]) return categoryImageMap[catLower];
  }

  return defaultImage;
}

/**
 * Get a stock image for a recipe by name.
 */
export function getRecipeImage(name: string): string {
  const lower = name.toLowerCase();

  for (const [key, url] of Object.entries(foodImageMap)) {
    if (lower.includes(key)) return url;
  }

  return defaultImage;
}
