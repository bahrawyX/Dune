import { db } from "@/app/drizzle/db"
import { OrganizationTable, OrganizationUserSettingsTable } from "@/app/drizzle/schema"
import { and, eq } from "drizzle-orm"

export async function insertOrganization(organization: typeof OrganizationTable.$inferInsert) {
  await db.insert(OrganizationTable).values(organization).onConflictDoNothing()

}

export async function updateOrganization(
  id: string,
  organization: Partial<typeof OrganizationTable.$inferInsert>
) {
  await db.update(OrganizationTable).set(organization).where(eq(OrganizationTable.id, id))

}

export async function deleteOrganization(id: string) {
  await db.delete(OrganizationTable).where(eq(OrganizationTable.id, id))

}
export async function insertOrganizationUserSettings(organizationUserSettings: typeof OrganizationUserSettingsTable.$inferInsert) {
  const [newSettings] = await db.insert(OrganizationUserSettingsTable).values(organizationUserSettings).onConflictDoNothing()
    .returning({
      userId: OrganizationUserSettingsTable.userId,
      organizationId: OrganizationUserSettingsTable.organizationId,
    })
}
export async function deleteOrganizationUserSettings(userId: string, organizationId: string) {
  await db.delete(OrganizationUserSettingsTable).where(and(eq(OrganizationUserSettingsTable.userId, userId), eq(OrganizationUserSettingsTable.organizationId, organizationId)))
}
