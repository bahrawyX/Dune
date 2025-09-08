"use server"
import z from "zod";
import { JobListingSchema } from "./schema";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import { insertJobListing, updateJobListing as updateJobListingDB } from "../db/jobListings";
import { JobListingTable } from "@/app/drizzle/schema";
import { db } from "@/app/drizzle/db";
import { and, eq } from "drizzle-orm";

export async function createJobListing(unSafeData:z.infer<typeof JobListingSchema>){
const {orgId} = await getCurrentOrganization();

    if(orgId==null){
        return {
            error:true,
            message: "You need to be a member of an organization to create a job listing"
        }
    }
    const {success  , data} = JobListingSchema.safeParse(unSafeData);
    if (!success){
        return {
            error:true,
            message: "Invalid data please provide valid data"
        }
    }

    const jobListing = await insertJobListing({
        ...data,
        organizationId:orgId,
        status:"draft" as const,
        experienceLevel: data.experienceLevel ?? "junior",
        locationRequirement: data.locationRequirement ?? "on-site", 
        type: data.type ?? "full-time",
        wageInterval: data.wageInterval ?? "yearly",
        isFeatured: data.isFeatured ?? false
    })
    redirect(`/employer/job-listings/${jobListing.id}`)
}
export async function updateJobListing(id:string, unSafeData:z.infer<typeof JobListingSchema>){
    const {orgId} = await getCurrentOrganization();

    if(orgId==null){
        return {
            error:true,
            message: "You need to be a member of an organization to update a job listing"
        }
    }
    const {success  , data} = JobListingSchema.safeParse(unSafeData);
    if (!success){
        return {
            error:true,
            message: "Invalid data please provide valid data"
        }
    }
    
    const jobListing = await getJobListing(id , orgId);
    if (!jobListing) {
        return {
            error: true,
            message: "Job listing not found or you don't have permission to update it"
        }
    }

    try {
        const updatedJobListing = await updateJobListingDB(id, data)
        redirect(`/employer/job-listings/${updatedJobListing.id}`)
    } catch (error) {
        console.error('Error updating job listing:', error)
        return {
            error: true,
            message: "Failed to update job listing"
        }
    }
}

function getJobListing(id:string, orgId:string){
    return db.query.JobListingTable.findFirst({
        where: and(eq(JobListingTable.id, id), eq(JobListingTable.organizationId, orgId))
    })
}