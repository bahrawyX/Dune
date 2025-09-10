"use server"
import z from "zod";
import { JobListingSchema } from "./schema";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import { insertJobListing, updateJobListing as updateJobListingDB, deleteJobListing as deleteJobListingDB } from "../db/jobListings";
import { JobListingTable } from "@/app/drizzle/schema";
import { db } from "@/app/drizzle/db";
import { and, eq } from "drizzle-orm";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { getNextJobListingStatus } from "../util/utils";
import { hasReachedMaxFeaturedJobListings, hasReachedMaxPublishedJobListings } from "../util/planFeaturesHelper";
import { revalidatePath } from "next/cache";

export async function createJobListing(unSafeData:z.infer<typeof JobListingSchema>){
    const {orgId} = await getCurrentOrganization();

    if(orgId==null){
        return {
            error:true,
            message: "You need to be a member of an organization to create a job listing"
        }
    }

    const hasPermission = await hasOrgUserPermission("job_listings:create");
    
    if(!hasPermission){
        return {
            error:true,
            message: "You don't have permission to create job listings"
        }
    }

    const {success, data} = JobListingSchema.safeParse(unSafeData);
    
    if (!success){
        return {
            error:true,
            message: "Invalid data please provide valid data"
        }
    }

    let jobListing;
    try {
        jobListing = await insertJobListing({
            ...data,
            organizationId:orgId,
            status:"draft" as const,
            experienceLevel: data.experienceLevel ?? "junior",
            locationRequirement: data.locationRequirement ?? "on-site", 
            type: data.type ?? "full-time",
            wageInterval: data.wageInterval ?? "yearly",
            isFeatured: data.isFeatured ?? false
        })
    } catch (error) {
        console.error('Error creating job listing:', error)
        return {
            error: true,
            message: `Failed to create job listing: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
    
    // Redirect after successful creation (outside try-catch to avoid catching redirect error)
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

    const hasPermission = await hasOrgUserPermission("job_listings:update");
    
    if(!hasPermission){
        return {
            error:true,
            message: "You don't have permission to update job listings"
        }
    }

    const {success, data} = JobListingSchema.safeParse(unSafeData);
    
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

    let updatedJobListing;
    try {
        updatedJobListing = await updateJobListingDB(id, data)
    } catch (error) {
        console.error('Error updating job listing:', error)
        return {
            error: true,
            message: `Failed to update job listing: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
    }
    
    redirect(`/employer/job-listings/${updatedJobListing.id}`)
}

function getJobListing(id:string, orgId:string){
    return db.query.JobListingTable.findFirst({
        where: and(eq(JobListingTable.id, id), eq(JobListingTable.organizationId, orgId))
    })
}

export async function toggleJobListingStatus(id: string) {
    const error = {
      error: true,
      message: "You don't have permission to update this job listing's status",
    }
    const { orgId } = await getCurrentOrganization()
    if (orgId == null) return error
  
    const jobListing = await getJobListing(id, orgId)
    if (jobListing == null) return error
  
    const newStatus = getNextJobListingStatus(jobListing.status)
    
    if (!(await hasOrgUserPermission("job_listings:change_status"))) {
      return {
        error: true,
        message: "You don't have permission to change job listing status",
      }
    }
    
    if (newStatus === "published" && (await hasReachedMaxPublishedJobListings())) {
      return {
        error: true,
        message: "You have reached the maximum number of published job listings for your plan",
      }
    }

    try {
      await updateJobListingDB(id, {
        status: newStatus,
        isFeatured: newStatus === "published" ? undefined : false,
        postedAt:
          newStatus === "published" && jobListing.postedAt == null
            ? new Date()
            : undefined,
      })

      // Revalidate the specific job listing page and employer pages
      revalidatePath(`/employer/job-listings/${id}`)
      revalidatePath('/employer')
      revalidatePath('/employer/job-listings')

      return { 
        error: false, 
        message: `Job listing ${newStatus === "published" ? "published" : "delisted"} successfully!` 
      }
    } catch (error) {
      console.error('Error updating job listing status:', error)
      return {
        error: true,
        message: "Failed to update job listing status",
      }
    }
  }

export async function toggleJobListingFeatured(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to update this job listing's featured status",
  }
  const { orgId } = await getCurrentOrganization()
  if (orgId == null) return error

  const jobListing = await getJobListing(id, orgId)
  if (jobListing == null) return error

  const newFeaturedStatus = !jobListing.isFeatured
  
  if (!(await hasOrgUserPermission("job_listings:change_status"))) {
    return {
      error: true,
      message: "You don't have permission to change job listing featured status",
    }
  }
  
  if (newFeaturedStatus === true && (await hasReachedMaxFeaturedJobListings())) {
    return {
      error: true,
      message: "You have reached the maximum number of featured job listings for your plan",
    }
  }

  try {
    await updateJobListingDB(id, {
      isFeatured: newFeaturedStatus,
    })

    // Revalidate the specific job listing page and employer pages
    revalidatePath(`/employer/job-listings/${id}`)
    revalidatePath('/employer')
    revalidatePath('/employer/job-listings')

    return { 
      error: false, 
      message: `Job listing ${newFeaturedStatus === true ? "featured" : "unfeatured"} successfully!` 
    }
  } catch (error) {
    console.error('Error updating job listing featured status:', error)
    return {
      error: true,
      message: "Failed to update job listing featured status",
    }
  }
}

export async function deleteJobListing(id: string)  {
  const error = {
    error: true,
    message: "You don't have permission to delete this job listing",
  }
  const { orgId } = await getCurrentOrganization()
  if (orgId == null) return error

  const jobListing = await getJobListing(id, orgId)
  if (jobListing == null) return error

  if (!(await hasOrgUserPermission("job_listings:delete"))) {
    return {
      error: true,
      message: "You don't have permission to delete job listing",
    }
  }

  try {
    await deleteJobListingDB(id)
    revalidatePath(`/employer/job-listings/${id}`)
    revalidatePath('/employer')
    revalidatePath('/employer/job-listings')

  } catch (error) {
    console.error('Error deleting job listing:', error)
    return {
      error: true,
      message: "Failed to delete job listing",
    }
  }
  redirect('/employer')

}