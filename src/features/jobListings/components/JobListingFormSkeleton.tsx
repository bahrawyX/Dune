import { Skeleton } from "@/components/ui/skeleton"

export function JobListingFormSkeleton() {
  return (
    <div className="space-y-6 @container">
      {/* Job Title and Wage Row */}
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
        {/* Job Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Wage */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <div className="flex">
            <Skeleton className="h-10 flex-1 rounded-r-none" />
            <Skeleton className="h-10 w-20 rounded-l-none" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* City/State and Location Requirement Row */}
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
        {/* City and State */}
        <div className="grid grid-cols-1 @xs:grid-cols-2 gap-x-2 gap-y-6 items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        
        {/* Location Requirement */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Job Type and Experience Level Row */}
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
        {/* Job Type */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        
        {/* Experience Level */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Description (Markdown Editor) */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <div className="border rounded-md">
          {/* Editor toolbar */}
          <div className="border-b p-2 flex gap-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
          {/* Editor content area */}
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Skeleton className="h-10 w-full" />
    </div>
  )
}