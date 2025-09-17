"use client"

import { useEffect, useState } from "react"
import { useUser, useOrganization } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AnalyticsLineChart, 
  AnalyticsBarChart, 
  AnalyticsPieChart, 
  MetricCard 
} from "@/components/analytics/AnalyticsCharts"
import { 
  Users, 
  Eye, 
  Send, 
  TrendingUp, 
  Target,
  Clock,
  CheckCircle,
  Building,
  FileText
} from "lucide-react"
import { useAnalytics } from "@/lib/analytics"

interface OrganizationAnalyticsData {
  summary: {
    totalJobListings: number
    totalViews: number
    totalApplicationsReceived: number
    avgViewsPerListing: number
    avgApplicationsPerListing: number
    topPerformingJob: string | null
  }
  jobPerformance: Array<{
    jobListingId: string
    title: string
    views: number
    applications: number
    conversionRate: number
  }>
  dailyApplications: Array<{
    date: string
    applications: number
    views: number
    listings: number
  }>
  applicationSources: Array<{
    source: string
    count: number
  }>
}

export default function EmployerAnalyticsDashboard() {
  const { user } = useUser()
  const { organization } = useOrganization()
  // const { trackEvent } = useAnalytics() // Commented out to fix build
  const [data, setData] = useState<OrganizationAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")



  useEffect(() => {
    async function fetchAnalytics() {
      if (!user) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/analytics/data?type=organization&range=${timeRange.replace('d', '')}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setData(result.data)
          } else {
            // Set default data structure if API fails
            setData({
              summary: {
                totalJobListings: 0,
                totalViews: 0,
                totalApplicationsReceived: 0,
                avgViewsPerListing: 0,
                avgApplicationsPerListing: 0,
                topPerformingJob: null
              },
              jobPerformance: [],
              dailyApplications: [],
              applicationSources: []
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
        // Set default data structure on error
        setData({
          summary: {
            totalJobListings: 0,
            totalViews: 0,
            totalApplicationsReceived: 0,
            avgViewsPerListing: 0,
            avgApplicationsPerListing: 0,
            topPerformingJob: null
          },
          jobPerformance: [],
          dailyApplications: [],
          applicationSources: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user, organization, timeRange])

  if (loading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto p-6 space-grotesk">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded-md w-48 animate-pulse"></div>
            <div className="h-4 bg-muted rounded-md w-32 animate-pulse"></div>
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

  if (!data) {
    return (
        <div className="max-w-4xl mx-auto mt-3">
            <Card>
                <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">No analytics data available.</p>
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

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }


  // Safe access to data properties with fallback
  const dailyApplications = data?.dailyApplications || []
  const jobPerformance = data?.jobPerformance || []
  const applicationSources = data?.applicationSources || []
  const summary = data?.summary || {
    totalJobListings: 0,
    totalViews: 0,
    totalApplicationsReceived: 0,
    avgViewsPerListing: 0,
    avgApplicationsPerListing: 0,
    topPerformingJob: null
  }
  
  const recentApplications = dailyApplications.slice(-7).reduce((acc, day) => acc + (day.applications || 0), 0)
  const previousApplications = dailyApplications.slice(-14, -7).reduce((acc, day) => acc + (day.applications || 0), 0)

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-6 space-grotesk">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Employer Analytics</h1>
          <p className="text-sm text-muted-foreground font-medium">{organization?.name || "Your Organization"}</p>
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
          title="Active Job Listings"
          value={summary.totalJobListings}
          icon={<FileText className="w-5 h-5 text-blue-600" />}
          description="Currently published"
        />
        <MetricCard
          title="Total Views"
          value={summary.totalViews}
          icon={<Eye className="w-5 h-5 text-green-600" />}
          description="All job views"
        />
        <MetricCard
          title="Applications Received"
          value={summary.totalApplicationsReceived}
          icon={<Send className="w-5 h-5 text-purple-600" />}
          change={{
            value: calculateChange(recentApplications, previousApplications),
            period: "vs last week"
          }}
        />
        <MetricCard
          title="Avg. Views per Job"
          value={Math.round(summary.avgViewsPerListing)}
          icon={<Target className="w-5 h-5 text-orange-600" />}
          description="Performance metric"
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Job Performance</TabsTrigger>
          <TabsTrigger value="trends">Application Trends</TabsTrigger>
          <TabsTrigger value="sources">Traffic Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Jobs</CardTitle>
              <CardDescription>Your most successful job listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobPerformance.slice(0, 5).map((job, index) => (
                  <div key={job.jobListingId} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.views} views • {job.applications} applications
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{job.conversionRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">conversion rate</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsLineChart
              data={dailyApplications}
              title="Daily Applications"
              description="Applications received over time"
              xDataKey="date"
              yDataKey="applications"
              color="#008080"
            />
            <AnalyticsBarChart
              data={dailyApplications}
              title="Daily Views"
              description="Job views over time"
              xDataKey="date"
              yDataKey="views"
              color="#3b82f6"
            />
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsPieChart
              data={applicationSources}
              title="Application Sources"
              description="Where your applications come from"
              dataKey="count"
              nameKey="source"
            />
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>Key metrics and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Conversion Rate
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your average conversion rate is {(summary.avgApplicationsPerListing / Math.max(summary.avgViewsPerListing, 1) * 100).toFixed(1)}%.
                      {summary.avgApplicationsPerListing / Math.max(summary.avgViewsPerListing, 1) > 0.05 
                        ? " This is above average!" 
                        : " Consider improving job descriptions for better engagement."}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <Building className="w-5 h-5 text-blue-500" />
                      Top Performer
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {summary.topPerformingJob 
                        ? `"${summary.topPerformingJob}" is your best performing job listing.`
                        : "Publish more job listings to see performance insights."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Job Performance</CardTitle>
          <CardDescription>Complete breakdown of all your job listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Job Title</th>
                  <th className="text-right p-2">Views</th>
                  <th className="text-right p-2">Applications</th>
                  <th className="text-right p-2">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {jobPerformance.map((job) => (
                  <tr key={job.jobListingId} className="border-b">
                    <td className="p-2">
                      <div>
                        <p className="font-medium">{job.title}</p>
                        <p className="text-xs text-muted-foreground">ID: {job.jobListingId}</p>
                      </div>
                    </td>
                    <td className="text-right p-2">{job.views.toLocaleString()}</td>
                    <td className="text-right p-2">{job.applications}</td>
                    <td className="text-right p-2">
                      <span className={`font-medium ${
                        job.conversionRate > 5 ? 'text-green-600' : 
                        job.conversionRate > 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {job.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}