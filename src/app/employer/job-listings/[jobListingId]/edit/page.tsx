import { db } from '@/app/drizzle/db'
import { JobListingTable } from '@/app/drizzle/schema'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import JobListingForm from '@/features/jobListings/components/JobListingForm'
import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'

type Props ={
  params:Promise<{jobListingId:string}>
}

const EditJobListingPage = (props :Props) => {
  return (
    <div className='max-w-5xl mx-auto p-4'>
      <h1 className='text-2xl font-bold my-2'>Edit Job Listing</h1>
      <p className='text-sm text-muted-foreground space-grotesk my-3'>Edit a job listing for your organization .</p>
      <Card>
        <CardContent>
          <Suspense>
            <SuspendedPage {...props}/>
          </Suspense>
        </CardContent>
      </Card>        
    </div>
  )
}

export default EditJobListingPage

async function SuspendedPage(props :Props) {
  const {jobListingId} = await props.params
  const {orgId} = await getCurrentOrganization();
  if (orgId == null) {
      return notFound();
    }

      const jobListing = await getJobListing(jobListingId,orgId)
      if (jobListing == null) {
        return notFound();
      }
  return <JobListingForm jobListing={jobListing} />
}

async function getJobListing(jobListingId: string, orgId: string) {
  return await db.query.JobListingTable.findFirst({
    where: and(eq(JobListingTable.id, jobListingId), eq(JobListingTable.organizationId, orgId))
  })
}
