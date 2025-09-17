import { boolean, pgTable, varchar, timestamp } from "drizzle-orm/pg-core"
import { createdAt, updatedAt } from "../schemaHelpers"
import { UserTable } from "./user"
import { relations } from "drizzle-orm"

export const UserOnboardingTable = pgTable(
  "user_onboarding",
  {
    userId: varchar()
      .primaryKey()
      .references(() => UserTable.id),
    isCompleted: boolean().notNull().default(false),
    completedAt: timestamp({ withTimezone: true }),
    createdAt,
    updatedAt,
  }
)

export const userOnboardingRelations = relations(
  UserOnboardingTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserOnboardingTable.userId],
      references: [UserTable.id],
    }),
  })
)
