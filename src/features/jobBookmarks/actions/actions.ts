"use server"

import { db } from "@/app/drizzle/db"
import { JobBookmarkTable } from "@/app/drizzle/schema"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function toggleJobBookmark(jobListingId: string) {
  const { userId } = await getCurrentUser()
  
  if (!userId) {
    return { error: true, message: "You must be signed in to bookmark jobs" }
  }

  try {
    // Check if bookmark already exists
    const existingBookmark = await db.query.JobBookmarkTable.findFirst({
      where: and(
        eq(JobBookmarkTable.userId, userId),
        eq(JobBookmarkTable.jobListingId, jobListingId)
      ),
    })

    if (existingBookmark) {
      // Remove bookmark
      await db.delete(JobBookmarkTable).where(
        and(
          eq(JobBookmarkTable.userId, userId),
          eq(JobBookmarkTable.jobListingId, jobListingId)
        )
      )
      revalidatePath("/bookmarks")
      revalidatePath("/")
      return { error: false, message: "Job removed from bookmarks", bookmarked: false }
    } else {
      // Add bookmark
      await db.insert(JobBookmarkTable).values({
        userId,
        jobListingId,
        createdAt: new Date(),
      })
      revalidatePath("/bookmarks")
      revalidatePath("/")
      return { error: false, message: "Job bookmarked successfully", bookmarked: true }
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error)
    return { error: true, message: "Failed to update bookmark" }
  }
}

export async function getBookmarkedJobs(userId: string) {
  return await db.query.JobBookmarkTable.findMany({
    where: eq(JobBookmarkTable.userId, userId),
    with: {
      jobListing: {
        with: {
          organization: {
            columns: { name: true, imageUrl: true },
          },
        },
      },
    },
    orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
  })
}

export async function isJobBookmarked(userId: string, jobListingId: string): Promise<boolean> {
  const bookmark = await db.query.JobBookmarkTable.findFirst({
    where: and(
      eq(JobBookmarkTable.userId, userId),
      eq(JobBookmarkTable.jobListingId, jobListingId)
    ),
  })
  return !!bookmark
}
