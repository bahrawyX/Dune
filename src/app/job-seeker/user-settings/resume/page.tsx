import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Suspense } from "react"
  import DropzoneClient from "./_dropzoneClient"
  import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth"
  import { notFound } from "next/navigation"
  import { Button } from "@/components/ui/button"
  import Link from "next/link"
  import { db } from "@/app/drizzle/db"
  import { UserResumeTable } from "@/app/drizzle/schema"
  import { eq } from "drizzle-orm"
  import { Skeleton } from "@/components/ui/skeleton"
  import { FileText, Upload } from "lucide-react"
  import { AISummaryStatus } from "@/components/resume/AISummaryStatus"
  
  export default async function UserResumePage() {
    const { userId, user } = await getCurrentUser({ allData: true })
    console.log('User ID FROM RESUME PAGE:', userId)
    console.log('User FROM RESUME PAGE:', user)
    if (userId == null) return notFound()
    
    // Use the actual database user ID if available, fallback to session ID
    const actualUserId = user?.id || userId
    console.log('Actual User ID for resume lookup:', actualUserId)
  
    const userResume = await getUserResume(actualUserId)
    const hasResume = userResume != null
     
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
        {hasResume ? (
          <>
            <Card className="border-[#889258]">
              <CardHeader className="text-center">
                  <CardTitle className=" text-lg flex items-center gap-2 justify-center "><FileText className="w-5 h-5 text-[#889258] " /> Resume uploaded successfully  </CardTitle>
                <CardDescription className="text-sm text-muted-foreground space-grotesk">
                  Your resume is ready and available for employers to view
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button asChild size="default" className="">
                  <Link
                    href={userResume.resumeFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4"  />
                    View Resume
                  </Link>
                </Button>
              </CardContent>
              {userResume.updatedAt && (
                <CardFooter className="justify-center">
                  <p className="text-xs text-muted-foreground">Last updated: {new Date(userResume.updatedAt).toLocaleString()}</p>
                </CardFooter>
              )}
            </Card>

            <Card className="b">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-lg">
                  <Upload className="w-5 h-5" />
                  Want to update it?
                </CardTitle>
                <CardDescription className="text-muted-foreground space-grotesk">
                  Upload a new version to replace your current resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<UploadSkeleton />}>
                  <DropzoneClient />
                </Suspense>
                <p className="mt-3 text-center text-xs text-muted-foreground">PDF only · Max size 8MB · 1 file</p>
              </CardContent>
            </Card>

            <Suspense fallback={<AISummarySkeleton />}>
              <AISummaryStatus 
                userId={actualUserId} 
                initialSummary={userResume.aiSummary} 
                resumeUpdatedAt={userResume.updatedAt} 
              />
            </Suspense>
          </>
        ) : (
          <>
            <Card className="b">
              <CardContent className="pt-6">
                <div className="text-center space-y-4 mb-6">
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-xl font-semibold ">Upload Your Resume </h1>
                        <Upload className="w-5 h-5" />
                    </div>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm space-grotesk">
                    Get started by uploading your resume. Our AI will analyze it and create a summary for employers.
                  </p>
                </div>
                <Suspense fallback={<UploadSkeleton />}>
                  <DropzoneClient />
                </Suspense>
              </CardContent>
            </Card>

            <AISummaryStatus 
              userId={actualUserId} 
              initialSummary={null} 
              resumeUpdatedAt={null} 
            />
          </>
        )}
      </div>
    )
  }
  
  function AISummarySkeleton() {
    return (
      <Card>
        <CardHeader className="border-b">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full max-w-md" />
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    )
  }

  function UploadSkeleton() {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </div>
    )
  }
  
  async function getUserResume(userId: string) {
    console.log('getUserResume called with userId:', userId)
    
    const userResume = await db.query.UserResumeTable.findFirst({
      where: eq(UserResumeTable.userId, userId),
    })
    console.log('User resume found:', userResume ? 'YES' : 'NO', userResume)
    return userResume
  }