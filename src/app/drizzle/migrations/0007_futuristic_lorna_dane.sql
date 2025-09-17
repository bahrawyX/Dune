DROP INDEX "job_listings_status_idx";--> statement-breakpoint
DROP INDEX "job_listings_posted_at_idx";--> statement-breakpoint
DROP INDEX "job_listings_featured_idx";--> statement-breakpoint
DROP INDEX "job_listings_org_id_idx";--> statement-breakpoint
DROP INDEX "job_listings_location_idx";--> statement-breakpoint
DROP INDEX "job_listings_experience_idx";--> statement-breakpoint
DROP INDEX "job_listings_type_idx";--> statement-breakpoint
DROP INDEX "job_listings_state_idx";--> statement-breakpoint
DROP INDEX "job_listings_city_idx";--> statement-breakpoint
DROP INDEX "job_listings_wage_idx";--> statement-breakpoint
DROP INDEX "job_listings_status_featured_posted_idx";--> statement-breakpoint
DROP INDEX "job_listings_status_org_idx";--> statement-breakpoint
DROP INDEX "job_listings_skills_gin_idx";--> statement-breakpoint
DROP INDEX "job_applications_job_id_idx";--> statement-breakpoint
DROP INDEX "job_applications_user_id_idx";--> statement-breakpoint
DROP INDEX "job_applications_stage_idx";--> statement-breakpoint
DROP INDEX "job_applications_created_at_idx";--> statement-breakpoint
DROP INDEX "job_applications_rating_idx";--> statement-breakpoint
DROP INDEX "job_applications_job_stage_idx";--> statement-breakpoint
DROP INDEX "job_applications_job_created_idx";--> statement-breakpoint
DROP INDEX "job_bookmarks_user_id_idx";--> statement-breakpoint
DROP INDEX "job_bookmarks_job_id_idx";--> statement-breakpoint
DROP INDEX "job_bookmarks_created_at_idx";--> statement-breakpoint
ALTER TABLE "job_bookmarks" DROP CONSTRAINT "job_bookmarks_userId_jobListingId_pk";--> statement-breakpoint
ALTER TABLE "analytics_events" ALTER COLUMN "job_listing_id" SET DATA TYPE varchar;--> statement-breakpoint
CREATE INDEX "job_listings_stateAbbreviation_index" ON "job_listings" USING btree ("stateAbbreviation");