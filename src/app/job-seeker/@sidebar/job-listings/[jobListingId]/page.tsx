import React, { Suspense } from 'react'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  BookmarkIcon, 
  BrainIcon, 
  ClipboardPenIcon, 
  FileTextIcon, 
  TrendingUpIcon, 
  AlertCircleIcon,
  CheckCircle2Icon,
  SparklesIcon,
  Share2Icon,
  BarChart3Icon
} from 'lucide-react'
import Link from 'next/link'
import { db } from '@/app/drizzle/db'
import { and, eq } from 'drizzle-orm'
import { JobListingTable } from '@/app/drizzle/schema'
import { formatDistanceToNow } from 'date-fns'
import { BookmarkButton } from '@/features/jobBookmarks/components/BookmarkButton'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import { isJobBookmarked } from '@/features/jobBookmarks/actions/actions'
import { Skeleton } from '@/components/ui/skeleton'

const JobListingPage = ({
    params,
    searchParams: _searchParams,
}:{
    params:Promise<{jobListingId:string}>
    searchParams:Promise<Record<string,string | string[]>>
}) => {
  return (
    <Suspense fallback={<JobListingSidebarSkeleton />}>
      <JobListingSidebarContent params={params} />
    </Suspense>
  )
}

export default JobListingPage

async function JobListingSidebarContent({ params }: { params: Promise<{ jobListingId: string }> }) {
  const { jobListingId } = await params
  const jobListing = await getJobListing(jobListingId)
  
  if (!jobListing) {
    return null
  }

  const { userId } = await getCurrentUser()
  const isBookmarked = userId ? await isJobBookmarked(userId, jobListingId) : false

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
      <SidebarGroupContent className="group-data-[state=collapsed]:hidden space-y-4">
        {/* Quick Actions */}
        <div className="space-y-2">
          {userId && (
            <div className="flex items-center gap-2">
              <BookmarkButton 
                jobListingId={jobListingId} 
                initialBookmarked={isBookmarked}
              />
              <Button variant="outline" size="sm" className="px-3">
                <Share2Icon className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link href="/job-seeker" className="flex items-center gap-2">
              <ClipboardPenIcon className="w-4 h-4" />
              Back to Job Board
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link href="/job-seeker/ai-search" className="flex items-center gap-2">
              <BrainIcon className="w-4 h-4" />
              Find Similar Jobs
            </Link>
          </Button>

          {userId && (
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/job-seeker/user-settings/resume" className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4" />
                Update Resume
              </Link>
            </Button>
          )}
        </div>

        <Separator />

        {/* Job Insights */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-sidebar-foreground">
            Job Insights
          </h3>
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4 text-primary" />
                Opportunity Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobListing.isFeatured && (
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-featured" />
                  <span className="text-xs">Featured Position</span>
                  <Badge variant="secondary" className="ml-auto bg-featured/10 text-featured">
                    Hot
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs">Posted {formatDistanceToNow(new Date(jobListing.postedAt || jobListing.createdAt), { addSuffix: true })}</span>
              </div>

              {jobListing.wage && (
                <div className="flex items-center gap-2">
                  <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                  <span className="text-xs">Salary disclosed</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Application Tips */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-sidebar-foreground">
            Application Tips
          </h3>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Tailor your resume to match the required skills</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Research the company culture and values</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Prepare examples of relevant experience</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <span>Follow up within 1-2 weeks if no response</span>
                </div>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Separator />

        {/* Additional Resources */}
        {userId && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-sidebar-foreground">
              Resources
            </h3>
            <div className="space-y-2">
              <Button asChild variant="ghost" size="sm" className="w-full justify-start h-auto py-2">
                <Link href="/job-seeker/analytics" className="flex items-start gap-2">
                  <BarChart3Icon className="w-4 h-4 mt-0.5" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-medium">View Your Analytics</span>
                    <span className="text-[10px] text-muted-foreground">Track your job search progress</span>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="ghost" size="sm" className="w-full justify-start h-auto py-2">
                <Link href="/job-seeker/bookmarks" className="flex items-start gap-2">
                  <BookmarkIcon className="w-4 h-4 mt-0.5" />
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-medium">Saved Jobs</span>
                    <span className="text-[10px] text-muted-foreground">Review your bookmarked positions</span>
                  </div>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function JobListingSidebarSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
      <SidebarGroupContent className="group-data-[state=collapsed]:hidden space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <Separator />
        <div>
          <Skeleton className="h-4 w-24 mb-3" />
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

async function getJobListing(id: string) {
  const listing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published")
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
  })

  return listing
}