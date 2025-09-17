import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
// import { Separator } from "@/components/ui/separator"
import { 
  Eye, 
  TrendingUp, 
  Clock, 
  Star, 
  FileText, 
  Share2, 
  Download,
  Target,
  Activity
} from "lucide-react"
import { JobListingTable, JobListingApplicationTable } from "@/app/drizzle/schema"
import { formatDistanceToNow } from "date-fns"
import { db } from "@/app/drizzle/db"
import { eq, count, and, gte, desc } from "drizzle-orm"
import { subDays } from "date-fns"

type RecentActivity = {
  text: string
  color: string
  timeAgo: string
  timestamp: Date
}

// interface SidebarContentProps {
//   jobListing: typeof JobListingTable.$inferSelect
//   applicationStats: {
//     total: number
//     thisWeek: number
//     thisMonth: number
//     byStage: Record<string, number>
//   }
// }

export async function SidebarContent({ jobListing }: { jobListing: typeof JobListingTable.$inferSelect }) {
  const stats = await getApplicationStats(jobListing.id)
  const recentActivities = await getRecentActivities(jobListing.id, jobListing)
  
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Applications</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-2xl font-bold text-featured">{stats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">This Month</span>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              +{stats.thisMonth}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Posted</span>
            <span className="font-medium">
              {formatDistanceToNow(new Date(jobListing.postedAt || jobListing.createdAt), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Application Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Application Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(stats.byStage).map(([stage, count]) => (
            <div key={stage} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${getStageColor(stage)}`} />
                <span className="text-sm capitalize">{stage.replace('_', ' ')}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {count}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 " />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <Badge variant="outline">{jobListing.type}</Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Experience</span>
            <Badge variant="outline">{jobListing.experienceLevel}</Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <Badge variant="outline">{jobListing.locationRequirement}</Badge>
          </div>
          
          {jobListing.wage && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Salary</span>
              <Badge variant="outline" className="text-featured">
                ${jobListing.wage.toLocaleString()}/{jobListing.wageInterval}
              </Badge>
            </div>
          )}
          
          {jobListing.isFeatured && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Featured</span>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity: RecentActivity, index: number) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <div className={`h-2 w-2 rounded-full ${activity.color}`} />
                  {activity.text}
                  <span className="text-xs ml-auto">{activity.timeAgo}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Activity will appear here as applications are received</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function getApplicationStats(jobListingId: string) {
  const now = new Date()
  const oneWeekAgo = subDays(now, 7)
  const oneMonthAgo = subDays(now, 30)

  const [totalCount, weekCount, monthCount, stageStats] = await Promise.all([
    // Total applications
    db.select({ count: count() })
      .from(JobListingApplicationTable)
      .where(eq(JobListingApplicationTable.jobListingId, jobListingId)),
    
    // This week
    db.select({ count: count() })
      .from(JobListingApplicationTable)
      .where(
        and(
          eq(JobListingApplicationTable.jobListingId, jobListingId),
          gte(JobListingApplicationTable.createdAt, oneWeekAgo)
        )
      ),
    
    // This month
    db.select({ count: count() })
      .from(JobListingApplicationTable)
      .where(
        and(
          eq(JobListingApplicationTable.jobListingId, jobListingId),
          gte(JobListingApplicationTable.createdAt, oneMonthAgo)
        )
      ),
    
    // By stage
    db.select({
      stage: JobListingApplicationTable.stage,
      count: count()
    })
      .from(JobListingApplicationTable)
      .where(eq(JobListingApplicationTable.jobListingId, jobListingId))
      .groupBy(JobListingApplicationTable.stage)
  ])

  const byStage = stageStats.reduce((acc, { stage, count }) => {
    acc[stage] = count
    return acc
  }, {} as Record<string, number>)

  return {
    total: totalCount[0]?.count || 0,
    thisWeek: weekCount[0]?.count || 0,
    thisMonth: monthCount[0]?.count || 0,
    byStage
  }
}

function getStageColor(stage: string): string {
  switch (stage) {
    case 'applied':
      return 'bg-blue-500'
    case 'interested':
      return 'bg-yellow-500'
    case 'interviewed':
      return 'bg-purple-500'
    case 'hired':
      return 'bg-featured'
    case 'denied':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

async function getRecentActivities(jobListingId: string, jobListing: typeof JobListingTable.$inferSelect): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = []
  
  // Get recent applications (last 10)
  const recentApplications = await db.query.JobListingApplicationTable.findMany({
    where: eq(JobListingApplicationTable.jobListingId, jobListingId),
    orderBy: desc(JobListingApplicationTable.createdAt),
    limit: 10,
    columns: {
      createdAt: true,
      stage: true,
    },
    with: {
      user: {
        columns: {
          name: true,
        }
      }
    }
  })

  // Add application activities
  recentApplications.forEach(app => {
    activities.push({
      text: `New application Received`,
      color: 'bg-featured',
      timeAgo: formatDistanceToNow(new Date(app.createdAt), { addSuffix: true }),
      timestamp: new Date(app.createdAt)
    })
  })

  // Add job listing milestones
  if (jobListing.postedAt) {
    activities.push({
      text: 'Job listing published',
      color: 'bg-blue-500',
      timeAgo: formatDistanceToNow(new Date(jobListing.postedAt), { addSuffix: true }),
      timestamp: new Date(jobListing.postedAt)
    })
  }

  if (jobListing.isFeatured) {
    activities.push({
      text: 'Job listing featured',
      color: 'bg-yellow-500',
      timeAgo: formatDistanceToNow(new Date(jobListing.updatedAt), { addSuffix: true }),
      timestamp: new Date(jobListing.updatedAt)
    })
  }

  // Sort by timestamp (most recent first) and limit to 5
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5)
}
