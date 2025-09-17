import { db } from "@/app/drizzle/db"
import { OrganizationTable, UserTable } from "@/app/drizzle/schema"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"

// type MaybePromise<T> = T | Promise<T>

export async function getCurrentUser({ allData = false }: { allData?: boolean } = {}) {
    const { userId } = await auth()
    let user = undefined
    
    if (allData && userId != null) {
        try {
            user = await db.query.UserTable.findFirst({ where: eq(UserTable.id, userId) })
        } catch (error) {
            console.log('Failed to fetch user from database:', error)
            user = undefined
        }
    }
    
    return { userId, user }
}

export async function getCurrentOrganization({ allData = false }: { allData?: boolean } = {}) {
    const { orgId } = await auth()
    let organization = undefined
    
    if (allData && orgId != null) {
        try {
            organization = await db.query.OrganizationTable.findFirst({ where: eq(OrganizationTable.id, orgId) })
        } catch (error) {
            console.log('Failed to fetch organization from database:', error)
            organization = undefined
        }
    }
    
    return { orgId, organization }
}