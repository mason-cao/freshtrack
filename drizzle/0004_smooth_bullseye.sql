CREATE INDEX "recipe_ingredients_recipe_id_idx" ON "recipe_ingredients" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_ingredients_name_idx" ON "recipe_ingredients" USING btree ("ingredient_name");--> statement-breakpoint
CREATE INDEX "recipes_name_idx" ON "recipes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "recipes_cuisine_idx" ON "recipes" USING btree ("cuisine");--> statement-breakpoint
CREATE INDEX "recipes_category_idx" ON "recipes" USING btree ("category");