ALTER TABLE "analytics_events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "daily_metrics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "job_listing_metrics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organization_metrics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_metrics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "analytics_events" CASCADE;--> statement-breakpoint
DROP TABLE "daily_metrics" CASCADE;--> statement-breakpoint
DROP TABLE "job_listing_metrics" CASCADE;--> statement-breakpoint
DROP TABLE "organization_metrics" CASCADE;--> statement-breakpoint
DROP TABLE "user_metrics" CASCADE;--> statement-breakpoint
DROP INDEX "job_listings_stateAbbreviation_index";--> statement-breakpoint
CREATE INDEX "job_listings_state_idx" ON "job_listings" USING btree ("stateAbbreviation");--> statement-breakpoint
CREATE INDEX "job_listings_city_idx" ON "job_listings" USING btree ("city");--> statement-breakpoint
CREATE INDEX "job_listings_status_idx" ON "job_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_listings_posted_at_idx" ON "job_listings" USING btree ("postedAt");--> statement-breakpoint
CREATE INDEX "job_listings_experience_idx" ON "job_listings" USING btree ("experienceLevel");--> statement-breakpoint
CREATE INDEX "job_listings_type_idx" ON "job_listings" USING btree ("type");--> statement-breakpoint
CREATE INDEX "job_listings_location_req_idx" ON "job_listings" USING btree ("locationRequirement");--> statement-breakpoint
CREATE INDEX "job_listings_featured_idx" ON "job_listings" USING btree ("isFeatured");--> statement-breakpoint
CREATE INDEX "job_listings_org_idx" ON "job_listings" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "job_listings_skills_idx" ON "job_listings" USING gin ("skills");--> statement-breakpoint
CREATE INDEX "job_listings_status_posted_idx" ON "job_listings" USING btree ("status","postedAt");--> statement-breakpoint
CREATE INDEX "job_listings_status_featured_idx" ON "job_listings" USING btree ("status","isFeatured");--> statement-breakpoint
CREATE INDEX "job_applications_job_listing_idx" ON "job_listing_applications" USING btree ("jobListingId");--> statement-breakpoint
CREATE INDEX "job_applications_user_idx" ON "job_listing_applications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "job_applications_stage_idx" ON "job_listing_applications" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "job_applications_created_at_idx" ON "job_listing_applications" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "job_applications_rating_idx" ON "job_listing_applications" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "job_applications_job_listing_stage_idx" ON "job_listing_applications" USING btree ("jobListingId","stage");--> statement-breakpoint
CREATE INDEX "job_applications_user_stage_idx" ON "job_listing_applications" USING btree ("userId","stage");--> statement-breakpoint
CREATE INDEX "job_bookmarks_user_idx" ON "job_bookmarks" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "job_bookmarks_job_listing_idx" ON "job_bookmarks" USING btree ("jobListingId");--> statement-breakpoint
CREATE INDEX "job_bookmarks_user_job_idx" ON "job_bookmarks" USING btree ("userId","jobListingId");--> statement-breakpoint
CREATE INDEX "job_bookmarks_created_at_idx" ON "job_bookmarks" USING btree ("createdAt");--> statement-breakpoint
DROP TYPE "public"."event_type";