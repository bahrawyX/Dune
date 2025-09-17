import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper"
import { LoadingSpinner } from "@/components/LoadingSpinner"
import { checkOnboardingStatus } from "@/features/onboarding/actions/actions"

export default async function GettingReadyPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  // Check if user has already completed onboarding
  const onboardingStatus = await checkOnboardingStatus()
  
  if (onboardingStatus.isCompleted) {
    redirect("/job-seeker")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Let's Get You Ready! 🚀
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We'll help you set up your profile in just a few steps so you can start finding your dream job.
            </p>
          </div>
          
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          }>
            <OnboardingStepper />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
