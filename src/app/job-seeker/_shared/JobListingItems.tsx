import { db } from '@/app/drizzle/db'
import { experienceLevels, JobListingTable, jobListingTypes, locationRequirements, OrganizationTable } from '@/app/drizzle/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { convertSearchparamToString } from '@/lib/convertSearchparamsToString'
import { cn } from '@/lib/utils'
import { and, desc, asc, eq, ilike, or, SQL, sql, gte } from 'drizzle-orm'
import { differenceInDays, subDays } from "date-fns";
import Link from 'next/link'
import { connection } from 'next/server'
import React, { Suspense } from 'react'
import z from 'zod'
// import { normalizeToAnnualSalary } from '@/features/jobListings/lib/formatters'
import { BookmarkButton } from '@/features/jobBookmarks/components/BookmarkButton'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import { isJobBookmarked, getBulkBookmarkStatus } from '@/features/jobBookmarks/actions/actions'
const searchParamsSchema = z.object({
    title: z.string().optional().catch(undefined),
    city: z.string().optional().catch(undefined),
    state: z.string().optional().catch(undefined),
    experience: z.enum(experienceLevels).optional().catch(undefined),
    locationRequirement: z.enum(locationRequirements).optional().catch(undefined),
    type: z.enum(jobListingTypes).optional().catch(undefined),
    minSalary: z.string().optional().catch(undefined),
    maxSalary: z.string().optional().catch(undefined),
    skills: z.string().optional().catch(undefined),
    datePosted: z.string().optional().catch(undefined),
    remoteOnly: z.string().optional().catch(undefined),
  sort: z.enum(["featured","newest","oldest"]).optional().catch(undefined),
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
      validatedSearchParams.minSalary ||
      validatedSearchParams.maxSalary ||
      validatedSearchParams.skills ||
      validatedSearchParams.datePosted ||
      validatedSearchParams.remoteOnly ||
      (validatedSearchParams.jobIds && validatedSearchParams.jobIds.length > 0);
    
    if (hasFilters) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
    
  const jobListings = await getJobListings(validatedSearchParams, jobListingId);
  
  // Batch fetch bookmark statuses to avoid N+1 queries
  const { userId } = await getCurrentUser()
  let bookmarkStatuses: Record<string, boolean> = {}
  
  if (userId && jobListings.length > 0) {
    const jobIds = jobListings.map(job => job.id)
    bookmarkStatuses = await getBulkBookmarkStatus(userId, jobIds)
  }
    
    if(jobListings.length === 0) {
      return <div className='text-center text-2xl font-bold m-4 text-muted-foreground'>No job listings found</div>;
    }
    
    const resultsCount = jobListings.length
    return  (
      <div className='space-y-4'>
        <ResultsHeader search={search} validated={validatedSearchParams} count={resultsCount} />
        {jobListings.map((jobListing) => (
          <Link className='block' href={`/job-seeker/job-listings/${jobListing.id}?${convertSearchparamToString(search)}`} key={jobListing.id}>
            <JobListingListItem 
              organization={jobListing.organization} 
              jobListing={jobListing}
              initialBookmarked={bookmarkStatuses[jobListing.id]}
            />
          </Link>
        ))}
      </div>
    )
}

function ResultsHeader({ search, validated, count }: { search: Record<string,string>, validated: z.infer<typeof searchParamsSchema>, count: number }){
  const params = new URLSearchParams(search as Record<string, string>)
  const makeHref = (next: URLSearchParams) => `/job-seeker?${next.toString()}`
  const removeKey = (key: string) => {
    const next = new URLSearchParams(params)
    next.delete(key)
    return makeHref(next)
  }
  const setSort = (value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set('sort', value)
    else next.delete('sort')
    return makeHref(next)
  }

  const activeChips: { key: keyof typeof validated, label: string, value?: string }[] = []
  const push = (key: keyof typeof validated, label: string, value?: string) => activeChips.push({ key, label, value })
  if (validated.title) push('title', 'Title', validated.title)
  if (validated.city) push('city', 'City', validated.city)
  if (validated.state) push('state', 'State', validated.state)
  if (validated.experience) push('experience', 'Experience', validated.experience)
  if (validated.locationRequirement) push('locationRequirement', 'Location', validated.locationRequirement)
  if (validated.type) push('type', 'Type', validated.type)
  if (validated.minSalary) push('minSalary', 'Min', validated.minSalary)
  if (validated.maxSalary) push('maxSalary', 'Max', validated.maxSalary)
  if (validated.skills) push('skills', 'Skills', validated.skills)
  if (validated.datePosted) push('datePosted', 'Posted', validated.datePosted)
  if (validated.remoteOnly) push('remoteOnly', 'Remote Only', validated.remoteOnly)

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          <span className='font-medium text-foreground'>{count}</span> results
        </div>
        <div className='flex items-center gap-2 text-xs'>
          <span className='text-muted-foreground'>Sort:</span>
          <Link className={`px-2 py-1 rounded-md border ${(!validated.sort || validated.sort==='featured') ? 'bg-accent' : ''}`} href={setSort('featured')}>Featured</Link>
          <Link className={`px-2 py-1 rounded-md border ${validated.sort==='newest' ? 'bg-accent' : ''}`} href={setSort('newest')}>Newest</Link>
          <Link className={`px-2 py-1 rounded-md border ${validated.sort==='oldest' ? 'bg-accent' : ''}`} href={setSort('oldest')}>Oldest</Link>
        </div>
      </div>
      {activeChips.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {activeChips.map(({key, label, value}) => (
            <Link key={String(key)} href={removeKey(String(key))} className='text-xs border rounded-full px-2 py-1 hover:bg-accent'>
              {label}: {value ?? ''} ×
            </Link>
          ))}
          <Link href='/job-seeker' className='text-xs text-muted-foreground underline'>Clear all</Link>
        </div>
      )}
    </div>
  )
}


function JobListingListItem({
    jobListing,
    organization,
    initialBookmarked,
  }: {
    jobListing: Pick<
      typeof JobListingTable.$inferSelect,
      | "id"
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
      | "skills"
    >
    organization: Pick<typeof OrganizationTable.$inferSelect, "name" | "imageUrl">
    initialBookmarked?: boolean
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
          <CardContent className="flex justify-between items-start">
            <div className="flex flex-wrap gap-0">
              <JobListingBadges
                jobListing={jobListing}
                className={jobListing.isFeatured ? "border-primary/35" : undefined}
              />
            </div>
            <Suspense fallback={<div className="w-20 h-8" />}>
              <BookmarkButtonWrapper 
                jobListingId={jobListing.id} 
                initialBookmarked={initialBookmarked}
              />
            </Suspense>
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

    // Salary filtering - normalize all salaries to annual equivalents for comparison
    if (searchParams.minSalary || searchParams.maxSalary) {
      const minSalary = searchParams.minSalary ? parseInt(searchParams.minSalary, 10) : undefined
      const maxSalary = searchParams.maxSalary ? parseInt(searchParams.maxSalary, 10) : undefined
      if ((minSalary !== undefined && !isNaN(minSalary)) || (maxSalary !== undefined && !isNaN(maxSalary))) {
        whereConditions.push(sql`
          (
            CASE 
              WHEN ${JobListingTable.wageInterval} = 'yearly' THEN ${JobListingTable.wage}
              WHEN ${JobListingTable.wageInterval} = 'monthly' THEN ${JobListingTable.wage} * 12
              WHEN ${JobListingTable.wageInterval} = 'hourly' THEN ${JobListingTable.wage} * 2080
              ELSE NULL
            END
          ) IS NOT NULL
        `)
        if (minSalary !== undefined && !isNaN(minSalary)) {
          whereConditions.push(sql`
            (
              CASE 
                WHEN ${JobListingTable.wageInterval} = 'yearly' THEN ${JobListingTable.wage}
                WHEN ${JobListingTable.wageInterval} = 'monthly' THEN ${JobListingTable.wage} * 12
                WHEN ${JobListingTable.wageInterval} = 'hourly' THEN ${JobListingTable.wage} * 2080
                ELSE NULL
              END
            ) >= ${minSalary}
          `)
        }
        if (maxSalary !== undefined && !isNaN(maxSalary)) {
          whereConditions.push(sql`
            (
              CASE 
                WHEN ${JobListingTable.wageInterval} = 'yearly' THEN ${JobListingTable.wage}
                WHEN ${JobListingTable.wageInterval} = 'monthly' THEN ${JobListingTable.wage} * 12
                WHEN ${JobListingTable.wageInterval} = 'hourly' THEN ${JobListingTable.wage} * 2080
                ELSE NULL
              END
            ) <= ${maxSalary}
          `)
        }
      }
    }

    // Skills filtering
    if (searchParams.skills) {
      const skillsArray = searchParams.skills.split(",").map(s => s.trim()).filter(Boolean)
      if (skillsArray.length > 0) {
        whereConditions.push(
          sql`${JobListingTable.skills} && ${skillsArray}`
        )
      }
    }

    // Date posted filtering
    if (searchParams.datePosted) {
      const daysAgo = parseInt(searchParams.datePosted, 10)
      if (!isNaN(daysAgo) && daysAgo > 0) {
        const cutoffDate = subDays(new Date(), daysAgo)
        whereConditions.push(
          gte(JobListingTable.postedAt, cutoffDate)
        )
      }
    }

    // Remote only filtering
    if (searchParams.remoteOnly === "true") {
      whereConditions.push(
        or(
          eq(JobListingTable.locationRequirement, "remote"),
          eq(JobListingTable.locationRequirement, "hybrid")
        )
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
      orderBy: (
        searchParams.sort === 'oldest'
          ? [desc(JobListingTable.isFeatured), asc(JobListingTable.postedAt)]
          : searchParams.sort === 'newest'
          ? [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)]
          : [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)]
      ),
    })
  

  
    return data
  }

async function BookmarkButtonWrapper({ 
  jobListingId, 
  initialBookmarked 
}: { 
  jobListingId: string
  initialBookmarked?: boolean 
}) {
  const { userId } = await getCurrentUser()
  if (!userId) {
    return <BookmarkButton jobListingId={jobListingId} />
  }
  
  // Use the pre-fetched bookmark status if available, otherwise fallback to individual query
  const bookmarked = initialBookmarked ?? await isJobBookmarked(userId, jobListingId)
  return <BookmarkButton jobListingId={jobListingId} initialBookmarked={bookmarked} />
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
      <CardContent className="flex flex-wrap gap-0">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-18" />
      </CardContent>
    </Card>
  )
}
  
  