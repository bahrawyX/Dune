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
      console.log('=== CV UPLOAD: Starting upload process ===');
      const { userId, user } = await getCurrentUser({ allData: true })
      console.log('CV UPLOAD: Retrieved user data - userId:', userId, 'user exists:', !!user);
      
      if (userId == null) {
        console.error('CV UPLOAD: Unauthorized - no userId found');
        throw new UploadThingError("Unauthorized")
      }

      // Use the actual database user ID, not the Clerk session ID
      let actualUserId = userId;
      
      if (user) {
        // User exists in database - use database ID
        actualUserId = user.id;
        console.log('CV UPLOAD: User found in database - actualUserId:', actualUserId, 'email:', user.email, 'name:', user.name);
      } else {
        // User doesn't exist in database - create them first like we do in job applications
        console.warn('CV UPLOAD: User not found in database during resume upload, creating user:', userId);
        
        try {
          console.log('CV UPLOAD: Fetching user data from Clerk for userId:', userId);
          const { clerkClient } = await import('@clerk/nextjs/server');
          const client = await clerkClient();
          const clerkUser = await client.users.getUser(userId);
          console.log('CV UPLOAD: Clerk user data retrieved - id:', clerkUser.id, 'email:', clerkUser.emailAddresses[0]?.emailAddress, 'name:', `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim());
          
          // Insert the user into our database
          const { insertUser } = await import('@/features/users/db/users');
          console.log('CV UPLOAD: Inserting user into database...');
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
          console.log('CV UPLOAD: Created/found user in database with ID:', actualUserId);
          
        } catch (userError) {
          console.error('CV UPLOAD: Error creating user during upload:', userError);
          throw new UploadThingError("Failed to create user account");
        }
      }

      console.log('CV UPLOAD: Middleware completed - returning userId:', actualUserId);
      return { userId: actualUserId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId } = metadata
      console.log('=== CV UPLOAD: Upload completed successfully ===');
      console.log('CV UPLOAD: File details - key:', file.key, 'name:', file.name, 'size:', file.size, 'type:', file.type);
      console.log('CV UPLOAD: File URLs - url:', file.url, 'ufsUrl:', file.ufsUrl);
      console.log('CV UPLOAD: Processing for userId:', userId);
      
      try {
        // Get previous resume file key before updating
        const resumeFileKey = await _getUserResumeFileKey(userId)
        console.log('CV UPLOAD: Previous resume file key:', resumeFileKey);

        // Save the new resume data first (this is the critical operation)
        console.log('CV UPLOAD: Upserting resume data to database...');
        await upsertUserResume(userId, {
          resumeFileUrl: file.ufsUrl,
          resumeFileKey: file.key,
        })
        console.log('CV UPLOAD: Resume upserted successfully for user:', userId, 'new URL:', file.ufsUrl);

        // Return success immediately to stop loading state
        const response = { message: "Resume uploaded successfully" }
        console.log('CV UPLOAD: Returning success response to client');

        // Handle cleanup and notifications asynchronously (non-blocking)
        // This prevents these operations from blocking the success response
        setImmediate(async () => {
          console.log('CV UPLOAD: Starting async cleanup and notification tasks...');
          try {
            // Delete old file if it exists
            if (resumeFileKey != null) {
              console.log('CV UPLOAD: Attempting to delete old resume file:', resumeFileKey);
              await uploadthing.deleteFiles(resumeFileKey)
              console.log('CV UPLOAD: Successfully deleted old resume file:', resumeFileKey);
            } else {
              console.log('CV UPLOAD: No previous resume file to delete');
            }
          } catch (fileDeleteError) {
            // Don't throw - just log the error so it doesn't affect the success response
            console.error('CV UPLOAD: Warning - Failed to delete old resume file:', fileDeleteError);
          }

          try {
            // Send inngest event
            console.log('CV UPLOAD: Sending inngest event for user:', userId);
            const eventData = { name: "app/resume.uploaded" as const, user: { id: userId }, data: { userId, resumeUrl: file.ufsUrl, fileKey: file.key } };
            console.log('CV UPLOAD: Event data:', JSON.stringify(eventData, null, 2));
            await inngest.send(eventData);
            console.log('CV UPLOAD: Inngest event sent successfully for user:', userId);
          } catch (inngestError) {
            // Don't throw - just log the error so it doesn't affect the success response
            console.error('CV UPLOAD: Warning - Failed to send inngest event:', inngestError);
            console.error('CV UPLOAD: Error details:', JSON.stringify(inngestError, null, 2));
          }
          console.log('CV UPLOAD: Async tasks completed for user:', userId);
        });

        return response;
      } catch (error) {
        console.error('CV UPLOAD: Critical error in upload complete handler for user:', userId);
        console.error('CV UPLOAD: Error details:', error);
        console.error('CV UPLOAD: Error type:', typeof error);
        console.error('CV UPLOAD: Error message:', error instanceof Error ? error.message : 'Unknown error');
        console.error('CV UPLOAD: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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