"use server"

import { db } from "@/app/drizzle/db"
import { UserOnboardingTable } from "@/app/drizzle/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export async function checkOnboardingStatus() {
  const { userId } = await getCurrentUser()
  
  if (!userId) {
    redirect("/sign-in")
  }

  const onboardingStatus = await db.query.UserOnboardingTable.findFirst({
    where: eq(UserOnboardingTable.userId, userId)
  })

  return {
    isCompleted: onboardingStatus?.isCompleted ?? false,
    completedAt: onboardingStatus?.completedAt
  }
}

export async function markOnboardingComplete() {
  const { userId, user } = await getCurrentUser({ allData: true })
  
  if (!userId) {
    throw new Error("User not authenticated")
  }

  // Ensure user exists in our database before creating onboarding record
  // (the user might not exist yet if the Clerk webhook hasn't been processed)
  let actualUserId = userId
  
  if (user == null) {
    try {
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)
      
      // Insert the user into our database
      const { insertUser } = await import('@/features/users/db/users')
      const insertResult = await insertUser({
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        imageUrl: clerkUser.imageUrl,
        createdAt: new Date(clerkUser.createdAt),
        updatedAt: new Date(clerkUser.updatedAt),
      })
      
      actualUserId = insertResult.user.id
      console.log('User created/found in database for onboarding:', actualUserId)
    } catch (userError) {
      console.error('Error ensuring user exists for onboarding:', userError)
      throw new Error("Failed to create user in database. Please try again.")
    }
  } else {
    actualUserId = user.id
  }

  await db.insert(UserOnboardingTable)
    .values({
      userId: actualUserId,
      isCompleted: true,
      completedAt: new Date()
    })
    .onConflictDoUpdate({
      target: UserOnboardingTable.userId,
      set: {
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date()
      }
    })

  return { success: true }
}
