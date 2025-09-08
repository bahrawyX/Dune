import { db } from '@/app/drizzle/db'
import { JobListingStatus, JobListingTable } from '@/app/drizzle/schema'
import AyncIf from '@/components/AyncIf'
import { MarkdownPartial } from '@/components/markdown/MarkdownPartial'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { formatJoblistingStatus } from '@/features/jobListings/lib/formatters'
import { hasReachedMaxFeaturedJobListings } from '@/features/jobListings/util/planFeaturesHelper'
import { getNextJobListingStatus } from '@/features/jobListings/util/utils'
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { hasOrgUserPermission } from '@/services/clerk/lib/orgUserPermissions'
import { hasPlanFeature } from '@/services/clerk/lib/planFeatures'
import { and, eq } from 'drizzle-orm'
import { EditIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import React, { Suspense } from 'react'
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
  const {orgId} = await getCurrentOrganization();
  if(orgId ==  null) return null;
  const {jobListingId}= await params
  const jobListing = await getJobListing(jobListingId,orgId)
  console.log(jobListing)

  if(jobListing == null) return <div>Job Listing not found</div>;

  return (
      <div className='space-y-6 max-w-6xl max-auto p-4 @container'>
        <div className='flex justify-between items-center gap-4 @max-4xl:flex-col @max-4xl:gap-2 @max-4xl:items-start'>


          <div>
            <h1 className='text-2xl font-bold space-grotesk tracking-tight'>{jobListing.title}</h1>
            <div className='flex flex-wrap gap-2 mt-2'>
              <Badge >{formatJoblistingStatus(jobListing.status)}</Badge>
              <JobListingBadges jobListing={jobListing} />

            </div>
          </div>


          <div className='flex items-center gap-2 empty:-mt-4 space-grotesk'>
            <AyncIf condition={() => hasOrgUserPermission("job_listings:update")} loadingFallback={<Loader2 className='size-4 animate-spin' />} otherwise={null}>
              <Button asChild variant='outline'>
                <Link href={`/employer/job-listings/${jobListing.id}/edit`}><EditIcon className='size-4' /> Edit</Link>
              </Button>
            </AyncIf>
            {statusUpdateButton({status:jobListing.status})}
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

function statusUpdateButton({status}:{status:JobListingStatus}){
  const button =     <Button  variant='secondary'> Toggle </Button>
  return (

    <AyncIf condition={() => hasOrgUserPermission("job_listings:change_status")} loadingFallback={<Loader2 className='size-4 animate-spin' />} otherwise={null}>
      {getNextJobListingStatus(status) === "published" ? (


        <AyncIf condition={async () =>{
          const isMaxed =  await hasReachedMaxFeaturedJobListings()
          return !isMaxed
        }} loadingFallback={<Loader2 className='size-4 animate-spin' />} otherwise={null}>
        {button}   
      </AyncIf>
      ) : (
        button
      )}
    </AyncIf>
  )
}