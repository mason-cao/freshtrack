ALTER TABLE "users" ADD COLUMN "reminder_emails_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "time_zone" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_reminder_on" date;