// Curated Unsplash food photography mapped to food items and categories.
// Each URL uses Unsplash's CDN with crop parameters for consistency.

const u = (id: string, w = 400, h = 400) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

const foodImageMap: Record<string, string> = {
  // ─── Produce: leafy & herbs ──────────────────────────────
  spinach: u("photo-1576045057995-568f588f82fb"),
  kale: u("photo-1576045057995-568f588f82fb"),
  arugula: u("photo-1576045057995-568f588f82fb"),
  lettuce: u("photo-1622206151226-18ca2c9ab4a1"),
  basil: u("photo-1618164435735-413d3b066c9a"),
  cilantro: u("photo-1618164435735-413d3b066c9a"),
  parsley: u("photo-1618164435735-413d3b066c9a"),
  mint: u("photo-1618164435735-413d3b066c9a"),

  // ─── Produce: vegetables ─────────────────────────────────
  "bell pepper": u("photo-1563565375-f3fdfdbefa83"),
  pepper: u("photo-1563565375-f3fdfdbefa83"),
  carrot: u("photo-1598170845058-32b9d6a5da37"),
  cucumber: u("photo-1604977042946-1eecc30f269e"),
  mushroom: u("photo-1504545102780-26774c1bb073"),
  onion: u("photo-1618512496248-a07fe83aa8cb"),
  garlic: u("photo-1618512496248-a07fe83aa8cb"),
  ginger: u("photo-1618512496248-a07fe83aa8cb"),
  shallot: u("photo-1618512496248-a07fe83aa8cb"),
  scallion: u("photo-1618512496248-a07fe83aa8cb"),
  leek: u("photo-1618512496248-a07fe83aa8cb"),
  tomato: u("photo-1443131612988-32b6d97cc5da"),
  potato: u("photo-1518977676601-b53f82aba655"),
  "sweet potato": u("photo-1518977676601-b53f82aba655"),
  broccoli: u("photo-1459411552884-841db9b3cc2a"),
  cauliflower: u("photo-1459411552884-841db9b3cc2a"),
  asparagus: u("photo-1540420773420-3366772f4999"),
  zucchini: u("photo-1604977042946-1eecc30f269e"),
  squash: u("photo-1604977042946-1eecc30f269e"),
  celery: u("photo-1576045057995-568f588f82fb"),
  corn: u("photo-1540420773420-3366772f4999"),
  "green bean": u("photo-1576045057995-568f588f82fb"),
  pea: u("photo-1576045057995-568f588f82fb"),
  avocado: u("photo-1523049673857-eb18f1d7b578"),

  // ─── Produce: fruit ──────────────────────────────────────
  strawberr: u("photo-1464965911861-746a04b4bca6"),
  blueberr: u("photo-1498557850523-fd3d118b962e"),
  raspberr: u("photo-1498557850523-fd3d118b962e"),
  blackberr: u("photo-1498557850523-fd3d118b962e"),
  apple: u("photo-1560806887-1e4cd0b6cbd6"),
  banana: u("photo-1571771894821-ce9b6c11b08e"),
  orange: u("photo-1547514701-42782101795e"),
  lemon: u("photo-1590502593747-42a996133562"),
  lime: u("photo-1590502593747-42a996133562"),
  pear: u("photo-1568702846914-96b305d2aaeb"),
  peach: u("photo-1595708684082-a173bb3a06c5"),
  plum: u("photo-1595708684082-a173bb3a06c5"),
  grape: u("photo-1599819811279-d5ad9cccf838"),
  watermelon: u("photo-1587049332298-1c42e83937a7"),
  melon: u("photo-1587049332298-1c42e83937a7"),
  pineapple: u("photo-1550828520-4cb496926fc9"),
  mango: u("photo-1591073113125-e46713c829ed"),
  kiwi: u("photo-1591073113125-e46713c829ed"),

  // ─── Dairy & eggs ────────────────────────────────────────
  yogurt: u("photo-1488477181946-6428a0291777"),
  milk: u("photo-1563636619-e9143da7973b"),
  cream: u("photo-1488477181946-6428a0291777"),
  "sour cream": u("photo-1488477181946-6428a0291777"),
  butter: u("photo-1589985270826-4b7bb135bc9d"),
  cheese: u("photo-1486297678162-eb2a19b0a32d"),
  feta: u("photo-1486297678162-eb2a19b0a32d"),
  parmesan: u("photo-1486297678162-eb2a19b0a32d"),
  mozzarella: u("photo-1486297678162-eb2a19b0a32d"),
  ricotta: u("photo-1486297678162-eb2a19b0a32d"),
  egg: u("photo-1518569656558-1f25e69d93d7"),

  // ─── Meat & seafood ──────────────────────────────────────
  chicken: u("photo-1598103442097-8b74394b95c6"),
  turkey: u("photo-1598103442097-8b74394b95c6"),
  beef: u("photo-1604503468506-a8da13d82791"),
  steak: u("photo-1604503468506-a8da13d82791"),
  pork: u("photo-1604503468506-a8da13d82791"),
  ham: u("photo-1604503468506-a8da13d82791"),
  sausage: u("photo-1604503468506-a8da13d82791"),
  bacon: u("photo-1606851094291-6efae152bb87"),
  salmon: u("photo-1467003909585-2f8a72700288"),
  tuna: u("photo-1467003909585-2f8a72700288"),
  cod: u("photo-1467003909585-2f8a72700288"),
  tilapia: u("photo-1467003909585-2f8a72700288"),
  shrimp: u("photo-1565680018434-b513d5e5fd47"),
  prawn: u("photo-1565680018434-b513d5e5fd47"),

  // ─── Bakery & grains ─────────────────────────────────────
  bread: u("photo-1509440159596-0249088772ff"),
  baguette: u("photo-1509440159596-0249088772ff"),
  bagel: u("photo-1509440159596-0249088772ff"),
  toast: u("photo-1509440159596-0249088772ff"),
  tortilla: u("photo-1565299585323-38d6b0865b47"),
  pita: u("photo-1565299585323-38d6b0865b47"),
  rice: u("photo-1586201375761-83865001e31c"),
  pasta: u("photo-1551462147-ff29053bfc14"),
  spaghetti: u("photo-1551462147-ff29053bfc14"),
  noodle: u("photo-1551462147-ff29053bfc14"),
  oats: u("photo-1586201375761-83865001e31c"),
  oatmeal: u("photo-1586201375761-83865001e31c"),
  quinoa: u("photo-1586201375761-83865001e31c"),
  lentil: u("photo-1586201375761-83865001e31c"),
  chickpea: u("photo-1586201375761-83865001e31c"),
  "black bean": u("photo-1586201375761-83865001e31c"),

  // ─── Frozen, canned, pantry ──────────────────────────────
  frozen: u("photo-1498557850523-fd3d118b962e"),
  berri: u("photo-1498557850523-fd3d118b962e"),
  pizza: u("photo-1565299624946-b28f40a0ae38"),
  canned: u("photo-1443131612988-32b6d97cc5da"),

  // ─── Beverages ───────────────────────────────────────────
  juice: u("photo-1621506289937-a8e4df240d0b"),
  "almond milk": u("photo-1600788886242-5c96aabe3757"),
  "oat milk": u("photo-1600788886242-5c96aabe3757"),
  almond: u("photo-1600788886242-5c96aabe3757"),
  coffee: u("photo-1621506289937-a8e4df240d0b"),
  tea: u("photo-1621506289937-a8e4df240d0b"),

  // ─── Snacks ──────────────────────────────────────────────
  cracker: u("photo-1558961363-fa8fdf82db35"),
  chip: u("photo-1558961363-fa8fdf82db35"),
  pretzel: u("photo-1558961363-fa8fdf82db35"),
  popcorn: u("photo-1558961363-fa8fdf82db35"),
  trail: u("photo-1604068549290-dea0e4a305ca"),
  granola: u("photo-1604068549290-dea0e4a305ca"),
  cereal: u("photo-1604068549290-dea0e4a305ca"),
  hummus: u("photo-1540189549336-e6e99c3679fe"),
  walnut: u("photo-1604068549290-dea0e4a305ca"),
  cashew: u("photo-1604068549290-dea0e4a305ca"),

  // ─── Condiments & pantry staples ─────────────────────────
  olive: u("photo-1474979266404-7eaacbcd87c5"),
  oil: u("photo-1474979266404-7eaacbcd87c5"),
  vinegar: u("photo-1474979266404-7eaacbcd87c5"),
  honey: u("photo-1587049352846-4a222e784d38"),
  syrup: u("photo-1587049352846-4a222e784d38"),
  jam: u("photo-1587049352846-4a222e784d38"),
  "peanut butter": u("photo-1587049352846-4a222e784d38"),
  peanut: u("photo-1587049352846-4a222e784d38"),
  "soy sauce": u("photo-1474979266404-7eaacbcd87c5"),
  ketchup: u("photo-1474979266404-7eaacbcd87c5"),
  mustard: u("photo-1474979266404-7eaacbcd87c5"),
  mayo: u("photo-1488477181946-6428a0291777"),
  salsa: u("photo-1540189549336-e6e99c3679fe"),
  pesto: u("photo-1540189549336-e6e99c3679fe"),

  // ─── Recipe hero images ──────────────────────────────────
  "stir fry": u("photo-1512058564366-18510be2db87", 600, 400),
  parfait: u("photo-1488477181946-6428a0291777", 600, 400),
  "grilled cheese": u("photo-1528735602780-2552fd46c7af", 600, 400),
  quesadilla: u("photo-1565299585323-38d6b0865b47", 600, 400),
  scramble: u("photo-1525351484163-7529414344d8", 600, 400),
  omelet: u("photo-1525351484163-7529414344d8", 600, 400),
  burrito: u("photo-1626700051175-6818013e1d4f", 600, 400),
  soup: u("photo-1547592166-23ac45744acd", 600, 400),
  stew: u("photo-1547592166-23ac45744acd", 600, 400),
  chili: u("photo-1547592166-23ac45744acd", 600, 400),
  smoothie: u("photo-1553530666-ba11a7da3888", 600, 400),
  melt: u("photo-1528735602780-2552fd46c7af", 600, 400),
  salad: u("photo-1576045057995-568f588f82fb", 600, 400),
  risotto: u("photo-1586201375761-83865001e31c", 600, 400),
  bowl: u("photo-1586201375761-83865001e31c", 600, 400),
  "rice bowl": u("photo-1586201375761-83865001e31c", 600, 400),
  "yogurt bowl": u("photo-1488477181946-6428a0291777", 600, 400),
  "overnight oats": u("photo-1586201375761-83865001e31c", 600, 400),
  curry: u("photo-1547592166-23ac45744acd", 600, 400),
  sandwich: u("photo-1528735602780-2552fd46c7af", 600, 400),
};

// Category-level fallback images
const categoryImageMap: Record<string, string> = {
  produce: u("photo-1540420773420-3366772f4999"),
  dairy: u("photo-1563636619-e9143da7973b"),
  meat: u("photo-1604503468506-a8da13d82791"),
  bakery: u("photo-1509440159596-0249088772ff"),
  frozen: u("photo-1498557850523-fd3d118b962e"),
  canned: u("photo-1443131612988-32b6d97cc5da"),
  beverages: u("photo-1621506289937-a8e4df240d0b"),
  snacks: u("photo-1604068549290-dea0e4a305ca"),
};

const defaultImage = u("photo-1606787366850-de6330128bfc");

function findMatch(lower: string): string | null {
  for (const [key, url] of Object.entries(foodImageMap)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

/**
 * Get a stock food image URL for an item name, with optional category fallback.
 */
export function getFoodImage(name: string, category?: string | null): string {
  const lower = name.toLowerCase();
  const match = findMatch(lower);
  if (match) return match;
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
  const match = findMatch(lower);
  if (match) return match;
  return defaultImage;
}

/**
 * Get a high-resolution food image for hero contexts (e.g., dashboard hero).
 * Returns a 1500×1200 crop suitable for full-bleed editorial use.
 */
export function getHeroImage(name: string, category?: string | null): string {
  const base = getFoodImage(name, category);
  return base.replace(/w=\d+/, "w=1500").replace(/h=\d+/, "h=1200");
}
