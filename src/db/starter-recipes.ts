export const starterRecipeSeedData = [
  {
    id: 1,
    name: "Chicken Stir Fry",
    description: "Quick chicken and vegetable stir fry for weeknight dinners.",
    instructions:
      "1. Slice chicken breast into strips\n2. Dice bell peppers and slice carrots\n3. Heat oil in a wok over high heat\n4. Cook chicken until golden, about 5 minutes\n5. Add vegetables and stir fry 3-4 minutes\n6. Season with soy sauce and serve over rice",
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
    id: 2,
    name: "Yogurt Parfait",
    description: "Layered yogurt with berries and crunchy trail mix.",
    instructions:
      "1. Spoon yogurt into a glass or bowl\n2. Add a layer of berries\n3. Repeat layers\n4. Top with trail mix\n5. Drizzle with honey if desired",
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    servings: 1,
    ingredients: [
      { ingredientName: "greek yogurt", quantity: 1, unit: "cup" },
      { ingredientName: "berries", quantity: 0.5, unit: "cup" },
      { ingredientName: "trail mix", quantity: 0.25, unit: "cup" },
    ],
  },
  {
    id: 3,
    name: "Classic Grilled Cheese",
    description: "Crispy grilled cheese for using up bread and cheese.",
    instructions:
      "1. Butter two slices of bread on one side\n2. Place cheese between unbuttered sides\n3. Grill in a pan over medium heat\n4. Cook 3-4 minutes per side until golden and cheese melts",
    prepTimeMinutes: 5,
    cookTimeMinutes: 8,
    servings: 1,
    ingredients: [
      { ingredientName: "bread", quantity: 2, unit: "slices" },
      { ingredientName: "cheddar cheese", quantity: 2, unit: "slices" },
    ],
  },
  {
    id: 4,
    name: "Salmon with Lemon and Herbs",
    description: "Simple baked salmon with lemon and fresh greens.",
    instructions:
      "1. Preheat oven to 400 F\n2. Place salmon on a lined baking sheet\n3. Season with salt, pepper, and herbs\n4. Squeeze lemon juice over the top\n5. Bake for 12-15 minutes until flaky\n6. Serve with spinach or a side salad",
    prepTimeMinutes: 5,
    cookTimeMinutes: 15,
    servings: 2,
    ingredients: [
      { ingredientName: "salmon", quantity: 0.75, unit: "lbs" },
      { ingredientName: "lemon", quantity: 1, unit: "count" },
      { ingredientName: "spinach", quantity: 3, unit: "cups" },
    ],
  },
  {
    id: 5,
    name: "Chicken Quesadilla",
    description: "Cheesy chicken quesadilla with peppers and sour cream.",
    instructions:
      "1. Shred or dice cooked chicken\n2. Dice bell peppers\n3. Place tortilla in a pan over medium heat\n4. Add cheese, chicken, and peppers to one half\n5. Fold and cook 2-3 minutes per side\n6. Serve with sour cream",
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
    id: 6,
    name: "Veggie Egg Scramble",
    description: "Fluffy eggs with vegetables and a little cheese.",
    instructions:
      "1. Whisk eggs with a splash of milk\n2. Dice bell peppers and chop spinach\n3. Saute vegetables in butter for 2 minutes\n4. Pour in eggs and gently stir\n5. Cook until just set, about 3 minutes\n6. Season with salt and pepper",
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
    id: 7,
    name: "Carrot Ginger Soup",
    description: "Creamy carrot soup with a warm ginger note.",
    instructions:
      "1. Peel and chop carrots\n2. Saute with onion and ginger\n3. Add vegetable broth and simmer 20 minutes\n4. Blend until smooth\n5. Stir in sour cream and season to taste\n6. Serve with crusty bread",
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
    id: 8,
    name: "Garlic Shrimp Pasta",
    description: "Quick garlic shrimp tossed with spaghetti.",
    instructions:
      "1. Cook spaghetti according to package directions\n2. Mince garlic and saute in olive oil\n3. Add shrimp and cook 2-3 minutes per side\n4. Squeeze lemon juice over shrimp\n5. Toss with pasta and season with salt and pepper\n6. Garnish with herbs if available",
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
    id: 9,
    name: "Bacon and Egg Fried Rice",
    description: "Savory fried rice with crispy bacon and scrambled eggs.",
    instructions:
      "1. Cook rice and let it cool\n2. Dice bacon and fry until crispy\n3. Scramble eggs in the same pan, then set aside\n4. Stir-fry rice with garlic and onion\n5. Add back bacon and eggs\n6. Season with soy sauce and serve",
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
    id: 10,
    name: "Apple Cinnamon Yogurt Bowl",
    description: "Greek yogurt topped with apples, honey, and trail mix.",
    instructions:
      "1. Dice apple into small cubes\n2. Spoon yogurt into a bowl\n3. Top with diced apples\n4. Drizzle with honey\n5. Sprinkle trail mix for crunch\n6. Add cinnamon if available",
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
] as const;
