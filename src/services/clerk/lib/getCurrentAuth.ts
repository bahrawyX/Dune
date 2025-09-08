import { db } from "@/app/drizzle/db";
import { OrganizationTable, UserTable } from "@/app/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

//user Authentication Functions

export async function getCurrentUser ({allData = false} = {}) {
    const {userId} = await auth();
    return {
        userId,
        user:(allData&& userId !== null ) ? await getUser(userId) : undefined
}


function getUser(userId: string) {
    
    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, userId)
    });
}
}

//organization Authentication Functions


export async function getCurrentOrganization ({allData = false} = {}) {
    const {orgId} = await auth();
    return {
        orgId,
        organization: allData && orgId != null  ? await getOrganization(orgId) : undefined
}


function getOrganization(orgId: string) {
    
    return db.query.OrganizationTable.findFirst({
        where: eq(OrganizationTable.id, orgId)
    });
}
}