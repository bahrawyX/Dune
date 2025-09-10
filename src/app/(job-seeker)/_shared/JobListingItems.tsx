import { db } from '@/app/drizzle/db'
import { experienceLevels, JobListingTable, jobListingTypes, locationRequirements, OrganizationTable } from '@/app/drizzle/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { convertSearchparamToString } from '@/lib/convertSearchparamsToString'
import { cn } from '@/lib/utils'
import { and, desc, eq, ilike, or, SQL, sql } from 'drizzle-orm'
import { differenceInDays } from "date-fns";
import Link from 'next/link'
import { connection } from 'next/server'
import React, { Suspense } from 'react'
import z from 'zod'
const searchParamsSchema = z.object({
    title: z.string().optional().catch(undefined),
    city: z.string().optional().catch(undefined),
    state: z.string().optional().catch(undefined),
    experience: z.enum(experienceLevels).optional().catch(undefined),
    locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
    type: z.enum(jobListingTypes).optional().catch(undefined),
    jobIds: z
      .union([z.string(), z.array(z.string())])
      .transform(v => (Array.isArray(v) ? v : [v]))
      .optional()
      .catch([]),
  })
type Props = {
    searchParams: Promise<Record<string,string>>
    params? :Promise<{JobListingId:string}>
}
const JobListingItems = (props:Props) => {
  return (
    <Suspense fallback={<JobListingItemsSkeleton />}>
        <SuspendedComponent {...props} />
    </Suspense>
  )
}

export default JobListingItems


async function SuspendedComponent({searchParams , params}:Props){   
    const search = await searchParams;
    const validatedSearchParams = searchParamsSchema.parse(search);
    const jobListingId = params ? (await params).JobListingId : undefined ;
    const hasFilters = validatedSearchParams.title || 
      validatedSearchParams.city || 
      validatedSearchParams.state || 
      validatedSearchParams.experience || 
      validatedSearchParams.locationRequirement || 
      validatedSearchParams.type ||
      (validatedSearchParams.jobIds && validatedSearchParams.jobIds.length > 0);
    
    if (hasFilters) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    const jobListings = await getJobListings(validatedSearchParams, jobListingId);
    
    if(jobListings.length === 0) {
      return <div className='text-center text-2xl font-bold m-4 text-muted-foreground'>No job listings found</div>;
    }
    
    return  (
      <div className='space-y-4'>
        {jobListings.map((jobListing) => (
          <Link className='block' href={`/job-listings/${jobListing.id}?${convertSearchparamToString(search)}`} key={jobListing.id}>
            <JobListingListItem organization={jobListing.organization} jobListing={jobListing} />
          </Link>
        ))}
      </div>
    )
}


function JobListingListItem({
    jobListing,
    organization,
  }: {
    jobListing: Pick<
      typeof JobListingTable.$inferSelect,
      | "title"
      | "stateAbbreviation"
      | "city"
      | "wage"
      | "wageInterval"
      | "experienceLevel"
      | "type"
      | "postedAt"
      | "locationRequirement"
      | "isFeatured"
    >
    organization: Pick<typeof OrganizationTable.$inferSelect, "name" | "imageUrl">
  }) {
    const nameInitials = organization?.name
      .split(" ")
      .splice(0, 4)
      .map(word => word[0])
      .join("")
  
    return (
      <Card
        className={cn(
          "@container",
          jobListing.isFeatured && "border-featured bg-featured/20"
        )}
      >
        <CardHeader>
          <div className="flex gap-4">
            <Avatar className="size-14 @max-sm:hidden">
              <AvatarImage
                src={organization.imageUrl ?? undefined}
                alt={organization.name}
              />
              <AvatarFallback className="uppercase bg-primary text-primary-foreground">
                {nameInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">{jobListing.title}</CardTitle>
              <CardDescription className="text-base">
                {organization.name}
              </CardDescription>
              {jobListing.postedAt != null && (
                <div className="text-sm font-medium text-primary @min-md:hidden">
                  <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                    <DaysSincePosting postedAt={jobListing.postedAt} />
                  </Suspense>
                </div>
              )}
            </div>
            {jobListing.postedAt != null && (
              <div className="text-sm font-medium text-primary ml-auto @max-md:hidden">
                <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                  <DaysSincePosting postedAt={jobListing.postedAt} />
                </Suspense>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <JobListingBadges
            jobListing={jobListing}
            className={jobListing.isFeatured ? "border-primary/35" : undefined}
          />
        </CardContent>
      </Card>
    )
  }
  async function DaysSincePosting({ postedAt }: { postedAt: Date }) {
    await connection();
    const daysSincePosted = differenceInDays(postedAt, new Date())
    
    if (daysSincePosted === 0) {
      return <Badge>New</Badge>
    }
  
    return new Intl.RelativeTimeFormat(undefined, {
      style: "narrow",
      numeric: "always",
    }).format(daysSincePosted, "days")
  }
  
  async function getJobListings(
    searchParams: z.infer<typeof searchParamsSchema>,
    jobListingId: string | undefined
  ) {
  
    const whereConditions: (SQL | undefined)[] = []
    if (searchParams.title) {
      const searchTitleWithoutSpaces = searchParams.title.toLowerCase().replace(/\s+/g, '')
      whereConditions.push(
        sql`LOWER(REPLACE(${JobListingTable.title}, ' ', '')) ILIKE ${'%' + searchTitleWithoutSpaces + '%'}`
      )
    }
  
    if (searchParams.locationRequirement) {
      whereConditions.push(
        eq(JobListingTable.locationRequirement, searchParams.locationRequirement)
      )
    }
  
    if (searchParams.city) {
      whereConditions.push(ilike(JobListingTable.city, `%${searchParams.city}%`))
    }
  
    if (searchParams.state) {
      whereConditions.push(
        eq(JobListingTable.stateAbbreviation, searchParams.state)
      )
    }
  
    if (searchParams.experience) {
      whereConditions.push(
        eq(JobListingTable.experienceLevel, searchParams.experience)
      )
    }
  
    if (searchParams.type) {
      whereConditions.push(eq(JobListingTable.type, searchParams.type))
    }
  
    if (searchParams.jobIds) {
      whereConditions.push(
        or(...searchParams.jobIds.map(jobId => eq(JobListingTable.id, jobId)))
      )
    }
  
    const data = await db.query.JobListingTable.findMany({
      where: or(
        jobListingId
          ? and(
              eq(JobListingTable.status, "published"),
              eq(JobListingTable.id, jobListingId)
            )
          : undefined,
        and(eq(JobListingTable.status, "published"), ...whereConditions)
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
      orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)],
    })
  

  
    return data
  }

function JobListingItemsSkeleton() {
  return (
    <div className='space-y-4'>
      {Array.from({ length: 5 }).map((_, index) => (
        <JobListingCardSkeleton key={index} />
      ))}
    </div>
  )
}

function JobListingCardSkeleton() {
  return (
    <Card className="@container">
      <CardHeader>
        <div className="flex gap-4">
          <Skeleton className="size-14 rounded-full @max-sm:hidden" />
          <div className="flex flex-col gap-1 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-16 @min-md:hidden" />
          </div>
          <Skeleton className="h-4 w-16 @max-md:hidden" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-18" />
      </CardContent>
    </Card>
  )
}
  
  