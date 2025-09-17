import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import { redirect } from 'next/navigation'
import { getBookmarkedJobs } from '@/features/jobBookmarks/actions/actions'
import Link from 'next/link'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookmarkButton } from '@/features/jobBookmarks/components/BookmarkButton'
import { Bookmark } from 'lucide-react'

export default async function BookmarksPage() {
  const { userId } = await getCurrentUser()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const bookmarkedJobs = await getBookmarkedJobs(userId)

  if (bookmarkedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No bookmarked jobs yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start exploring job listings and bookmark the ones that interest you. They'll appear here for easy access.
        </p>
        <Link 
          href="/job-seeker" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Browse Jobs
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bookmarked Jobs</h1>
        <p className="text-muted-foreground">
          {bookmarkedJobs.length} job{bookmarkedJobs.length !== 1 ? 's' : ''} saved
        </p>
      </div>
      
      <div className="space-y-4">
        {bookmarkedJobs.map((bookmark) => {
          const job = bookmark.jobListing
          const organization = job.organization
          
          const nameInitials = organization?.name
            .split(" ")
            .splice(0, 4)
            .map(word => word[0])
            .join("")

          return (
            <Card key={bookmark.jobListingId} className={job.isFeatured ? "border-featured bg-featured/20" : ""}>
              <CardHeader>
                <div className="flex gap-4">
                  <Avatar className="size-14">
                    <AvatarImage
                      src={organization.imageUrl ?? undefined}
                      alt={organization.name}
                    />
                    <AvatarFallback className="uppercase bg-primary text-primary-foreground">
                      {nameInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 flex-1">
                    <CardTitle className="text-xl">
                      <Link 
                        href={`/job-seeker/job-listings/${job.id}`}
                        className="hover:underline"
                      >
                        {job.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-base">
                      {organization.name}
                    </CardDescription>
                  </div>
                  <BookmarkButton 
                    jobListingId={job.id} 
                    initialBookmarked={true}
                    variant="ghost"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-0">
                <JobListingBadges
                  jobListing={job}
                  className={job.isFeatured ? "border-primary/35" : undefined}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
