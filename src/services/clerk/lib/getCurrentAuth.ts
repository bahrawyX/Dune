import { db } from "@/app/drizzle/db"
import { OrganizationTable, UserTable } from "@/app/drizzle/schema"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"

type MaybePromise<T> = T | Promise<T>

export async function getCurrentUser({ allData = false }: { allData?: boolean } = {}) {
    const { userId } = await auth()
    const user = allData && userId != null
        ? await db.query.UserTable.findFirst({ where: eq(UserTable.id, userId) })
        : undefined
    return { userId, user }
}

export async function getCurrentOrganization({ allData = false }: { allData?: boolean } = {}) {
    const { orgId } = await auth()
    const organization = allData && orgId != null
        ? await db.query.OrganizationTable.findFirst({ where: eq(OrganizationTable.id, orgId) })
        : undefined
    return { orgId, organization }
}