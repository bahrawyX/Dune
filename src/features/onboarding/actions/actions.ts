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
  const { userId } = await getCurrentUser()
  
  if (!userId) {
    throw new Error("User not authenticated")
  }

  await db.insert(UserOnboardingTable)
    .values({
      userId,
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
