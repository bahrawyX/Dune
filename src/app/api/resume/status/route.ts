import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/drizzle/db"
import { UserResumeTable } from "@/app/drizzle/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedUserId = searchParams.get('userId')
    
    // Get current user to verify permissions
    const { userId: currentUserId } = await getCurrentUser()
    
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Only allow users to check their own resume status
    if (requestedUserId !== currentUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    
    // Get user resume with AI summary
    const userResume = await db.query.UserResumeTable.findFirst({
      where: eq(UserResumeTable.userId, currentUserId),
      columns: {
        aiSummary: true,
        updatedAt: true,
      },
    })
    
    if (!userResume) {
      return NextResponse.json({ aiSummary: null, updatedAt: null })
    }
    
    return NextResponse.json({
      aiSummary: userResume.aiSummary,
      updatedAt: userResume.updatedAt,
    })
    
  } catch (error) {
    console.error("Error checking resume status:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}