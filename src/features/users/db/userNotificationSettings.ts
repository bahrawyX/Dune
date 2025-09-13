import { db } from "@/app/drizzle/db"
import { UserNotificationSettingsTable } from "@/app/drizzle/schema"
import { eq } from "drizzle-orm"

export async function insertUserNotificationSettings(
  settings: typeof UserNotificationSettingsTable.$inferInsert
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing()
}

export async function updateUserNotificationSettingsDB(
 userId: string,
 settings: Partial<Omit<typeof UserNotificationSettingsTable.$inferInsert, "userId">>
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values({userId, ...settings})
    .onConflictDoUpdate({
      target: [UserNotificationSettingsTable.userId],
      set: settings,
    })
    return {success: true, message: "Notification settings updated successfully" , error: false}
}

 