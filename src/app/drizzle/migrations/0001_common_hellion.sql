ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "job_listings" ADD COLUMN "skills" text[] DEFAULT '{}' NOT NULL;