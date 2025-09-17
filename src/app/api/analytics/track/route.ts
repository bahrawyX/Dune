import { NextRequest, NextResponse } from "next/server"
import { trackEvent, type EventType } from "@/lib/analytics"
import { z } from "zod"
import { rateLimit, rateLimitConfigs } from "@/lib/rateLimiting"

const trackEventSchema = z.object({
  eventType: z.enum([
    "page_view",
    "job_search",
    "job_view",
    "job_apply", 
    "job_bookmark",
    "profile_update",
    "resume_upload",
    "login",
    "logout",
    "signup",
    "job_post",
    "job_edit",
    "application_review",
    "application_status_change",
    "email_open",
    "email_click"
  ]),
  pathname: z.string().optional(),
  searchQuery: z.string().optional(),
  jobListingId: z.string().optional(),
  sessionId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

const analyticsRateLimit = rateLimit(rateLimitConfigs.api);

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await analyticsRateLimit(request);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
        }
      }
    );
  }

  try {
    const body = await request.json()
    const result = trackEventSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid event data", details: result.error.issues },
        { status: 400 }
      )
    }

    const { eventType, pathname, searchQuery, jobListingId, sessionId, metadata = {} } = result.data

    // Add session ID to metadata if provided
    if (sessionId) {
      metadata.sessionId = sessionId
    }

    await trackEvent({
      eventType: eventType as EventType,
      pathname,
      searchQuery,
      jobListingId,
      metadata,
      skipAuth: false // Will attempt to get user context
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    )
  }
}