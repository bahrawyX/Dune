import { db } from '@/app/drizzle/db'
import { JobListingStatus, JobListingTable } from '@/app/drizzle/schema'
import { ActionButton } from '@/components/ActionButton'
import { MarkdownPartial } from '@/components/markdown/MarkdownPartial'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { deleteJobListing, toggleJobListingFeatured, toggleJobListingStatus } from '@/features/jobListings/action/actions'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { formatJoblistingStatus } from '@/features/jobListings/lib/formatters'
import { hasReachedMaxFeaturedJobListings } from '@/features/jobListings/util/planFeaturesHelper'
import { getNextJobListingStatus } from '@/features/jobListings/util/utils'
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions'
import { and, eq } from 'drizzle-orm'
import { EditIcon, EyeIcon, EyeOffIcon, StarIcon, StarOffIcon, Trash2 } from 'lucide-react'
import Link from 'next/link'
import React, { ReactNode, Suspense } from 'react'
type Props ={
  params:Promise<{jobListingId:string}>
}

export default function JobListingPage (props:Props) {
  return (
      <Suspense>
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
      <div className='space-y-6 max-w-6xl max-auto p-4 @container'>
        <div className='flex justify-between items-start gap-4 @max-4xl:flex-col @max-4xl:gap-2 @max-4xl:items-start'>


          <div>
            <h1 className='text-2xl font-bold space-grotesk tracking-tight'>{jobListing.title}</h1>
            <div className='flex flex-wrap gap-2 mt-2'>
              <Badge >{formatJoblistingStatus(jobListing.status)}</Badge>
              <JobListingBadges jobListing={jobListing} />

            </div>
          </div>


          <div className='flex items-center gap-2 empty:-mt-4 space-grotesk'>
            {canUpdate && (
              <Button asChild variant='outline'>
                <Link href={`/employer/job-listings/${jobListing.id}/edit`}><EditIcon className='size-4' /> Edit</Link>
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
              <ActionButton className='cursor-pointer' variant='destructive' action={deleteJobListing.bind(null, jobListing.id)} requireAreYouSure={true} areYouSureDescription='You are about to delete the job listing'>
                <Trash2 className='size-4' /> Delete
              </ActionButton>
            )}
          </div>


        </div>
        <MarkdownPartial  
        dialogMarkdown={<MarkdownRenderer source={jobListing.description}/>}
        mainMarkdown ={<MarkdownRenderer className="prose-sm" source={jobListing.description}/>}
        dialogTitle="Job Listing Description"
        />

      
      </div>
  )

  
}

async function getJobListing(jobListingId: string, orgId: string) {
  return await db.query.JobListingTable.findFirst({
    where: and(eq(JobListingTable.id, jobListingId), eq(JobListingTable.organizationId, orgId))
  })
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
