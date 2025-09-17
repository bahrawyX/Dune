import { pgTable, varchar, uuid, index } from "drizzle-orm/pg-core"
import { createdAt } from "../schemaHelpers"
import { UserTable } from "./user"
import { JobListingTable } from "./jobListing"
import { relations } from "drizzle-orm"

export const JobBookmarkTable = pgTable("job_bookmarks", {
  userId: varchar()
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  jobListingId: uuid()
    .references(() => JobListingTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt,
}, table => ({
  userIdx: index("job_bookmarks_user_idx").on(table.userId),
  jobListingIdx: index("job_bookmarks_job_listing_idx").on(table.jobListingId),
  // Composite index for the most common query pattern
  userJobIdx: index("job_bookmarks_user_job_idx").on(table.userId, table.jobListingId),
  createdAtIdx: index("job_bookmarks_created_at_idx").on(table.createdAt),
}))

export const jobBookmarkRelations = relations(
  JobBookmarkTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [JobBookmarkTable.userId],
      references: [UserTable.id],
    }),
    jobListing: one(JobListingTable, {
      fields: [JobBookmarkTable.jobListingId],
      references: [JobListingTable.id],
    }),
  })
)
