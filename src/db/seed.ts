import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "freshtrack.db");
const sqlite = new Database(dbPath);
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

function monthsAgo(months: number, dayOffset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(d.getDate() + dayOffset);
  return d.toISOString().split("T")[0];
}

async function seed() {
  console.log("Seeding database...");

  // Clear existing data
  db.delete(schema.wasteLog).run();
  db.delete(schema.recipeIngredients).run();
  db.delete(schema.recipes).run();
  db.delete(schema.items).run();
  db.delete(schema.categories).run();

  // Categories
  const categoryData = [
    { name: "Produce", icon: "🥬", defaultShelfLifeDays: 7 },
    { name: "Dairy", icon: "🥛", defaultShelfLifeDays: 14 },
    { name: "Meat", icon: "🥩", defaultShelfLifeDays: 5 },
    { name: "Bakery", icon: "🍞", defaultShelfLifeDays: 5 },
    { name: "Frozen", icon: "🧊", defaultShelfLifeDays: 90 },
    { name: "Canned", icon: "🥫", defaultShelfLifeDays: 365 },
    { name: "Beverages", icon: "🥤", defaultShelfLifeDays: 30 },
    { name: "Snacks", icon: "🍿", defaultShelfLifeDays: 60 },
  ];

  for (const cat of categoryData) {
    db.insert(schema.categories).values(cat).run();
  }

  console.log("  ✓ Categories seeded");

  // Items with varied freshness states
  const itemsData = [
    // Expiring urgently (red - within 2 days)
    { name: "Greek Yogurt", categoryId: 2, quantity: 1, unit: "container", purchaseDate: daysAgo(12), expirationDate: daysFromNow(1), costEstimate: 4.99 },
    { name: "Whole Wheat Bread", categoryId: 4, quantity: 1, unit: "loaf", purchaseDate: daysAgo(4), expirationDate: daysFromNow(0), costEstimate: 3.49 },
    { name: "Fresh Salmon", categoryId: 3, quantity: 0.75, unit: "lbs", purchaseDate: daysAgo(2), expirationDate: daysFromNow(1), costEstimate: 8.99 },
    { name: "Baby Spinach", categoryId: 1, quantity: 1, unit: "bag", purchaseDate: daysAgo(5), expirationDate: daysFromNow(0), costEstimate: 3.29 },

    // Expiring soon (yellow - within 5 days)
    { name: "Chicken Breast", categoryId: 3, quantity: 1.5, unit: "lbs", purchaseDate: daysAgo(2), expirationDate: daysFromNow(3), costEstimate: 7.49 },
    { name: "Bell Peppers", categoryId: 1, quantity: 3, unit: "count", purchaseDate: daysAgo(4), expirationDate: daysFromNow(4), costEstimate: 2.99 },
    { name: "Sour Cream", categoryId: 2, quantity: 1, unit: "container", purchaseDate: daysAgo(7), expirationDate: daysFromNow(4), costEstimate: 2.49 },
    { name: "Tortillas", categoryId: 4, quantity: 8, unit: "count", purchaseDate: daysAgo(3), expirationDate: daysFromNow(5), costEstimate: 3.99 },

    // Fresh (green - more than 5 days)
    { name: "Cheddar Cheese", categoryId: 2, quantity: 1, unit: "block", purchaseDate: daysAgo(3), expirationDate: daysFromNow(12), costEstimate: 5.49 },
    { name: "Eggs", categoryId: 2, quantity: 12, unit: "count", purchaseDate: daysAgo(2), expirationDate: daysFromNow(21), costEstimate: 3.99 },
    { name: "Carrots", categoryId: 1, quantity: 1, unit: "bag", purchaseDate: daysAgo(2), expirationDate: daysFromNow(18), costEstimate: 1.99 },
    { name: "Frozen Berries", categoryId: 5, quantity: 1, unit: "bag", purchaseDate: daysAgo(5), expirationDate: daysFromNow(85), costEstimate: 4.99 },
    { name: "Frozen Pizza", categoryId: 5, quantity: 2, unit: "count", purchaseDate: daysAgo(3), expirationDate: daysFromNow(60), costEstimate: 6.99 },
    { name: "Canned Tomatoes", categoryId: 6, quantity: 3, unit: "cans", purchaseDate: daysAgo(30), expirationDate: daysFromNow(335), costEstimate: 1.29 },
    { name: "Orange Juice", categoryId: 7, quantity: 1, unit: "carton", purchaseDate: daysAgo(4), expirationDate: daysFromNow(10), costEstimate: 4.49 },
    { name: "Almond Milk", categoryId: 7, quantity: 1, unit: "carton", purchaseDate: daysAgo(1), expirationDate: daysFromNow(28), costEstimate: 3.99 },
    { name: "Trail Mix", categoryId: 8, quantity: 1, unit: "bag", purchaseDate: daysAgo(7), expirationDate: daysFromNow(53), costEstimate: 5.99 },
    { name: "Rice Crackers", categoryId: 8, quantity: 1, unit: "box", purchaseDate: daysAgo(10), expirationDate: daysFromNow(50), costEstimate: 3.49 },

    // Expired (gray)
    { name: "Avocados", categoryId: 1, quantity: 2, unit: "count", purchaseDate: daysAgo(8), expirationDate: daysAgo(2), costEstimate: 2.50 },
    { name: "Fresh Basil", categoryId: 1, quantity: 1, unit: "bunch", purchaseDate: daysAgo(7), expirationDate: daysAgo(1), costEstimate: 2.99 },
    { name: "Ground Turkey", categoryId: 3, quantity: 1, unit: "lbs", purchaseDate: daysAgo(6), expirationDate: daysAgo(1), costEstimate: 5.99 },
  ];

  for (const item of itemsData) {
    db.insert(schema.items).values({
      ...item,
      status: "active",
    }).run();
  }

  console.log("  ✓ Items seeded");

  // Recipes
  const recipesData = [
    {
      name: "Chicken Stir Fry",
      description: "Quick and healthy stir fry with fresh vegetables",
      instructions: "1. Slice chicken breast into strips\n2. Dice bell peppers and slice carrots\n3. Heat oil in a wok over high heat\n4. Cook chicken until golden, about 5 minutes\n5. Add vegetables and stir fry 3-4 minutes\n6. Season with soy sauce and serve over rice",
      prepTimeMinutes: 15,
      cookTimeMinutes: 12,
      servings: 4,
      ingredients: [
        { ingredientName: "chicken breast", quantity: 1.5, unit: "lbs" },
        { ingredientName: "bell peppers", quantity: 2, unit: "count" },
        { ingredientName: "carrots", quantity: 1, unit: "cup" },
        { ingredientName: "spinach", quantity: 2, unit: "cups" },
      ],
    },
    {
      name: "Yogurt Parfait",
      description: "Layered yogurt with berries and granola",
      instructions: "1. Spoon yogurt into a glass or bowl\n2. Add a layer of frozen berries\n3. Repeat layers\n4. Top with granola or trail mix\n5. Drizzle with honey if desired",
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      servings: 1,
      ingredients: [
        { ingredientName: "greek yogurt", quantity: 1, unit: "cup" },
        { ingredientName: "frozen berries", quantity: 0.5, unit: "cup" },
        { ingredientName: "trail mix", quantity: 0.25, unit: "cup" },
      ],
    },
    {
      name: "Classic Grilled Cheese",
      description: "Crispy buttery grilled cheese sandwich",
      instructions: "1. Butter two slices of bread on one side\n2. Place cheese between unbuttered sides\n3. Grill in a pan over medium heat\n4. Cook 3-4 minutes per side until golden and cheese melts",
      prepTimeMinutes: 5,
      cookTimeMinutes: 8,
      servings: 1,
      ingredients: [
        { ingredientName: "bread", quantity: 2, unit: "slices" },
        { ingredientName: "cheddar cheese", quantity: 2, unit: "slices" },
      ],
    },
    {
      name: "Salmon with Lemon & Herbs",
      description: "Baked salmon fillet with fresh herbs and lemon",
      instructions: "1. Preheat oven to 400°F\n2. Place salmon on a lined baking sheet\n3. Season with salt, pepper, and herbs\n4. Squeeze lemon juice over the top\n5. Bake for 12-15 minutes until flaky\n6. Serve with a side salad",
      prepTimeMinutes: 5,
      cookTimeMinutes: 15,
      servings: 2,
      ingredients: [
        { ingredientName: "salmon", quantity: 0.75, unit: "lbs" },
        { ingredientName: "spinach", quantity: 3, unit: "cups" },
      ],
    },
    {
      name: "Chicken Quesadilla",
      description: "Cheesy chicken quesadilla with peppers and sour cream",
      instructions: "1. Shred or dice cooked chicken\n2. Dice bell peppers\n3. Place tortilla in a pan over medium heat\n4. Add cheese, chicken, and peppers to one half\n5. Fold and cook 2-3 minutes per side\n6. Serve with sour cream",
      prepTimeMinutes: 10,
      cookTimeMinutes: 8,
      servings: 2,
      ingredients: [
        { ingredientName: "chicken breast", quantity: 0.5, unit: "lbs" },
        { ingredientName: "tortillas", quantity: 2, unit: "count" },
        { ingredientName: "cheddar cheese", quantity: 0.5, unit: "cup" },
        { ingredientName: "bell peppers", quantity: 1, unit: "count" },
        { ingredientName: "sour cream", quantity: 2, unit: "tbsp" },
      ],
    },
    {
      name: "Veggie Egg Scramble",
      description: "Fluffy scrambled eggs with fresh vegetables",
      instructions: "1. Whisk eggs with a splash of milk\n2. Dice bell peppers and chop spinach\n3. Sauté vegetables in butter for 2 minutes\n4. Pour in eggs and gently stir\n5. Cook until just set, about 3 minutes\n6. Season with salt and pepper",
      prepTimeMinutes: 5,
      cookTimeMinutes: 5,
      servings: 2,
      ingredients: [
        { ingredientName: "eggs", quantity: 4, unit: "count" },
        { ingredientName: "bell peppers", quantity: 1, unit: "count" },
        { ingredientName: "spinach", quantity: 1, unit: "cup" },
        { ingredientName: "cheddar cheese", quantity: 0.25, unit: "cup" },
      ],
    },
    {
      name: "Breakfast Burrito",
      description: "Hearty breakfast burrito with eggs and cheese",
      instructions: "1. Scramble eggs in a pan\n2. Warm tortilla in another pan or microwave\n3. Add eggs, cheese, and sour cream to tortilla\n4. Add any extra veggies\n5. Roll up tightly and enjoy",
      prepTimeMinutes: 5,
      cookTimeMinutes: 8,
      servings: 1,
      ingredients: [
        { ingredientName: "eggs", quantity: 2, unit: "count" },
        { ingredientName: "tortillas", quantity: 1, unit: "count" },
        { ingredientName: "cheddar cheese", quantity: 0.25, unit: "cup" },
        { ingredientName: "sour cream", quantity: 1, unit: "tbsp" },
      ],
    },
    {
      name: "Carrot Ginger Soup",
      description: "Creamy carrot soup with a hint of ginger",
      instructions: "1. Peel and chop carrots\n2. Sauté in butter with diced onion and ginger\n3. Add vegetable broth and simmer 20 minutes\n4. Blend until smooth\n5. Stir in sour cream and season to taste\n6. Serve with crusty bread",
      prepTimeMinutes: 10,
      cookTimeMinutes: 25,
      servings: 4,
      ingredients: [
        { ingredientName: "carrots", quantity: 1, unit: "bag" },
        { ingredientName: "sour cream", quantity: 3, unit: "tbsp" },
        { ingredientName: "bread", quantity: 4, unit: "slices" },
      ],
    },
    {
      name: "Berry Smoothie",
      description: "Refreshing smoothie with berries and almond milk",
      instructions: "1. Add frozen berries to blender\n2. Pour in almond milk\n3. Add yogurt for creaminess\n4. Blend until smooth\n5. Pour into a glass and enjoy",
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      servings: 1,
      ingredients: [
        { ingredientName: "frozen berries", quantity: 1, unit: "cup" },
        { ingredientName: "almond milk", quantity: 1, unit: "cup" },
        { ingredientName: "greek yogurt", quantity: 0.5, unit: "cup" },
      ],
    },
    {
      name: "Cheesy Spinach Tortilla Melt",
      description: "Quick spinach and cheese melt on a crispy tortilla",
      instructions: "1. Place tortilla on a pan over medium heat\n2. Add cheese and fresh spinach on top\n3. Cover and cook until cheese melts and spinach wilts\n4. Fold in half and cook until crispy\n5. Serve with sour cream",
      prepTimeMinutes: 5,
      cookTimeMinutes: 6,
      servings: 1,
      ingredients: [
        { ingredientName: "tortillas", quantity: 1, unit: "count" },
        { ingredientName: "spinach", quantity: 1, unit: "cup" },
        { ingredientName: "cheddar cheese", quantity: 0.5, unit: "cup" },
        { ingredientName: "sour cream", quantity: 1, unit: "tbsp" },
      ],
    },
  ];

  for (const recipe of recipesData) {
    const { ingredients, ...recipeRow } = recipe;
    const result = db.insert(schema.recipes).values(recipeRow).returning().get();
    for (const ing of ingredients) {
      db.insert(schema.recipeIngredients)
        .values({ ...ing, recipeId: result.id })
        .run();
    }
  }

  console.log("  ✓ Recipes seeded");

  // Waste log - historical data for the past 3 months
  const wasteLogData = [
    // 3 months ago
    { itemName: "Milk", action: "consumed" as const, quantity: 1, unit: "gallon", costEstimate: 4.29, loggedAt: monthsAgo(3, 2) },
    { itemName: "Bananas", action: "wasted" as const, quantity: 3, unit: "count", costEstimate: 0.75, loggedAt: monthsAgo(3, 5) },
    { itemName: "Lettuce", action: "wasted" as const, quantity: 1, unit: "head", costEstimate: 2.49, loggedAt: monthsAgo(3, 8) },
    { itemName: "Chicken Thighs", action: "consumed" as const, quantity: 2, unit: "lbs", costEstimate: 6.99, loggedAt: monthsAgo(3, 12) },
    { itemName: "Bread", action: "wasted" as const, quantity: 0.5, unit: "loaf", costEstimate: 1.75, loggedAt: monthsAgo(3, 15) },
    { itemName: "Apples", action: "consumed" as const, quantity: 4, unit: "count", costEstimate: 3.20, loggedAt: monthsAgo(3, 18) },
    { itemName: "Yogurt", action: "consumed" as const, quantity: 2, unit: "cups", costEstimate: 2.50, loggedAt: monthsAgo(3, 22) },
    { itemName: "Tomatoes", action: "wasted" as const, quantity: 2, unit: "count", costEstimate: 1.80, loggedAt: monthsAgo(3, 25) },

    // 2 months ago
    { itemName: "Steak", action: "consumed" as const, quantity: 1, unit: "lbs", costEstimate: 12.99, loggedAt: monthsAgo(2, 1) },
    { itemName: "Spinach", action: "wasted" as const, quantity: 1, unit: "bag", costEstimate: 3.29, loggedAt: monthsAgo(2, 4) },
    { itemName: "Cheese", action: "consumed" as const, quantity: 1, unit: "block", costEstimate: 5.49, loggedAt: monthsAgo(2, 7) },
    { itemName: "Pasta Sauce", action: "consumed" as const, quantity: 1, unit: "jar", costEstimate: 3.99, loggedAt: monthsAgo(2, 10) },
    { itemName: "Avocados", action: "wasted" as const, quantity: 2, unit: "count", costEstimate: 2.50, loggedAt: monthsAgo(2, 13) },
    { itemName: "Eggs", action: "consumed" as const, quantity: 12, unit: "count", costEstimate: 3.99, loggedAt: monthsAgo(2, 16) },
    { itemName: "Ground Beef", action: "consumed" as const, quantity: 1, unit: "lbs", costEstimate: 5.99, loggedAt: monthsAgo(2, 19) },
    { itemName: "Strawberries", action: "wasted" as const, quantity: 1, unit: "pint", costEstimate: 3.99, loggedAt: monthsAgo(2, 22) },
    { itemName: "Butter", action: "consumed" as const, quantity: 1, unit: "stick", costEstimate: 1.50, loggedAt: monthsAgo(2, 25) },
    { itemName: "Celery", action: "wasted" as const, quantity: 1, unit: "bunch", costEstimate: 1.99, loggedAt: monthsAgo(2, 28) },

    // 1 month ago
    { itemName: "Salmon", action: "consumed" as const, quantity: 1, unit: "fillet", costEstimate: 8.99, loggedAt: monthsAgo(1, 2) },
    { itemName: "Mushrooms", action: "wasted" as const, quantity: 1, unit: "pack", costEstimate: 2.49, loggedAt: monthsAgo(1, 5) },
    { itemName: "Rice", action: "consumed" as const, quantity: 2, unit: "cups", costEstimate: 1.20, loggedAt: monthsAgo(1, 8) },
    { itemName: "Greek Yogurt", action: "consumed" as const, quantity: 1, unit: "container", costEstimate: 4.99, loggedAt: monthsAgo(1, 11) },
    { itemName: "Cilantro", action: "wasted" as const, quantity: 1, unit: "bunch", costEstimate: 0.99, loggedAt: monthsAgo(1, 14) },
    { itemName: "Chicken Breast", action: "consumed" as const, quantity: 1.5, unit: "lbs", costEstimate: 7.49, loggedAt: monthsAgo(1, 17) },
    { itemName: "Bell Peppers", action: "consumed" as const, quantity: 2, unit: "count", costEstimate: 1.99, loggedAt: monthsAgo(1, 20) },
    { itemName: "Sour Cream", action: "wasted" as const, quantity: 0.5, unit: "container", costEstimate: 1.25, loggedAt: monthsAgo(1, 23) },
    { itemName: "Tortillas", action: "consumed" as const, quantity: 6, unit: "count", costEstimate: 3.00, loggedAt: monthsAgo(1, 26) },
    { itemName: "Berries", action: "consumed" as const, quantity: 1, unit: "pint", costEstimate: 4.99, loggedAt: monthsAgo(1, 29) },

    // This month
    { itemName: "Milk", action: "consumed" as const, quantity: 1, unit: "gallon", costEstimate: 4.29, loggedAt: daysAgo(12) },
    { itemName: "Lettuce", action: "wasted" as const, quantity: 1, unit: "head", costEstimate: 2.49, loggedAt: daysAgo(8) },
    { itemName: "Onions", action: "consumed" as const, quantity: 2, unit: "count", costEstimate: 1.50, loggedAt: daysAgo(5) },
  ];

  for (const entry of wasteLogData) {
    db.insert(schema.wasteLog).values(entry).run();
  }

  console.log("  ✓ Waste log seeded");
  console.log("Done! Database seeded successfully.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
