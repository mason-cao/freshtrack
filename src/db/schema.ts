import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  defaultShelfLifeDays: integer("default_shelf_life_days").notNull(),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  quantity: real("quantity").notNull().default(1),
  unit: text("unit").notNull().default("count"),
  purchaseDate: text("purchase_date").notNull(),
  expirationDate: text("expiration_date").notNull(),
  status: text("status", { enum: ["active", "consumed", "wasted"] })
    .notNull()
    .default("active"),
  costEstimate: real("cost_estimate"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const recipes = sqliteTable("recipes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  prepTimeMinutes: integer("prep_time_minutes"),
  cookTimeMinutes: integer("cook_time_minutes"),
  servings: integer("servings"),
});

export const recipeIngredients = sqliteTable("recipe_ingredients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id),
  ingredientName: text("ingredient_name").notNull(),
  quantity: real("quantity"),
  unit: text("unit"),
});

export const wasteLog = sqliteTable("waste_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id"),
  itemName: text("item_name").notNull(),
  action: text("action", { enum: ["consumed", "wasted"] }).notNull(),
  quantity: real("quantity"),
  unit: text("unit"),
  costEstimate: real("cost_estimate"),
  loggedAt: text("logged_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
