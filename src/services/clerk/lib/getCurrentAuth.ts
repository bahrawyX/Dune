import { db } from "@/app/drizzle/db"
import { OrganizationTable, UserTable } from "@/app/drizzle/schema"
import { auth, currentUser } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"

// type MaybePromise<T> = T | Promise<T>

export async function getCurrentUser({ allData = false }: { allData?: boolean } = {}) {
    const { userId } = await auth()
    let user = undefined
    
    if (allData && userId != null) {
        try {
            // First try to find user by direct ID match
            user = await db.query.UserTable.findFirst({ where: eq(UserTable.id, userId) })
            console.log('User FROM GET CURRENT USER (direct ID):', user)
            
            // If no user found by ID, try to find by email as fallback
            if (user == null) {
                console.log('User not found by ID, trying email fallback...')
                const clerkUser = await currentUser()
                if (clerkUser?.primaryEmailAddress?.emailAddress) {
                    user = await db.query.UserTable.findFirst({ 
                        where: eq(UserTable.email, clerkUser.primaryEmailAddress.emailAddress) 
                    })
                    console.log('User FROM GET CURRENT USER (email fallback):', user)
                    
                    // If we found user by email but IDs don't match, this indicates an ID mismatch
                    if (user != null && user.id !== userId) {
                        console.warn(`User ID mismatch detected! Session ID: ${userId}, DB ID: ${user.id}`)
                        // TODO: Consider updating the user ID in the database or creating a mapping
                    }
                }
            }
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