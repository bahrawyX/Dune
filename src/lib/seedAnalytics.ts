import { db } from "@/app/drizzle/db"
import { AnalyticsEventTable, UserMetricsTable, OrganizationMetricsTable } from "@/app/drizzle/schema/analytics"
import { eq } from "drizzle-orm"
import { subDays, startOfDay } from "date-fns"

export async function seedBasicAnalytics(userId: string, organizationId?: string) {
  try {
    // Generate some basic analytics events for the last 30 days
    const events = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i)
      
      // Job searches - 1-5 per day
      const searchCount = Math.floor(Math.random() * 5) + 1
      for (let j = 0; j < searchCount; j++) {
        events.push({
          eventType: 'job_search' as const,
          userId,
          organizationId,
          pathname: '/job-listings',
          searchQuery: `search_${i}_${j}`,
          createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        })
      }
      
      // Job views - 2-8 per day
      const viewCount = Math.floor(Math.random() * 7) + 2
      for (let j = 0; j < viewCount; j++) {
        events.push({
          eventType: 'job_view' as const,
          userId,
          organizationId,
          jobListingId: `job_${Math.floor(Math.random() * 10) + 1}`,
          pathname: '/job-listings/detail',
          createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        })
      }
      
      // Applications - 0-2 per day
      const applicationCount = Math.floor(Math.random() * 3)
      for (let j = 0; j < applicationCount; j++) {
        events.push({
          eventType: 'job_apply' as const,
          userId,
          organizationId,
          jobListingId: `job_${Math.floor(Math.random() * 10) + 1}`,
          pathname: '/job-listings/apply',
          createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        })
      }
      
      // Page views
      const pageViewCount = Math.floor(Math.random() * 10) + 5
      for (let j = 0; j < pageViewCount; j++) {
        events.push({
          eventType: 'page_view' as const,
          userId,
          organizationId,
          pathname: ['/dashboard', '/profile', '/settings', '/job-listings'][Math.floor(Math.random() * 4)],
          createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        })
      }
    }
    
    // Insert events in batches
    const batchSize = 100
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize)
      await db.insert(AnalyticsEventTable).values(batch)
    }
    
    // Create/update user metrics
    const totalSearches = events.filter(e => e.eventType === 'job_search').length
    const totalViews = events.filter(e => e.eventType === 'job_view').length
    const totalApplications = events.filter(e => e.eventType === 'job_apply').length
    
    // Check if user metrics exist
    const existingUserMetrics = await db.select()
      .from(UserMetricsTable)
      .where(eq(UserMetricsTable.userId, userId))
      .limit(1)
    
    if (existingUserMetrics.length > 0) {
      // Update existing metrics
      await db.update(UserMetricsTable)
        .set({
          totalJobViews: totalViews,
          totalApplications,
          totalSearches,
          lastActiveDate: new Date(),
          lastCalculated: new Date()
        })
        .where(eq(UserMetricsTable.userId, userId))
    } else {
      // Insert new metrics
      await db.insert(UserMetricsTable).values({
        userId,
        totalLogins: Math.floor(Math.random() * 20) + 10,
        totalJobViews: totalViews,
        totalApplications,
        totalBookmarks: Math.floor(Math.random() * 15) + 5,
        totalSearches,
        profileCompleteness: Math.floor(Math.random() * 30) + 70, // 70-100%
        lastActiveDate: new Date()
      })
    }
    
    // Create/update organization metrics if applicable
    if (organizationId) {
      const existingOrgMetrics = await db.select()
        .from(OrganizationMetricsTable)
        .where(eq(OrganizationMetricsTable.organizationId, organizationId))
        .limit(1)
      
      if (existingOrgMetrics.length > 0) {
        // Update existing metrics
        await db.update(OrganizationMetricsTable)
          .set({
            totalApplicationsReceived: Math.floor(Math.random() * 50) + 20,
            totalProfileViews: Math.floor(Math.random() * 200) + 100,
            lastCalculated: new Date()
          })
          .where(eq(OrganizationMetricsTable.organizationId, organizationId))
      } else {
        // Insert new metrics
        await db.insert(OrganizationMetricsTable).values({
          organizationId,
          totalJobPostings: Math.floor(Math.random() * 10) + 5,
          activeJobPostings: Math.floor(Math.random() * 5) + 3,
          totalApplicationsReceived: Math.floor(Math.random() * 50) + 20,
          totalHires: Math.floor(Math.random() * 5) + 1,
          averageTimeToHire: Math.floor(Math.random() * 20) + 10, // 10-30 days
          totalProfileViews: Math.floor(Math.random() * 200) + 100,
          responseRate: Math.floor(Math.random() * 30) + 70 // 70-100%
        })
      }
    }
    
    console.log(`Seeded ${events.length} analytics events for user ${userId}`)
    return { success: true, eventsCreated: events.length }
    
  } catch (error) {
    console.error("Failed to seed analytics:", error)
    return { success: false, error }
  }
}