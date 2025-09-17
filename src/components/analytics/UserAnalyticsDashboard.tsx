"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AnalyticsLineChart, 
  AnalyticsBarChart, 
  AnalyticsPieChart, 
  MetricCard 
} from "@/components/analytics/AnalyticsCharts"
import { 
  Search, 
  Eye, 
  Send, 
  Calendar, 
  TrendingUp, 
  Target,
  Clock,
  CheckCircle
} from "lucide-react"
import { useAnalytics } from "@/lib/analytics"

interface UserAnalyticsData {
  summary: {
    totalEvents: number
    totalJobSearches: number
    totalJobViews: number
    totalApplications: number
    avgTimeSpent: number
    lastActiveDate: string
  }
  recentEvents: Array<{
    eventType: string
    jobListingId: string | null
    metadata: any
    createdAt: string
  }>
  dailyActivity: Array<{
    date: string
    events: number
    searches: number
    views: number
    applications: number
  }>
  eventBreakdown: Array<{
    eventType: string
    count: number
  }>
}

export default function UserAnalyticsDashboard() {
  const { user } = useUser()
  // const { trackEvent } = useAnalytics() // Commented out to fix build
  const [data, setData] = useState<UserAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    // trackEvent({
    //   eventType: "page_view",
    //   pathname: "/analytics",
    //   metadata: {
    //     page: "analytics_dashboard",
    //     section: "user"
    //   }
    // })
  }, [])

  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/analytics/data?type=user&range=${timeRange.replace('d', '')}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setData(result.data)
          } else {
            // Set default data structure if API fails
            setData({
              summary: {
                totalEvents: 0,
                totalJobSearches: 0,
                totalJobViews: 0,
                totalApplications: 0,
                avgTimeSpent: 0,
                lastActiveDate: new Date().toISOString()
              },
              recentEvents: [],
              dailyActivity: [],
              eventBreakdown: []
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
        // Set default data structure on error
        setData({
          summary: {
            totalEvents: 0,
            totalJobSearches: 0,
            totalJobViews: 0,
            totalApplications: 0,
            avgTimeSpent: 0,
            lastActiveDate: new Date().toISOString()
          },
          recentEvents: [],
          dailyActivity: [],
          eventBreakdown: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user, timeRange])

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Please sign in to view your analytics.</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8  mx-auto p-6 space-grotesk">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded-md w-56 animate-pulse"></div>
            <div className="h-4 bg-muted rounded-md w-40 animate-pulse"></div>
          </div>
          <div className="h-10 bg-muted rounded-lg w-48 animate-pulse"></div>
        </div>
        
        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-muted/50">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <Card className="border-muted/50">
          <CardHeader>
            <div className="animate-pulse space-y-2">
              <div className="h-5 bg-muted rounded w-40"></div>
              <div className="h-4 bg-muted rounded w-60"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-80 bg-muted rounded-lg"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const seedAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics/seed', { method: 'POST' })
      if (response.ok) {
        // Refresh the analytics data after seeding
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to seed analytics:', error)
    }
  }

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  // Safe access to data properties with fallback to empty arrays
  const dailyActivity = data?.dailyActivity || []
  const eventBreakdown = data?.eventBreakdown || []
  const recentEvents = data?.recentEvents || []
  const summary = data?.summary || {
    totalEvents: 0,
    totalJobSearches: 0,
    totalApplications: 0,
    totalJobViews: 0,
    avgTimeSpent: 0,
    lastActiveDate: new Date().toISOString()
  }
  const recentActivity = dailyActivity.slice(-7).reduce((acc, day) => acc + (day.events || 0), 0)
  const previousActivity = dailyActivity.slice(-14, -7).reduce((acc, day) => acc + (day.events || 0), 0)

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6 space-grotesk">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Your Job Search Analytics</h1>
          <p className="text-sm text-muted-foreground font-medium">Track your progress and insights</p>
        </div>
        <div className="flex gap-3 items-center">
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={seedAnalyticsData}
              className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              Seed Data
            </button>
          )}
          <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7d" className="text-xs font-medium">7 Days</TabsTrigger>
              <TabsTrigger value="30d" className="text-xs font-medium">30 Days</TabsTrigger>
              <TabsTrigger value="90d" className="text-xs font-medium">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Searches"
          value={summary.totalJobSearches}
          icon={<Search className="w-5 h-5 text-blue-600" />}
          change={{
            value: calculateChange(recentActivity, previousActivity),
            period: "vs last week"
          }}
        />
        <MetricCard
          title="Jobs Viewed"
          value={summary.totalJobViews}
          icon={<Eye className="w-5 h-5 text-green-600" />}
          description="Detailed job views"
        />
        <MetricCard
          title="Applications Sent"
          value={summary.totalApplications}
          icon={<Send className="w-5 h-5 text-purple-600" />}
          description="Total applications"
        />
        <MetricCard
          title="Time Spent"
          value={formatTimeSpent(summary.avgTimeSpent)}
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          description="Average session time"
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Daily Activity</TabsTrigger>
          <TabsTrigger value="breakdown">Event Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Search Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsLineChart
              data={dailyActivity}
              title="Daily Job Search Activity"
              description="Your activity over time"
              xDataKey="date"
              yDataKey="events"
              color="#008080"
            />
            <AnalyticsBarChart
              data={dailyActivity}
              title="Daily Applications"
              description="Applications sent per day"
              xDataKey="date"
              yDataKey="applications"
              color="#10b981"
            />
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsPieChart
              data={eventBreakdown}
              title="Activity Breakdown"
              description="How you spend your time"
              dataKey="count"
              nameKey="eventType"
            />
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest actions on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="p-2 rounded-full bg-primary/10">
                        {event.eventType === 'job_search' && <Search className="w-3 h-3" />}
                        {event.eventType === 'job_view' && <Eye className="w-3 h-3" />}
                        {event.eventType === 'job_application' && <Send className="w-3 h-3" />}
                        {event.eventType === 'page_view' && <Calendar className="w-3 h-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {event.eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsLineChart
              data={dailyActivity}
              title="Search Trends"
              description="Job searches over time"
              xDataKey="date"
              yDataKey="searches"
              color="#3b82f6"
            />
            <AnalyticsLineChart
              data={dailyActivity}
              title="View Trends"
              description="Job views over time"
              xDataKey="date"
              yDataKey="views"
              color="#f59e0b"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-500" />
                Job Search Efficiency
              </h4>
              <p className="text-sm text-muted-foreground">
                You're averaging {Math.round(summary.totalJobViews / Math.max(summary.totalJobSearches, 1))} 
                job views per search. Consider refining your search criteria for better targeted results.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Application Rate
              </h4>
              <p className="text-sm text-muted-foreground">
                You're applying to {Math.round((summary.totalApplications / Math.max(summary.totalJobViews, 1)) * 100)}% 
                of jobs you view. This shows good selectivity in your application process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}