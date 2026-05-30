ALTER TABLE "recipes" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "cuisine" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "external_id" text;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_external_id_unique" UNIQUE("external_id");