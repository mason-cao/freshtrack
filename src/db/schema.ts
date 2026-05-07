import {
  date,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  defaultShelfLifeDays: integer("default_shelf_life_days").notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
});

export const items = pgTable(
  "items",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    categoryId: integer("category_id").references(() => categories.id),
    quantity: doublePrecision("quantity").notNull().default(1),
    unit: text("unit").notNull().default("count"),
    purchaseDate: date("purchase_date", { mode: "string" }).notNull(),
    expirationDate: date("expiration_date", { mode: "string" }).notNull(),
    status: text("status", { enum: ["active", "consumed", "wasted"] })
      .notNull()
      .default("active"),
    costEstimate: doublePrecision("cost_estimate"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("items_user_id_idx").on(table.userId),
    index("items_user_status_idx").on(table.userId, table.status),
    index("items_user_expiration_idx").on(table.userId, table.expirationDate),
  ]
);

export const recipes = pgTable(
  "recipes",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    instructions: text("instructions"),
    prepTimeMinutes: integer("prep_time_minutes"),
    cookTimeMinutes: integer("cook_time_minutes"),
    servings: integer("servings"),
  },
  (table) => [index("recipes_user_id_idx").on(table.userId)]
);

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  ingredientName: text("ingredient_name").notNull(),
  quantity: doublePrecision("quantity"),
  unit: text("unit"),
});

export const wasteLog = pgTable(
  "waste_log",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: integer("item_id"),
    itemName: text("item_name").notNull(),
    action: text("action", { enum: ["consumed", "wasted"] }).notNull(),
    quantity: doublePrecision("quantity"),
    unit: text("unit"),
    costEstimate: doublePrecision("cost_estimate"),
    loggedAt: timestamp("logged_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("waste_log_user_id_idx").on(table.userId),
    index("waste_log_user_logged_at_idx").on(table.userId, table.loggedAt),
  ]
);

export const accounts = pgTable(
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
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);
