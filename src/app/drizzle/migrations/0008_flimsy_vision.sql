ALTER TABLE "analytics_events" ALTER COLUMN "job_listing_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "job_listing_metrics" ALTER COLUMN "job_listing_id" SET DATA TYPE uuid;