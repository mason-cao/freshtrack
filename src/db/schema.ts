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
    index("items_user_status_expiration_idx").on(
      table.userId,
      table.status,
      table.expirationDate
    ),
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
    // Recipe Dive catalog fields (nullable so existing seeded rows are
    // unaffected). Populated by the one-time TheMealDB import.
    imageUrl: text("image_url"),
    cuisine: text("cuisine"),
    category: text("category"),
    sourceUrl: text("source_url"),
    externalId: text("external_id").unique(),
  },
  (table) => [
    index("recipes_user_id_idx").on(table.userId),
    index("recipes_name_idx").on(table.name),
    index("recipes_cuisine_idx").on(table.cuisine),
    index("recipes_category_idx").on(table.category),
  ]
);

export const recipeIngredients = pgTable(
  "recipe_ingredients",
  {
    id: serial("id").primaryKey(),
    recipeId: integer("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    ingredientName: text("ingredient_name").notNull(),
    quantity: doublePrecision("quantity"),
    unit: text("unit"),
  },
  (table) => [
    index("recipe_ingredients_recipe_id_idx").on(table.recipeId),
    index("recipe_ingredients_name_idx").on(table.ingredientName),
  ]
);

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
    index("waste_log_restore_idx").on(
      table.userId,
      table.itemId,
      table.action,
      table.loggedAt
    ),
  ]
);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    visitorId: text("visitor_id").notNull(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    eventName: text("event_name").notNull(),
    path: text("path").notNull(),
    referrer: text("referrer"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    utmContent: text("utm_content"),
    utmTerm: text("utm_term"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("analytics_events_visitor_id_idx").on(table.visitorId),
    index("analytics_events_user_id_idx").on(table.userId),
    index("analytics_events_event_name_idx").on(table.eventName),
    index("analytics_events_created_at_idx").on(table.createdAt),
    index("analytics_events_utm_idx").on(
      table.utmSource,
      table.utmCampaign,
      table.utmContent
    ),
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
    index("accounts_user_id_idx").on(account.userId),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => [index("sessions_user_id_idx").on(session.userId)]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);
