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
  import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer"
  import { Skeleton } from "@/components/ui/skeleton"
  import { FileText, Upload } from "lucide-react"
import { Separator } from "@radix-ui/react-separator"
  
  export default async function UserResumePage() {
    const { userId } = await getCurrentUser()
    if (userId == null) return notFound()
  
    const userResume = await getUserResume(userId)
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
              <AISummaryCard userId={userId} />
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

            <AISummaryPlaceholder />
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
  
  function AISummaryPlaceholder() {
    return (
      <Card className="border-dashed border-2 ">
        <CardHeader className="text-center">

          <CardTitle className=" text-lg flex items-center gap-2 justify-center "> <FileText className="w-4 h-4 tx" /> AI Summary</CardTitle>
          <CardDescription className="text-sm text-muted-foreground space-y-2 space-grotesk">
            Once you upload your resume, our AI will analyze it and create a professional summary for employers to quickly understand your qualifications and experience.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }
  
  async function AISummaryCard({ userId }: { userId: string }) {
    const userResume = await getUserResume(userId)
    
  if (userResume == null) return <AISummaryPlaceholder />
  
    if (userResume.aiSummary == null) {
      return (
        <Card className="b">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10  rounded-full mb-2">
              <FileText className="w-4 h-4 " />
            </div>
            <CardTitle className=" text-lg">AI Summary Processing</CardTitle>
            <CardDescription className=" text-sm">
              Your resume has been uploaded successfully! Our AI is currently analyzing it to create a professional summary. This usually takes a few moments.
            </CardDescription>
          </CardHeader>
        </Card>
      )
    }
  
    return (
      <Card className="">
        <CardHeader className="">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-4 h-4" />
            AI Summary
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground space-grotesk">
            This summary is generated after your upload. {userResume.updatedAt ? `Last updated ${new Date(userResume.updatedAt).toLocaleString()}.` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <MarkdownRenderer source={userResume.aiSummary} />
        </CardContent>
      </Card>
    )
  }
  
  async function getUserResume(userId: string) {
    
    const userResume = await db.query.UserResumeTable.findFirst({
      where: eq(UserResumeTable.userId, userId),
    })
    console.log('User resume:', userResume)
    return userResume
  }