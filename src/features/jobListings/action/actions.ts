"use server"
import z from "zod";
import { jobListingAiSearchSchema, JobListingSchema } from "./schema";
import { getCurrentOrganization, getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import { insertJobListing, updateJobListing as updateJobListingDB, deleteJobListing as deleteJobListingDB } from "../db/jobListings";
import { JobListingTable } from "@/app/drizzle/schema";
import { db } from "@/app/drizzle/db";
import { and, eq } from "drizzle-orm";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { getNextJobListingStatus } from "../util/utils";
import { hasReachedMaxFeaturedJobListings, hasReachedMaxPublishedJobListings } from "../util/planFeaturesHelper";
import { revalidatePath } from "next/cache";
// import { inngest } from "@/services/inngest/client";
// import { getUserResume } from "@/app/(job-seeker)/job-listings/[jobListingId]/page";
import { getMatchingJobListings } from "@/services/inngest/ai/getMatchingListings";
export async function createJobListing(unSafeData:z.infer<typeof JobListingSchema>){
    const {orgId, organization} = await getCurrentOrganization({allData: true});

    if(orgId==null){
        return {
            error:true,
            message: "You need to be a member of an organization to create a job listing"
        }
    }

    if (organization == null) {
        try {
            const { clerkClient } = await import('@clerk/nextjs/server');
            const client = await clerkClient();
            const clerkOrg = await client.organizations.getOrganization({ organizationId: orgId });
            
            // Insert the organization into our database
            const { insertOrganization } = await import('@/features/organizations/db/organizations');
            await insertOrganization({
                id: clerkOrg.id,
                name: clerkOrg.name,
                imageUrl: clerkOrg.imageUrl,
                createdAt: new Date(clerkOrg.createdAt),
                updatedAt: new Date(clerkOrg.updatedAt),
            });
            
            console.log('Organization created in database:', clerkOrg.id);
        } catch (orgError) {
            console.error('Error ensuring organization exists:', orgError);
            return {
                error: true,
                message: "Failed to create organization in database. Please try again."
            };
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
        // Ensure all required fields have values and clean description
        const insertData = {
            ...data,
            organizationId: orgId,
            status: "draft" as const,
            experienceLevel: data.experienceLevel ?? "junior",
            locationRequirement: data.locationRequirement ?? "on-site", 
            type: data.type ?? "full-time",
            wageInterval: data.wageInterval ?? "yearly",
            isFeatured: data.isFeatured ?? false,
            // Ensure city and stateAbbreviation are properly handled
            city: data.city || null,
            stateAbbreviation: data.stateAbbreviation || null,
            wage: data.wage || null,
            // Clean description from HTML entities
            description: data.description.replace(/&#x20;/g, ' ').replace(/&nbsp;/g, ' ')
        };

        console.log('Inserting job listing with data:', insertData);
        console.log('Data types:', {
            wageInterval: typeof insertData.wageInterval,
            experienceLevel: typeof insertData.experienceLevel,
            locationRequirement: typeof insertData.locationRequirement,
            type: typeof insertData.type,
            status: typeof insertData.status
        });
        jobListing = await insertJobListing(insertData)
    } catch (error) {
        console.error('Detailed error creating job listing:');
        console.error('Error object:', error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        if (error && typeof error === 'object' && 'code' in error) {
            console.error('Error code:', error.code);
        }
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

export async function getAiJobListingSearchResults(unsafe: z.infer<typeof jobListingAiSearchSchema>):Promise<{error:true, message:string} | { error: false; jobIds: string[]}> {
  const {success, data} = jobListingAiSearchSchema.safeParse(unsafe);
  if(!success){
    return {
      error: true,
      message: "Error Processing Your Query Contact Support If The Problem Persists"
    }
  }
  const {userId} = await getCurrentUser();
  if(userId == null){
    return {
      error: true,
      message: "You Need To Be Logged In To Use This Feature"
    }
  }
  const allListings = await getPublicJobListings();
  const MatchingListings = await getMatchingJobListings(data.query, allListings,{
    maxNumberOfJobs: 10
  });
  if(MatchingListings.length === 0){
    return {
      error: true,
      message: "No Jobs Matched Your Criteria"
    }
  }
  return {
    error: false,
    jobIds: MatchingListings
  }
}
function getPublicJobListings(){
  return db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, "published"),
    columns: {
      id: true,
      title: true,
      description: true,
      skills: true,
      wage: true,
      wageInterval: true,
      stateAbbreviation: true,
      city: true,
      experienceLevel: true,
      locationRequirement: true,
      type: true,
    },
    with: {
      organization: {
        columns: { name: true },
      },
    },
  })
}
