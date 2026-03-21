CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`default_shelf_life_days` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category_id` integer,
	`quantity` real DEFAULT 1 NOT NULL,
	`unit` text DEFAULT 'count' NOT NULL,
	`purchase_date` text NOT NULL,
	`expiration_date` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`cost_estimate` real,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`recipe_id` integer NOT NULL,
	`ingredient_name` text NOT NULL,
	`quantity` real,
	`unit` text,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`instructions` text,
	`prep_time_minutes` integer,
	`cook_time_minutes` integer,
	`servings` integer
);
--> statement-breakpoint
CREATE TABLE `waste_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_id` integer,
	`item_name` text NOT NULL,
	`action` text NOT NULL,
	`quantity` real,
	`unit` text,
	`cost_estimate` real,
	`logged_at` text DEFAULT (datetime('now')) NOT NULL
);
