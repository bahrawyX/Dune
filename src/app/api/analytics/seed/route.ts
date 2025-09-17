import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth"
import { seedBasicAnalytics } from "@/lib/seedAnalytics"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getCurrentUser()
    const { orgId } = await getCurrentOrganization()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await seedBasicAnalytics(userId, orgId || undefined)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `Successfully seeded ${result.eventsCreated} analytics events` 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to seed analytics data" 
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Seed analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to seed analytics data" },
      { status: 500 }
    )
  }
}