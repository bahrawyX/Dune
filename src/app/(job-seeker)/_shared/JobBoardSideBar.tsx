import { SidebarGroup, SidebarGroupContent } from '@/components/ui/sidebar'
import { JobListingFilterForm } from '@/features/jobListings/components/JobListingFilterForm'
import { Skeleton } from '@/components/ui/skeleton'
import React, { Suspense } from 'react'

const JobBoardSideBar = () => {
  return (
    <SidebarGroup>
        <SidebarGroupContent>
            <Suspense fallback={<JobBoardSideBarSkeleton />}>
                <JobListingFilterForm />
            </Suspense>
        </SidebarGroupContent>
    </SidebarGroup>
  )
}

const JobBoardSideBarSkeleton = () => {
  return (
    <div className="space-y-4">
      {/* Title input skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Location fields skeleton */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      {/* Select fields skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      {/* Button skeleton */}
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export default JobBoardSideBar