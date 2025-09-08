import { getCurrentOrganization } from '@/services/clerk/lib/getCurrentAuth'
import React, { Suspense } from 'react'
import { JobListingTable } from '../drizzle/schema'
import { desc, eq } from 'drizzle-orm'
import { db } from '../drizzle/db'
import { redirect } from 'next/navigation'

const EmployerHomePage = () => {

  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  )
}

export default EmployerHomePage

async function SuspendedPage() {
  const { orgId } = await getCurrentOrganization();
  if (orgId == null) {return null};
  const jobListing = await getMostRecentJobListing(orgId);
  if (jobListing == null) {redirect("/employer/job-listings/new")} else {redirect(`/employer/job-listings/${jobListing.id}`)}
  return (
    null
  )
}

async function getMostRecentJobListing(orgId: string) {
  return await db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.organizationId, orgId),
    orderBy: desc(JobListingTable.createdAt),
    columns: {
      id: true,
    },
  });
}