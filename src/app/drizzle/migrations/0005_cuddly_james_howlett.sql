CREATE TYPE "public"."event_type" AS ENUM('page_view', 'job_search', 'job_view', 'job_apply', 'job_bookmark', 'profile_update', 'resume_upload', 'login', 'logout', 'signup', 'job_post', 'job_edit', 'application_review', 'application_status_change', 'email_open', 'email_click');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_type" "event_type" NOT NULL,
	"user_id" varchar,
	"organization_id" varchar,
	"job_listing_id" varchar,
	"session_id" varchar,
	"ip_address" varchar,
	"user_agent" varchar,
	"referrer" varchar,
	"pathname" varchar,
	"search_query" varchar,
	"metadata" json,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"metric_type" varchar NOT NULL,
	"entity_type" varchar,
	"entity_id" varchar,
	"value" integer DEFAULT 0 NOT NULL,
	"metadata" json,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_listing_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_listing_id" varchar NOT NULL,
	"total_views" integer DEFAULT 0 NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"total_applications" integer DEFAULT 0 NOT NULL,
	"bookmarks" integer DEFAULT 0 NOT NULL,
	"search_impressions" integer DEFAULT 0 NOT NULL,
	"click_through_rate" integer DEFAULT 0,
	"average_time_on_page" integer DEFAULT 0,
	"conversion_rate" integer DEFAULT 0,
	"last_calculated" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar NOT NULL,
	"total_job_postings" integer DEFAULT 0 NOT NULL,
	"active_job_postings" integer DEFAULT 0 NOT NULL,
	"total_applications_received" integer DEFAULT 0 NOT NULL,
	"total_hires" integer DEFAULT 0 NOT NULL,
	"average_time_to_hire" integer DEFAULT 0,
	"total_profile_views" integer DEFAULT 0 NOT NULL,
	"response_rate" integer DEFAULT 0,
	"last_calculated" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"total_logins" integer DEFAULT 0 NOT NULL,
	"total_job_views" integer DEFAULT 0 NOT NULL,
	"total_applications" integer DEFAULT 0 NOT NULL,
	"total_bookmarks" integer DEFAULT 0 NOT NULL,
	"total_searches" integer DEFAULT 0 NOT NULL,
	"profile_completeness" integer DEFAULT 0,
	"last_active_date" timestamp with time zone,
	"last_calculated" timestamp with time zone DEFAULT now() NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "job_listings_stateAbbreviation_index";--> statement-breakpoint
ALTER TABLE "job_bookmarks" ADD CONSTRAINT "job_bookmarks_userId_jobListingId_pk" PRIMARY KEY("userId","jobListingId");--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_job_listing_id_job_listings_id_fk" FOREIGN KEY ("job_listing_id") REFERENCES "public"."job_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing_metrics" ADD CONSTRAINT "job_listing_metrics_job_listing_id_job_listings_id_fk" FOREIGN KEY ("job_listing_id") REFERENCES "public"."job_listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_metrics" ADD CONSTRAINT "organization_metrics_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_metrics" ADD CONSTRAINT "user_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_user_id_idx" ON "analytics_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "analytics_events_org_id_idx" ON "analytics_events" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "analytics_events_job_listing_id_idx" ON "analytics_events" USING btree ("job_listing_id");--> statement-breakpoint
CREATE INDEX "daily_metrics_date_idx" ON "daily_metrics" USING btree ("date");--> statement-breakpoint
CREATE INDEX "daily_metrics_metric_type_idx" ON "daily_metrics" USING btree ("metric_type");--> statement-breakpoint
CREATE INDEX "daily_metrics_entity_idx" ON "daily_metrics" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "daily_metrics_unique_idx" ON "daily_metrics" USING btree ("date","metric_type","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "job_listing_metrics_job_id_idx" ON "job_listing_metrics" USING btree ("job_listing_id");--> statement-breakpoint
CREATE INDEX "job_listing_metrics_last_calc_idx" ON "job_listing_metrics" USING btree ("last_calculated");--> statement-breakpoint
CREATE INDEX "org_metrics_org_id_idx" ON "organization_metrics" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "org_metrics_last_calc_idx" ON "organization_metrics" USING btree ("last_calculated");--> statement-breakpoint
CREATE INDEX "user_metrics_user_id_idx" ON "user_metrics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_metrics_last_active_idx" ON "user_metrics" USING btree ("last_active_date");--> statement-breakpoint
CREATE INDEX "user_metrics_last_calc_idx" ON "user_metrics" USING btree ("last_calculated");--> statement-breakpoint
CREATE INDEX "job_listings_status_idx" ON "job_listings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_listings_posted_at_idx" ON "job_listings" USING btree ("postedAt");--> statement-breakpoint
CREATE INDEX "job_listings_featured_idx" ON "job_listings" USING btree ("isFeatured");--> statement-breakpoint
CREATE INDEX "job_listings_org_id_idx" ON "job_listings" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "job_listings_location_idx" ON "job_listings" USING btree ("locationRequirement");--> statement-breakpoint
CREATE INDEX "job_listings_experience_idx" ON "job_listings" USING btree ("experienceLevel");--> statement-breakpoint
CREATE INDEX "job_listings_type_idx" ON "job_listings" USING btree ("type");--> statement-breakpoint
CREATE INDEX "job_listings_state_idx" ON "job_listings" USING btree ("stateAbbreviation");--> statement-breakpoint
CREATE INDEX "job_listings_city_idx" ON "job_listings" USING btree ("city");--> statement-breakpoint
CREATE INDEX "job_listings_wage_idx" ON "job_listings" USING btree ("wage");--> statement-breakpoint
CREATE INDEX "job_listings_status_featured_posted_idx" ON "job_listings" USING btree ("status","isFeatured","postedAt");--> statement-breakpoint
CREATE INDEX "job_listings_status_org_idx" ON "job_listings" USING btree ("status","organizationId");--> statement-breakpoint
CREATE INDEX "job_listings_skills_gin_idx" ON "job_listings" USING gin ("skills");--> statement-breakpoint
CREATE INDEX "job_applications_job_id_idx" ON "job_listing_applications" USING btree ("jobListingId");--> statement-breakpoint
CREATE INDEX "job_applications_user_id_idx" ON "job_listing_applications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "job_applications_stage_idx" ON "job_listing_applications" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "job_applications_created_at_idx" ON "job_listing_applications" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "job_applications_rating_idx" ON "job_listing_applications" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "job_applications_job_stage_idx" ON "job_listing_applications" USING btree ("jobListingId","stage");--> statement-breakpoint
CREATE INDEX "job_applications_job_created_idx" ON "job_listing_applications" USING btree ("jobListingId","createdAt");--> statement-breakpoint
CREATE INDEX "job_bookmarks_user_id_idx" ON "job_bookmarks" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "job_bookmarks_job_id_idx" ON "job_bookmarks" USING btree ("jobListingId");--> statement-breakpoint
CREATE INDEX "job_bookmarks_created_at_idx" ON "job_bookmarks" USING btree ("createdAt");