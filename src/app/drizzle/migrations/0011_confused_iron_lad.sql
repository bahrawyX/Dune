-- Drop foreign key constraints first
ALTER TABLE "analytics_events" DROP CONSTRAINT IF EXISTS "analytics_events_job_listing_id_job_listings_id_fk";
ALTER TABLE "job_listing_metrics" DROP CONSTRAINT IF EXISTS "job_listing_metrics_job_listing_id_job_listings_id_fk";

-- Clear existing data in affected tables (development environment)
TRUNCATE TABLE "analytics_events" CASCADE;
TRUNCATE TABLE "job_listing_metrics" CASCADE;

-- Change column types
ALTER TABLE "analytics_events" ALTER COLUMN "job_listing_id" SET DATA TYPE uuid USING NULL;
ALTER TABLE "job_listing_metrics" ALTER COLUMN "job_listing_id" SET DATA TYPE uuid USING NULL;

-- Recreate foreign key constraints
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_job_listing_id_job_listings_id_fk" FOREIGN KEY ("job_listing_id") REFERENCES "job_listings"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "job_listing_metrics" ADD CONSTRAINT "job_listing_metrics_job_listing_id_job_listings_id_fk" FOREIGN KEY ("job_listing_id") REFERENCES "job_listings"("id") ON DELETE cascade ON UPDATE no action;