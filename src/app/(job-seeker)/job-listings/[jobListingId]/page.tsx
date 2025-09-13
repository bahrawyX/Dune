import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import React, { Suspense } from 'react'
import JobListingItems from '../../_shared/JobListingItems'
import { IsBreakPoint } from '@/components/IsBreakPoint'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import ClientSheet from './_ClientSheet'
import { and, eq } from 'drizzle-orm'
import { db } from '@/app/drizzle/db'
import { JobListingApplicationTable, JobListingTable, UserResumeTable, UserTable } from '@/app/drizzle/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Dot, FileUser, Upload, XIcon } from 'lucide-react'
import { notFound } from 'next/navigation'
import { JobListingBadges } from '@/features/jobListings/components/JobListingBadges'
import { convertSearchparamToString } from '@/lib/convertSearchparamsToString'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SignUpButton } from '@/services/clerk/components/AuthButtons'
import { differenceInDays } from 'date-fns'
import { connection } from 'next/server'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { NewJobListingApplicationForm } from '@/features/jobListingsApplication/components/NewJobListingApplicationForm'

export default function JobListingPage({params , searchParams }:{
  params:Promise<{jobListingId:string}>
  searchParams:Promise<Record<string,string | string[]>>
}) {
  return (
    <ResizablePanelGroup autoSaveId='job-board-panel' direction='horizontal'>
        <ResizablePanel id="left" order={1} defaultSize={60} minSize={30} maxSize={80}>
            <div className="p-4 h-screen overflow-y-auto">
                  <JobListingItems searchParams={Promise.resolve({})} />
            </div>
        </ResizablePanel>
        <IsBreakPoint breakpoint='min-width:1024px' otherwise={
            <ClientSheet >
                <SheetContent hideCloseButton className='p-4 '>
                  <SheetHeader className='sr-only'>
                    <SheetTitle>Job Listing Details :</SheetTitle>
                  </SheetHeader>
                  <Suspense fallback={<LoadingSpinner />}>
                    <JobListingDetails params={params} searchParams={searchParams} />
                  </Suspense>
                </SheetContent>
            </ClientSheet>
          } >
            <>
              <ResizableHandle withHandle className='mx-2' />
              <ResizablePanel id='right' order={2} defaultSize={40} minSize={30} maxSize={80}>
                <div className='p-4 h-screen overflow-y-auto'>
                  <Suspense fallback={<LoadingSpinner />}>
                    <JobListingDetails params={params} searchParams={searchParams} />
                  </Suspense>
                </div>
              </ResizablePanel>
            </>
        </IsBreakPoint>
    </ResizablePanelGroup>
  )
}
async function JobListingDetails({
  params,
  searchParams,
}: {
  params: Promise<{ jobListingId: string }>
  searchParams: Promise<Record<string, string | string[]>>
}) {
  try {
    const { jobListingId } = await params
    const jobListing = await getJobListing(jobListingId)
    if (jobListing == null) return notFound()

  const nameInitials = jobListing.organization.name
    .split(" ")
    .splice(0, 4)
    .map(word => word[0])
    .join("")

  return (
    <div className="space-y-6 @container">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <Avatar className="size-14 @max-md:hidden">
            <AvatarImage
              src={jobListing.organization.imageUrl ?? undefined}
              alt={jobListing.organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {jobListing.title}
            </h1>
            <div className="text-base text-muted-foreground">
              {jobListing.organization.name}
            </div>
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @min-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            {jobListing.postedAt != null && (
              <div className="text-sm text-muted-foreground @max-lg:hidden">
                {jobListing.postedAt.toLocaleDateString()}
              </div>
            )}
            <Button size="icon" variant="outline" asChild>
              <Link
                href={`/?${convertSearchparamToString(await searchParams)}`}
              >
                <span className="sr-only">Close</span>
                <XIcon />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <JobListingBadges jobListing={jobListing} />
        </div>
        <Suspense fallback={<Button disabled>Apply</Button>}>
          <ApplyButton jobListingId={jobListing.id} />
        </Suspense>
      </div>
      <MarkdownRenderer source={jobListing.description} />

    </div>
  ) 
  } catch (error) {
    console.error('Error in JobListingDetails:', error)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground">Failed to load job listing details</p>
        </div>
      </div>
    )
  }
}
async function getjobListingApplication({
  jobListingId,
  userId
}: {
  jobListingId: string,
  userId: string
})
{
  return db.query.JobListingApplicationTable.findFirst({
    where: and(eq(JobListingApplicationTable.jobListingId, jobListingId),
               eq(JobListingApplicationTable.userId, userId))
  })
}
async function ApplyButton({ jobListingId }: { jobListingId: string }) {
  try {
    const { userId } = await getCurrentUser()
    if (userId == null) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button>Apply</Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col gap-2">
            You need to create an account before applying for a job.
            <SignUpButton />
          </PopoverContent>
        </Popover>
      )
    }
    const existingApplication = await getjobListingApplication({jobListingId, userId})
    if (existingApplication) {
      const formatter = new Intl.DateTimeFormat(undefined,{dateStyle:'short', timeStyle:'short'})
      await connection()
      const difference = differenceInDays(new Date(), existingApplication.createdAt)
      return (
        <div className='space-y-4 space-grotesk  text-md text-featured flex items-center'>
           <Dot /> You Have Already Applied! {" "}
            {difference === 0 ? `Today at ${formatter.format(existingApplication.createdAt)}` : `On ${formatter.format(existingApplication.createdAt)}`}
        </div>
      )
    }
    const userResume = await getUserResume(userId);
   if (userResume == null) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button>Apply <Upload /></Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-2">
          You need to upload a resume before applying for a job.
          <Button asChild>
            <Link href="/user-settings/resume"><FileUser /> Upload Resume</Link>
          </Button>
        </PopoverContent>
      </Popover>
    )
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Apply</Button>
      </DialogTrigger>
      <DialogContent className='md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold'>Application</DialogTitle>
            <DialogDescription className='mb-4 text-muted-foreground'>
              You are applying with the following resume. This is something that cannot be undone so please make sure everything is correct.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <NewJobListingApplicationForm jobListingId={jobListingId} />
          </div>
      </DialogContent>
    </Dialog>
  )
  } catch (error) {
    console.error('Error in ApplyButton:', error)
    return <Button disabled>Apply (Error)</Button>
  }
}

export async function getUserResume(id: string) {

  const resume = await db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, id),
  })
 
  return resume
}


async function getJobListing(id: string) {

  const listing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.status, "published")
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
  })



  return listing
}