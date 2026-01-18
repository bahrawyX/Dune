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
    // Check user role and redirect accordingly
    // For now, redirect to job-seeker by default
    redirect("/job-seeker")
  }

  // If not completed, redirect to the main onboarding page
  redirect("/onboarding")
