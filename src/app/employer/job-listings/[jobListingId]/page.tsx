import { db } from '@/app/drizzle/db'
import { JobListingApplicationTable, JobListingStatus, JobListingTable } from '@/app/drizzle/schema'
import { ActionButton } from '@/components/ActionButton'
import { MarkdownPartial } from '@/components/markdown/MarkdownPartial'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { Separator } from '@/components/ui/separator'
import { deleteJobListing, toggleJobListingFeatured, toggleJobListingStatus } from '@/features/jobListings/action/actions'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { formatJoblistingStatus } from '@/features/jobListings/lib/formatters'
import { hasReachedMaxFeaturedJobListings } from '@/features/jobListings/util/planFeaturesHelper'
import { getNextJobListingStatus } from '@/features/jobListings/util/utils'
import ApplicationsTable, { SkeletonApplicationsLoader } from '@/features/jobListingsApplication/components/ApplicationsTable'
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions'
import { and, eq, count } from 'drizzle-orm'
import { EditIcon, EyeIcon, EyeOffIcon, StarIcon, StarOffIcon, Trash2, FileText, Users, Calendar } from 'lucide-react'
// import { cacheTag } from 'next/dist/server/use-cache/cache-tag'
import Link from 'next/link'
import React, { ReactNode, Suspense } from 'react'
import { JobListingDetailSkeleton, JobListingSidebarSkeleton } from '@/components/skeletons/JobListingDetailSkeleton'
import { SidebarContent } from './_SidebarContent'
type Props ={
  params:Promise<{jobListingId:string}>
}

export default function JobListingPage (props:Props) {
  return (
      <Suspense fallback={
        <div className="flex gap-6">
          <div className="flex-1">
            <JobListingDetailSkeleton />
          </div>
          <div className="w-80 hidden xl:block">
            <JobListingSidebarSkeleton />
          </div>
        </div>
      }>
          <SuspendedPage {...props}/>
        </Suspense>
  )
}


async function SuspendedPage({params}: Props) {
  let orgId: string | null = null;
  let jobListing: typeof JobListingTable.$inferSelect | null | undefined = null;
  
  try {
    const orgResult = await getCurrentOrganization();
    orgId = orgResult.orgId ?? null;
    if(orgId ==  null) return <div>Organization not found. Please select an organization.</div>;
    
    const {jobListingId}= await params
    jobListing = await getJobListing(jobListingId, orgId)

    if(jobListing == null || jobListing == undefined) return <div>Job Listing not found</div>;
  } catch (error) {
    console.error('Error loading job listing page:', error);
    return <div>Error loading job listing. Please refresh the page.</div>;
  }

  // Pre-compute permissions and plan limits to avoid repeated async calls
  let canUpdate = false, canChangeStatus = false, canDelete = false, hasReachedMax = true;
  
  try {
    [canUpdate, canChangeStatus, canDelete, hasReachedMax] = await Promise.all([
      hasOrgUserPermission("job_listings:update").catch(() => false),
      hasOrgUserPermission("job_listings:change_status").catch(() => false), 
      hasOrgUserPermission("job_listings:delete").catch(() => false),
      hasReachedMaxFeaturedJobListings().catch(() => true)
    ]);
  } catch (error) {
    console.error('Error loading permissions and plan limits:', error);
    // Continue with default values (most restrictive)
  }

  return (
      <div className="flex gap-6 max-w-7xl mx-auto p-4">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Header Section */}
          <Card className="border-l-4 border-l-primary bg-gradient-to-r from-background to-muted/20">
            <CardContent className="p-6">
              <div className='flex justify-between items-start gap-4 @max-4xl:flex-col @max-4xl:gap-4 @max-4xl:items-start'>
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <FileText className="h-6 w-6 text-primary mt-2 flex-shrink-0" />
                    <h1 className='text-3xl font-bold tracking-tight leading-tight'>{jobListing.title}</h1>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-3'>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {formatJoblistingStatus(jobListing.status)}
                    </Badge>
                    <JobListingBadges jobListing={jobListing} />
                  </div>
                  
                  {/* Quick Info */}
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Posted {new Date(jobListing.postedAt || jobListing.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <Suspense fallback="...">
                        <ApplicationCount jobListingId={jobListing.id} />
                      </Suspense>
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-2 flex-wrap'>
                  {canUpdate && (
                    <Button asChild variant='outline' className="bg-background">
                      <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
                        <EditIcon className='size-4 mr-2' /> 
                        Edit
                      </Link>
                    </Button>
                  )}
                  <StatusUpdateButton 
                    status={jobListing.status} 
                    id={jobListing.id}
                    canChangeStatus={canChangeStatus}
                    hasReachedMax={hasReachedMax}
                  />
                  {jobListing.status === "published" && (
                    <FeaturedToggleButton 
                      isFeatured={jobListing.isFeatured} 
                      id={jobListing.id}
                      canChangeStatus={canChangeStatus}
                      hasReachedMax={hasReachedMax}
                    />
                  )}
                  {canDelete && (
                    <ActionButton 
                      className='cursor-pointer' 
                      variant='destructive' 
                      action={deleteJobListing.bind(null, jobListing.id)} 
                      requireAreYouSure={true} 
                      areYouSureDescription='You are about to delete the job listing'
                    >
                      <Trash2 className='size-4 mr-2' /> Delete
                    </ActionButton>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownPartial  
                dialogMarkdown={<MarkdownRenderer source={jobListing.description}/>}
                mainMarkdown ={<MarkdownRenderer className="prose prose-sm max-w-none" source={jobListing.description}/>}
                dialogTitle="Job Listing Description"
              />
            </CardContent>

          {/* Applications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SkeletonApplicationsLoader />}>
                <Applications jobListingId={jobListing.id} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="w-80 hidden xl:block">
          <Suspense fallback={<JobListingSidebarSkeleton />}>
            <SidebarContent jobListing={jobListing} />
          </Suspense>
        </div>
      </div>
  )

  
}

async function getJobListing(jobListingId: string, orgId: string) {
  return await db.query.JobListingTable.findFirst({
    where: and(eq(JobListingTable.id, jobListingId), eq(JobListingTable.organizationId, orgId))
  })
}

async function ApplicationCount({ jobListingId }: { jobListingId: string }) {
  const result = await db.select({ count: count() })
    .from(JobListingApplicationTable)
    .where(eq(JobListingApplicationTable.jobListingId, jobListingId))
  
  const applicationCount = result[0]?.count || 0
  return <span>{applicationCount} {applicationCount === 1 ? 'application' : 'applications'}</span>
}
function UpgradePopover({
  buttonText,
  popoverText,
}: {
  buttonText: ReactNode
  popoverText: ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{buttonText}</Button>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col gap-2">
        {popoverText}
        <Button asChild>
          <Link href="/employer/pricing">Upgrade Plan</Link>
        </Button>
      </PopoverContent>
    </Popover>
  )
}


function StatusUpdateButton({
  status, 
  id, 
  canChangeStatus, 
  hasReachedMax
}: {
  status: JobListingStatus, 
  id: string,
  canChangeStatus: boolean,
  hasReachedMax: boolean
}){
  const button = (
    <ActionButton 
      className='cursor-pointer' 
      variant={'outline'} 
      action={toggleJobListingStatus.bind(null, id)} 
      requireAreYouSure={getNextJobListingStatus(status) === "published"} 
      areYouSureDescription='You are about to change the status of the job listing'
    >
      {statusToggleButtonText(status)}
    </ActionButton>
  )

  if (!canChangeStatus) return null

  if (getNextJobListingStatus(status) === "published" && hasReachedMax) {
    return (
      <UpgradePopover
        buttonText={statusToggleButtonText(status)}
        popoverText={<div>You have reached the maximum number of featured job listings. Check Our Other Plans So you can post more.</div>} 
      />
    )
  }

  return button
}
function FeaturedToggleButton({
  isFeatured, 
  id, 
  canChangeStatus, 
  hasReachedMax
}: {
  isFeatured: boolean, 
  id: string,
  canChangeStatus: boolean,
  hasReachedMax: boolean
}){
  const button = (
    <ActionButton 
      className='cursor-pointer' 
      variant={'outline'} 
      action={toggleJobListingFeatured.bind(null, id)}  
      areYouSureDescription='You are about to change the featured status of the job listing'
    >
      {FeaturedToggleButtonText(isFeatured)}
    </ActionButton>
  )

  if (!canChangeStatus) return null

  // If already featured, show button to remove feature
  if (isFeatured) {
    return button   
  }

  // If trying to feature and reached max, show upgrade popover
  if (hasReachedMax) {
    return (
      <UpgradePopover
        buttonText={FeaturedToggleButtonText(isFeatured)}
        popoverText={<div>You have reached the maximum number of featured job listings. Check Our Other Plans.</div>} 
      />
    )
  }

  return button
}

function statusToggleButtonText(status: JobListingStatus) {
  switch (status) {
    case "delisted":
    case "draft":
      return (
        <span className="inline-flex items-center gap-2">
          <EyeIcon className="size-4" />
          Publish
        </span>
      )
    case "published":
      return (
        <span className="inline-flex items-center gap-2">
          <EyeOffIcon className="size-4" />
          Delist
        </span>
      )
    default:
      throw new Error(`Unknown status: ${status satisfies never}`)
  }
}

function FeaturedToggleButtonText(isFeatured: boolean) {
  if(isFeatured){
    return (
      <span className="inline-flex items-center gap-2">
        <StarOffIcon className="size-4" />
        Remove Feature
      </span>
    )
  } else {
    return (
      <span className="inline-flex items-center gap-2">
        <StarIcon className="size-4" />
        Feature
      </span>
    )
  }
}

async function Applications({jobListingId}: {jobListingId: string}) {
  const applications = await getJobListingApplications(jobListingId)


  return <ApplicationsTable applications={
    
    applications.map(app =>({
      ...app,
      user:{
        ...app.user,
        resume : app.user.resume? {
          ...app.user.resume,
          markdownSummary: app.user.resume.aiSummary ? (<MarkdownRenderer source={app.user.resume.aiSummary} />) : null
         }:  null
      },
      coverLetterMarkdown: app.coverLetter ? (<MarkdownRenderer source={app.coverLetter} />) : null
    }))
    }
  canUpdateStage={await hasOrgUserPermission("job_listing_applications:change_stage")}
  canUpdateRating={await hasOrgUserPermission("job_listing_applications:change_rating")}/>

}

async function getJobListingApplications(jobListingId: string) {
  const data = await db.query.JobListingApplicationTable.findMany({
    where: eq(JobListingApplicationTable.jobListingId, jobListingId),
    columns: {
      coverLetter: true,
      createdAt: true,
      stage: true,
      rating: true,
      jobListingId: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
        with: {
          resume: {
            columns: {
              resumeFileUrl: true,
              aiSummary: true,
            },
          },
        },
      },
    },
  })


  return data
}

