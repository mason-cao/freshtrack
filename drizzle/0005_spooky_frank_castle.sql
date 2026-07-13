CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "items_user_status_expiration_idx" ON "items" USING btree ("user_id","status","expiration_date");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "waste_log_restore_idx" ON "waste_log" USING btree ("user_id","item_id","action","logged_at");