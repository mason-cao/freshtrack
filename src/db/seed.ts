import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { addDaysToDateInput, toDateInputValue } from "../lib/dates";

const url = process.env.TURSO_DATABASE_URL ?? "file:./data/freshtrack.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

function daysFromNow(days: number): string {
  return addDaysToDateInput(days);
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

function monthsAgo(months: number, dayOffset = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(d.getDate() + dayOffset);
  return toDateInputValue(d);
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(schema.wasteLog).run();
  await db.delete(schema.recipeIngredients).run();
  await db.delete(schema.recipes).run();
  await db.delete(schema.items).run();
  await db.delete(schema.categories).run();

  // Reset autoincrement counters so IDs start from 1
  await db.run(sql`DELETE FROM sqlite_sequence`);

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
    { name: "Condiments", icon: "🫙", defaultShelfLifeDays: 180 },
    { name: "Grains & Pasta", icon: "🌾", defaultShelfLifeDays: 365 },
  ];

  for (const cat of categoryData) {
    await db.insert(schema.categories).values(cat).run();
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

    // More fresh items
    { name: "Hummus", categoryId: 8, quantity: 1, unit: "container", purchaseDate: daysAgo(3), expirationDate: daysFromNow(18), costEstimate: 3.99 },
    { name: "Mushrooms", categoryId: 1, quantity: 1, unit: "pack", purchaseDate: daysAgo(1), expirationDate: daysFromNow(5), costEstimate: 2.49 },
    { name: "Lemon", categoryId: 1, quantity: 3, unit: "count", purchaseDate: daysAgo(2), expirationDate: daysFromNow(14), costEstimate: 1.50 },
    { name: "Garlic", categoryId: 1, quantity: 1, unit: "bulb", purchaseDate: daysAgo(5), expirationDate: daysFromNow(25), costEstimate: 0.75 },
    { name: "Onions", categoryId: 1, quantity: 3, unit: "count", purchaseDate: daysAgo(4), expirationDate: daysFromNow(20), costEstimate: 1.29 },
    { name: "Bacon", categoryId: 3, quantity: 1, unit: "pack", purchaseDate: daysAgo(2), expirationDate: daysFromNow(8), costEstimate: 6.49 },
    { name: "Shrimp", categoryId: 5, quantity: 1, unit: "bag", purchaseDate: daysAgo(7), expirationDate: daysFromNow(83), costEstimate: 9.99 },
    { name: "Peanut Butter", categoryId: 9, quantity: 1, unit: "jar", purchaseDate: daysAgo(14), expirationDate: daysFromNow(150), costEstimate: 4.29 },
    { name: "Olive Oil", categoryId: 9, quantity: 1, unit: "bottle", purchaseDate: daysAgo(30), expirationDate: daysFromNow(335), costEstimate: 7.99 },
    { name: "Honey", categoryId: 9, quantity: 1, unit: "bottle", purchaseDate: daysAgo(20), expirationDate: daysFromNow(345), costEstimate: 6.49 },
    { name: "Rice", categoryId: 10, quantity: 2, unit: "lbs", purchaseDate: daysAgo(10), expirationDate: daysFromNow(355), costEstimate: 3.49 },
    { name: "Spaghetti", categoryId: 10, quantity: 1, unit: "box", purchaseDate: daysAgo(15), expirationDate: daysFromNow(350), costEstimate: 1.79 },
    { name: "Cucumber", categoryId: 1, quantity: 2, unit: "count", purchaseDate: daysAgo(2), expirationDate: daysFromNow(5), costEstimate: 1.29 },
    { name: "Apples", categoryId: 1, quantity: 4, unit: "count", purchaseDate: daysAgo(3), expirationDate: daysFromNow(11), costEstimate: 3.20 },
    { name: "Bananas", categoryId: 1, quantity: 5, unit: "count", purchaseDate: daysAgo(2), expirationDate: daysFromNow(3), costEstimate: 1.49 },
    { name: "Strawberries", categoryId: 1, quantity: 1, unit: "pint", purchaseDate: daysAgo(1), expirationDate: daysFromNow(4), costEstimate: 3.99 },

    // Expired (gray)
    { name: "Avocados", categoryId: 1, quantity: 2, unit: "count", purchaseDate: daysAgo(8), expirationDate: daysAgo(2), costEstimate: 2.50 },
    { name: "Fresh Basil", categoryId: 1, quantity: 1, unit: "bunch", purchaseDate: daysAgo(7), expirationDate: daysAgo(1), costEstimate: 2.99 },
    { name: "Ground Turkey", categoryId: 3, quantity: 1, unit: "lbs", purchaseDate: daysAgo(6), expirationDate: daysAgo(1), costEstimate: 5.99 },
  ];

  for (const item of itemsData) {
    await db.insert(schema.items).values({
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
    {
      name: "Garlic Shrimp Pasta",
      description: "Quick garlic butter shrimp over spaghetti",
      instructions: "1. Cook spaghetti according to package directions\n2. Mince garlic and sauté in olive oil\n3. Add shrimp and cook 2-3 minutes per side\n4. Squeeze lemon juice over shrimp\n5. Toss with pasta and season with salt and pepper\n6. Garnish with fresh basil",
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 3,
      ingredients: [
        { ingredientName: "shrimp", quantity: 1, unit: "lbs" },
        { ingredientName: "spaghetti", quantity: 0.5, unit: "box" },
        { ingredientName: "garlic", quantity: 4, unit: "cloves" },
        { ingredientName: "olive oil", quantity: 2, unit: "tbsp" },
        { ingredientName: "lemon", quantity: 1, unit: "count" },
      ],
    },
    {
      name: "Bacon & Egg Fried Rice",
      description: "Savory fried rice with crispy bacon and scrambled eggs",
      instructions: "1. Cook rice and let it cool (or use day-old rice)\n2. Dice bacon and fry until crispy\n3. Scramble eggs in the same pan, set aside\n4. Stir-fry rice with garlic and onion\n5. Add back bacon and eggs\n6. Season with soy sauce and serve",
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 3,
      ingredients: [
        { ingredientName: "rice", quantity: 2, unit: "cups" },
        { ingredientName: "bacon", quantity: 4, unit: "slices" },
        { ingredientName: "eggs", quantity: 3, unit: "count" },
        { ingredientName: "garlic", quantity: 2, unit: "cloves" },
        { ingredientName: "onions", quantity: 0.5, unit: "count" },
      ],
    },
    {
      name: "Mushroom & Spinach Omelette",
      description: "Fluffy omelette loaded with sautéed mushrooms and spinach",
      instructions: "1. Slice mushrooms and sauté until golden\n2. Add spinach and cook until wilted, set aside\n3. Whisk eggs with a pinch of salt\n4. Pour eggs into a buttered non-stick pan\n5. Add mushroom-spinach filling and cheese\n6. Fold and cook until set",
      prepTimeMinutes: 5,
      cookTimeMinutes: 8,
      servings: 1,
      ingredients: [
        { ingredientName: "eggs", quantity: 3, unit: "count" },
        { ingredientName: "mushrooms", quantity: 0.5, unit: "cup" },
        { ingredientName: "spinach", quantity: 1, unit: "cup" },
        { ingredientName: "cheddar cheese", quantity: 0.25, unit: "cup" },
      ],
    },
    {
      name: "Honey Lemon Salmon",
      description: "Baked salmon glazed with honey and fresh lemon",
      instructions: "1. Preheat oven to 375°F\n2. Mix honey, lemon juice, and minced garlic\n3. Place salmon on parchment-lined baking sheet\n4. Brush generously with honey-lemon glaze\n5. Bake for 15-18 minutes until flaky\n6. Serve with rice and steamed vegetables",
      prepTimeMinutes: 10,
      cookTimeMinutes: 18,
      servings: 2,
      ingredients: [
        { ingredientName: "salmon", quantity: 0.75, unit: "lbs" },
        { ingredientName: "honey", quantity: 2, unit: "tbsp" },
        { ingredientName: "lemon", quantity: 1, unit: "count" },
        { ingredientName: "garlic", quantity: 2, unit: "cloves" },
        { ingredientName: "rice", quantity: 1, unit: "cup" },
      ],
    },
    {
      name: "Greek Cucumber Salad",
      description: "Cool and refreshing cucumber salad with lemon dressing",
      instructions: "1. Slice cucumbers into thin rounds\n2. Dice bell peppers and onion\n3. Combine in a bowl\n4. Whisk olive oil, lemon juice, and garlic\n5. Pour dressing over salad and toss\n6. Season with salt and pepper",
      prepTimeMinutes: 10,
      cookTimeMinutes: 0,
      servings: 4,
      ingredients: [
        { ingredientName: "cucumber", quantity: 2, unit: "count" },
        { ingredientName: "bell peppers", quantity: 1, unit: "count" },
        { ingredientName: "onions", quantity: 0.25, unit: "count" },
        { ingredientName: "olive oil", quantity: 2, unit: "tbsp" },
        { ingredientName: "lemon", quantity: 1, unit: "count" },
      ],
    },
    {
      name: "PB & Banana Smoothie",
      description: "Creamy peanut butter banana smoothie with honey",
      instructions: "1. Peel and slice banana\n2. Add banana, peanut butter, and milk to blender\n3. Add honey for sweetness\n4. Blend until smooth and creamy\n5. Pour into glass and enjoy",
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      servings: 1,
      ingredients: [
        { ingredientName: "bananas", quantity: 1, unit: "count" },
        { ingredientName: "peanut butter", quantity: 2, unit: "tbsp" },
        { ingredientName: "milk", quantity: 1, unit: "cup" },
        { ingredientName: "honey", quantity: 1, unit: "tbsp" },
      ],
    },
    {
      name: "Apple Cinnamon Yogurt Bowl",
      description: "Greek yogurt topped with diced apples, honey, and trail mix",
      instructions: "1. Dice apple into small cubes\n2. Spoon yogurt into a bowl\n3. Top with diced apples\n4. Drizzle with honey\n5. Sprinkle trail mix for crunch\n6. Add a dash of cinnamon",
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      servings: 1,
      ingredients: [
        { ingredientName: "greek yogurt", quantity: 1, unit: "cup" },
        { ingredientName: "apples", quantity: 1, unit: "count" },
        { ingredientName: "honey", quantity: 1, unit: "tbsp" },
        { ingredientName: "trail mix", quantity: 0.25, unit: "cup" },
      ],
    },
    {
      name: "Chicken Bacon Ranch Wrap",
      description: "Hearty wrap with chicken, crispy bacon, and ranch",
      instructions: "1. Slice chicken breast and season with salt and pepper\n2. Cook chicken in a pan until golden\n3. Cook bacon until crispy and chop\n4. Warm tortilla\n5. Layer chicken, bacon, cheese, and spinach\n6. Drizzle with sour cream and roll up tightly",
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      servings: 2,
      ingredients: [
        { ingredientName: "chicken breast", quantity: 0.5, unit: "lbs" },
        { ingredientName: "bacon", quantity: 3, unit: "slices" },
        { ingredientName: "tortillas", quantity: 2, unit: "count" },
        { ingredientName: "cheddar cheese", quantity: 0.5, unit: "cup" },
        { ingredientName: "spinach", quantity: 1, unit: "cup" },
        { ingredientName: "sour cream", quantity: 2, unit: "tbsp" },
      ],
    },
    {
      name: "Strawberry Banana Smoothie",
      description: "Classic fruity smoothie with yogurt",
      instructions: "1. Hull strawberries\n2. Slice banana\n3. Add strawberries, banana, yogurt, and milk to blender\n4. Blend until smooth\n5. Pour and serve immediately",
      prepTimeMinutes: 5,
      cookTimeMinutes: 0,
      servings: 2,
      ingredients: [
        { ingredientName: "strawberries", quantity: 1, unit: "cup" },
        { ingredientName: "bananas", quantity: 1, unit: "count" },
        { ingredientName: "greek yogurt", quantity: 0.5, unit: "cup" },
        { ingredientName: "milk", quantity: 0.5, unit: "cup" },
      ],
    },
  ];

  for (const recipe of recipesData) {
    const { ingredients, ...recipeRow } = recipe;
    const result = await db.insert(schema.recipes).values(recipeRow).returning().get();
    for (const ing of ingredients) {
      await db.insert(schema.recipeIngredients)
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
    { itemName: "Bacon", action: "consumed" as const, quantity: 1, unit: "pack", costEstimate: 6.49, loggedAt: daysAgo(10) },
    { itemName: "Shrimp", action: "consumed" as const, quantity: 1, unit: "bag", costEstimate: 9.99, loggedAt: daysAgo(7) },
    { itemName: "Apples", action: "consumed" as const, quantity: 3, unit: "count", costEstimate: 2.40, loggedAt: daysAgo(4) },
    { itemName: "Cucumber", action: "wasted" as const, quantity: 1, unit: "count", costEstimate: 0.65, loggedAt: daysAgo(3) },
    { itemName: "Bananas", action: "consumed" as const, quantity: 4, unit: "count", costEstimate: 1.20, loggedAt: daysAgo(2) },
    { itemName: "Honey", action: "consumed" as const, quantity: 0.5, unit: "bottle", costEstimate: 3.25, loggedAt: daysAgo(6) },
    { itemName: "Rice", action: "consumed" as const, quantity: 1, unit: "cup", costEstimate: 0.60, loggedAt: daysAgo(9) },
    { itemName: "Mushrooms", action: "wasted" as const, quantity: 0.5, unit: "pack", costEstimate: 1.25, loggedAt: daysAgo(1) },
  ];

  for (const entry of wasteLogData) {
    await db.insert(schema.wasteLog).values(entry).run();
  }

  console.log("  ✓ Waste log seeded");
  console.log("Done! Database seeded successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
