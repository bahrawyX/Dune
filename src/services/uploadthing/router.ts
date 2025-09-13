import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getCurrentUser } from "../clerk/lib/getCurrentAuth"
import { inngest } from "../inngest/client"
import { eq } from "drizzle-orm"
import { UserResumeTable } from "@/app/drizzle/schema"
import { db } from "@/app/drizzle/db"
import { upsertUserResume } from "@/features/users/db/userResume"
import { uploadthing } from "./client"

const f = createUploadthing()

export const customFileRouter = {
  resumeUploader: f(
    {
      pdf: {
        maxFileSize: "8MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: true }
  )
    .middleware(async () => {
      const { userId, user } = await getCurrentUser({ allData: true })
      if (userId == null) throw new UploadThingError("Unauthorized")

      // Use the actual database user ID, not the Clerk session ID
      let actualUserId = userId;
      
      if (user) {
        // User exists in database - use database ID
        actualUserId = user.id;
        console.log('Using existing database user ID:', actualUserId);
      } else {
        // User doesn't exist in database - create them first like we do in job applications
        console.warn('User not found in database during resume upload, creating user:', userId);
        
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
          
          // Use the actual database user ID (handles email conflicts)
          actualUserId = insertResult.user.id;
          console.log('Created/found user in database with ID:', actualUserId);
          
        } catch (userError) {
          console.error('Error creating user during upload:', userError);
          throw new UploadThingError("Failed to create user account");
        }
      }

      return { userId: actualUserId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId } = metadata
      console.log('Upload complete - userId:', userId, 'file:', file.key);
      
      try {
        // Get previous resume file key before updating
        const resumeFileKey = await _getUserResumeFileKey(userId)
        console.log('Previous resume file key:', resumeFileKey);

        // Save the new resume data first (this is the critical operation)
        await upsertUserResume(userId, {
          resumeFileUrl: file.ufsUrl,
          resumeFileKey: file.key,
        })
        console.log('Resume upserted successfully for user:', userId);

        // Return success immediately to stop loading state
        const response = { message: "Resume uploaded successfully" }

        // Handle cleanup and notifications asynchronously (non-blocking)
        // This prevents these operations from blocking the success response
        setImmediate(async () => {
          try {
            // Delete old file if it exists
            if (resumeFileKey != null) {
              await uploadthing.deleteFiles(resumeFileKey)
              console.log('Deleted old resume file:', resumeFileKey);
            }
          } catch (fileDeleteError) {
            // Don't throw - just log the error so it doesn't affect the success response
            console.error('Warning: Failed to delete old resume file:', fileDeleteError);
          }

          try {
            // Send inngest event
            await inngest.send({ name: "app/resume.uploaded", user: { id: userId }, data: { userId } })
            console.log('Inngest event sent for user:', userId);
          } catch (inngestError) {
            // Don't throw - just log the error so it doesn't affect the success response
            console.error('Warning: Failed to send inngest event:', inngestError);
          }
        });

        return response;
      } catch (error) {
        console.error('Error in upload complete handler:', error);
        // Only throw errors for critical operations (database save)
        throw new UploadThingError(`Failed to save resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }),
} satisfies FileRouter

export type CustomFileRouter = typeof customFileRouter

async function _getUserResumeFileKey(userId: string) {
  const data = await db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: {
      resumeFileKey: true,
    },
  })

  return data?.resumeFileKey
}