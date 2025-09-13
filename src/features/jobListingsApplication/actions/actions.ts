"use server"

import { db } from "@/app/drizzle/db"
import { JobListingTable, UserResumeTable, UserTable } from "@/app/drizzle/schema"
import { newjobListingApplicationSchema } from "@/features/jobListings/action/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { and, eq } from "drizzle-orm"
import z from "zod"
import { insertJobListingApplication } from "../db/jobListingApplication"
import { inngest } from "@/services/inngest/client"
import { revalidatePath } from "next/cache"

export async function createJobListingApplication(
  jobListingId: string,
  unsafeData: z.infer<typeof newjobListingApplicationSchema>
) {
  const permissionError = {
    error: true,
    message: "You don't have permission to submit an application",
  }
  let { userId, user } = await getCurrentUser({ allData: true })
  if (userId == null) return permissionError

  // Ensure user exists in our database before creating application
  if (user == null) {
    try {
      const { clerkClient } = await import('@clerk/nextjs/server');
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      
      // Insert the user into our database
      const { insertUser } = await import('@/features/users/db/users');
      const insertResult = await insertUser({
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        imageUrl: clerkUser.imageUrl,
        createdAt: new Date(clerkUser.createdAt),
        updatedAt: new Date(clerkUser.updatedAt),
      });
      
      if (insertResult.created) {
        console.log('New user created in database:', clerkUser.id);
      } else {
        console.log('User already existed in database:', clerkUser.id);
      }
      
      // User should now exist (either created or was already there)
      console.log('User confirmed in database:', insertResult.user.id);
      
      const actualUserId = insertResult.user.id;
      userId = actualUserId;
      
    } catch (userError) {
      console.error('Error ensuring user exists:', userError);
      return {
        error: true,
        message: "Failed to create user in database. Please try again."
      };
    }
  } else {
    userId = user.id;
  }

  const [userResume, jobListing] = await Promise.all([
    getUserResume(userId),
    getPublicJobListing(jobListingId),
  ])
  if ( jobListing == null || userResume == null) return permissionError

  const { success, data } = newjobListingApplicationSchema.safeParse(unsafeData)

  if (!success) {
    return {
      error: true,
      message: "There was an error submitting your application",
    }
  }

  try {
    await insertJobListingApplication({
      jobListingId,
      userId,
      ...data,
    })

    revalidatePath(`/job-listings/${jobListingId}`)

    await inngest.send({
      name: "app/jobListingApplication.created",
      data: { jobListingId, userId },
    })

    return {
      error: false,
      message: "Your application was successfully submitted",
    }
  } catch (insertError) {
    console.error('Error inserting job application:', insertError);
    
    if (insertError && typeof insertError === 'object' && 'code' in insertError && insertError.code === '23503') {
      console.error('Foreign key constraint violation - checking if user exists...');
      
      try {
        const userCheck = await db.query.UserTable.findFirst({
          where: eq(UserTable.id, userId)
        });
        
        if (!userCheck) {
          console.error('User does not exist in database despite creation attempt:', userId);
        } else {
          console.error('User exists but foreign key constraint still failed:', userId, userCheck);
        }
      } catch (checkError) {
        console.error('Error checking user existence:', checkError);
      }
      
      return {
        error: true,
        message: "There was an issue with your user account. Please try signing out and back in, then try again."
      }
    }
    
    return {
      error: true,
      message: "Failed to submit your application. Please try again."
    }
  }
}
async function getPublicJobListing(id: string) {
  return await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published")
    ),
    columns: { id: true}
  })
}
async function getUserResume(id: string) {
  return await db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, id),
    columns: { userId: true}
  })

}
