DROP INDEX "job_bookmarks_user_job_idx";--> statement-breakpoint
ALTER TABLE "job_bookmarks" ADD CONSTRAINT "job_bookmarks_userId_jobListingId_pk" PRIMARY KEY("userId","jobListingId");