import { db } from '@/app/drizzle/db'
import { JobListingTable } from '@/app/drizzle/schema'
import { MarkdownPartial } from '@/components/markdown/MarkdownPartial'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { formatJoblistingStatus } from '@/features/jobListings/lib/formatters'
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { and, eq } from 'drizzle-orm'
import { EditIcon } from 'lucide-react'
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
            <Button asChild variant='outline'>
              <Link href={`/employer/job-listings/${jobListing.id}/edit`}><EditIcon className='size-4' /> Edit</Link>
            </Button>
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
