import { db } from "@/app/drizzle/db"
import {  JobListingTable } from "@/app/drizzle/schema"
import { eq } from "drizzle-orm";

export async function insertJobListing(jobListing: typeof JobListingTable.$inferInsert) {
 const [newListing] = await db.insert(JobListingTable).values(jobListing).returning({
    id:JobListingTable.id,
    organizationId : JobListingTable.organizationId
 })

 return newListing;
}

export async function updateJobListing(id: string, jobListing: Partial<typeof JobListingTable.$inferInsert>) {
   const [updatedListing] = await db.update(JobListingTable).set(jobListing).where(eq(JobListingTable.id, id)).returning({
      id:JobListingTable.id,
      organizationId : JobListingTable.organizationId
   })
  
   return updatedListing;
  }

  export async function deleteJobListing(id: string) {
   const [deleteListing] = await db.delete(JobListingTable).where(eq(JobListingTable.id, id)).returning({
      id:JobListingTable.id,
      organizationId : JobListingTable.organizationId
   })
  
   return deleteListing;
  }