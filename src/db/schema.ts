import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
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

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    pk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
