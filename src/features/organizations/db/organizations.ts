import { db } from "@/app/drizzle/db"
import { OrganizationTable } from "@/app/drizzle/schema"
import { eq } from "drizzle-orm"

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