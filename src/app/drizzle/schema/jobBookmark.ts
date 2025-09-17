import { pgTable, varchar, timestamp, uuid } from "drizzle-orm/pg-core"
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
})

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
