import { db } from "@/app/drizzle/db"
import { UserNotificationSettingsTable } from "@/app/drizzle/schema"

export async function insertUserNotificationSettings(
  settings: typeof UserNotificationSettingsTable.$inferInsert
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing()
}
