import {
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    text,
    uuid,
    varchar,
    index,
  } from "drizzle-orm/pg-core"
  import { JobListingTable } from "./jobListing"
  import { UserTable } from "./user"
  import { createdAt, updatedAt } from "../schemaHelpers"
  import { relations } from "drizzle-orm"
  
  export const applicationStages = [
    "denied",
    "applied",
    "interested",
    "interviewed",
    "hired",
  ] as const
  export type ApplicationStage = (typeof applicationStages)[number]
  export const applicationStageEnum = pgEnum(
    "job_listing_applications_stage",
    applicationStages
  )
  
  export const JobListingApplicationTable = pgTable(
    "job_listing_applications",
    {
      jobListingId: uuid()
        .references(() => JobListingTable.id, { onDelete: "cascade" })
        .notNull(),
      userId: varchar()
        .references(() => UserTable.id, { onDelete: "cascade" })
        .notNull(),
      coverLetter: text(),
      rating: integer(),
      stage: applicationStageEnum().notNull().default("applied"),
      createdAt,
      updatedAt,
    },
    table => ({
      primaryKey: primaryKey({ columns: [table.jobListingId, table.userId] }),
      jobListingIdx: index("job_applications_job_listing_idx").on(table.jobListingId),
      userIdx: index("job_applications_user_idx").on(table.userId),
      stageIdx: index("job_applications_stage_idx").on(table.stage),
      createdAtIdx: index("job_applications_created_at_idx").on(table.createdAt),
      ratingIdx: index("job_applications_rating_idx").on(table.rating),
      // Composite indexes for common queries
      jobListingStageIdx: index("job_applications_job_listing_stage_idx").on(table.jobListingId, table.stage),
      userStageIdx: index("job_applications_user_stage_idx").on(table.userId, table.stage),
    })
  )
  
  export const jobListingApplicationRelations = relations(
    JobListingApplicationTable,
    ({ one }) => ({
      jobListing: one(JobListingTable, {
        fields: [JobListingApplicationTable.jobListingId],
        references: [JobListingTable.id],
      }),
      user: one(UserTable, {
        fields: [JobListingApplicationTable.userId],
        references: [UserTable.id],
      }),
    })
  )