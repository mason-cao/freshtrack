ALTER TABLE `items` ADD `user_id` text NOT NULL REFERENCES users(id) ON DELETE CASCADE;--> statement-breakpoint
CREATE INDEX `items_user_id_idx` ON `items` (`user_id`);--> statement-breakpoint
CREATE INDEX `items_user_status_idx` ON `items` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `items_user_expiration_idx` ON `items` (`user_id`,`expiration_date`);--> statement-breakpoint
ALTER TABLE `recipes` ADD `user_id` text NOT NULL REFERENCES users(id) ON DELETE CASCADE;--> statement-breakpoint
CREATE INDEX `recipes_user_id_idx` ON `recipes` (`user_id`);--> statement-breakpoint
ALTER TABLE `waste_log` ADD `user_id` text NOT NULL REFERENCES users(id) ON DELETE CASCADE;--> statement-breakpoint
CREATE INDEX `waste_log_user_id_idx` ON `waste_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `waste_log_user_logged_at_idx` ON `waste_log` (`user_id`,`logged_at`);
