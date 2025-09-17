import { db } from "@/app/drizzle/db"
import { AnalyticsEventTable, DailyMetricsTable } from "@/app/drizzle/schema/analytics"
import { headers } from "next/headers"
import { getCurrentUser, getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth"
import { sql } from "drizzle-orm"

export type EventType = 
  | "page_view"
  | "job_search"
  | "job_view"
  | "job_apply"
  | "job_bookmark"
  | "profile_update"
  | "resume_upload"
  | "login"
  | "logout"
  | "signup"
  | "job_post"
  | "job_edit"
  | "application_review"
  | "application_status_change"
  | "email_open"
  | "email_click"

export interface TrackEventParams {
  eventType: EventType
  userId?: string
  organizationId?: string
  jobListingId?: string
  pathname?: string
  searchQuery?: string
  metadata?: Record<string, unknown>
  skipAuth?: boolean // For tracking events without user context
}

export interface ClientEventData {
  eventType: EventType
  pathname?: string
  searchQuery?: string
  jobListingId?: string
  metadata?: Record<string, unknown>
}

/**
 * Server-side analytics tracking function
 * Automatically captures user/org context and request metadata
 */
export async function trackEvent({
  eventType,
  userId: providedUserId,
  organizationId: providedOrgId,
  jobListingId,
  pathname,
  searchQuery,
  metadata = {},
  skipAuth = false
}: TrackEventParams) {
  try {
    let userId = providedUserId
    let organizationId = providedOrgId

    // Get user/org context if not provided and not skipped
    if (!skipAuth && (!userId || !organizationId)) {
      try {
        if (!userId) {
          const { userId: currentUserId } = await getCurrentUser()
          userId = currentUserId || undefined
        }
        if (!organizationId) {
          const { orgId } = await getCurrentOrganization()
          organizationId = orgId || undefined
        }
      } catch (error) {
        // Continue without auth context for anonymous events
        console.log('Analytics: Could not get auth context, proceeding without user data')
      }
    }

    // Get request metadata
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || undefined
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     headersList.get('cf-connecting-ip') || undefined
    const referrer = headersList.get('referer') || undefined

    // Generate session ID if not in metadata
    const sessionId = (metadata.sessionId as string) || generateSessionId()

    await db.insert(AnalyticsEventTable).values({
      eventType,
      userId: userId || null,
      organizationId: organizationId || null,
      jobListingId: jobListingId || null,
      sessionId,
      ipAddress,
      userAgent,
      referrer,
      pathname,
      searchQuery,
      metadata: JSON.parse(JSON.stringify({
        ...metadata,
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }))
    })

    // Update daily metrics asynchronously
    updateDailyMetrics(eventType, userId, organizationId, jobListingId).catch(
      error => console.error('Failed to update daily metrics:', error)
    )

  } catch (error) {
    console.error('Analytics tracking error:', error)
    // Don't throw to avoid breaking user experience
  }
}

/**
 * Client-side analytics tracking function
 * Sends events to API endpoint
 */
export async function trackClientEvent(data: ClientEventData) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        pathname: data.pathname || window.location.pathname,
        sessionId: getClientSessionId(),
        metadata: {
          ...data.metadata,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          screen: {
            width: window.screen.width,
            height: window.screen.height
          },
          timestamp: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      })
    })
  } catch (error) {
    console.error('Client analytics tracking error:', error)
  }
}

/**
 * Track page view - commonly used
 */
export async function trackPageView(pathname?: string, metadata?: Record<string, unknown>) {
  return trackEvent({
    eventType: 'page_view',
    pathname: pathname || (typeof window !== 'undefined' ? window.location.pathname : undefined),
    metadata
  })
}

/**
 * Track job search with query
 */
export async function trackJobSearch(searchQuery: string, metadata?: Record<string, unknown>) {
  return trackEvent({
    eventType: 'job_search',
    searchQuery,
    metadata
  })
}

/**
 * Track job view
 */
export async function trackJobView(jobListingId: string, metadata?: Record<string, unknown>) {
  return trackEvent({
    eventType: 'job_view',
    jobListingId,
    metadata
  })
}

/**
 * Track job application
 */
export async function trackJobApplication(jobListingId: string, metadata?: Record<string, unknown>) {
  return trackEvent({
    eventType: 'job_apply',
    jobListingId,
    metadata
  })
}

/**
 * Update daily aggregated metrics
 */
async function updateDailyMetrics(
  eventType: EventType, 
  userId?: string, 
  organizationId?: string, 
  jobListingId?: string
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Global metrics
  await upsertDailyMetric(today, `total_${eventType}`, 'global', null)

  // User-specific metrics
  if (userId) {
    await upsertDailyMetric(today, `total_${eventType}`, 'user', userId)
  }

  // Organization-specific metrics
  if (organizationId) {
    await upsertDailyMetric(today, `total_${eventType}`, 'organization', organizationId)
  }

  // Job listing-specific metrics
  if (jobListingId) {
    await upsertDailyMetric(today, `total_${eventType}`, 'job_listing', jobListingId)
  }
}

/**
 * Upsert daily metric value
 */
async function upsertDailyMetric(
  date: Date, 
  metricType: string, 
  entityType: string, 
  entityId: string | null
) {
  try {
    await db.insert(DailyMetricsTable).values({
      date,
      metricType,
      entityType,
      entityId,
      value: 1
    }).onConflictDoUpdate({
      target: [
        DailyMetricsTable.date,
        DailyMetricsTable.metricType,
        DailyMetricsTable.entityType,
        DailyMetricsTable.entityId
      ],
      set: {
        value: sql`${DailyMetricsTable.value} + 1`
      }
    })
  } catch (error) {
    console.error('Failed to update daily metric:', error)
  }
}

/**
 * Generate session ID for tracking
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`
}

/**
 * Get or create client-side session ID
 */
function getClientSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId()
  
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

/**
 * React hook for tracking events
 */
export function useAnalytics() {
  const trackEvent = (data: ClientEventData) => {
    trackClientEvent(data)
  }

  const trackPageView = (pathname?: string, metadata?: Record<string, unknown>) => {
    trackClientEvent({
      eventType: 'page_view',
      pathname,
      metadata
    })
  }

  const trackJobSearch = (searchQuery: string, metadata?: Record<string, unknown>) => {
    trackClientEvent({
      eventType: 'job_search',
      searchQuery,
      metadata
    })
  }

  const trackJobView = (jobListingId: string, metadata?: Record<string, unknown>) => {
    trackClientEvent({
      eventType: 'job_view',
      jobListingId,
      metadata
    })
  }

  const trackJobBookmark = (jobListingId: string, metadata?: Record<string, unknown>) => {
    trackClientEvent({
      eventType: 'job_bookmark',
      jobListingId,
      metadata
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackJobSearch,
    trackJobView,
    trackJobBookmark
  }
}