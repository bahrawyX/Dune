'use client'

import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Dune Inc.</h1>
          <p className="text-muted-foreground">Let's get you set up in just a few steps</p>
        </div>
        <OnboardingStepper />
      </div>
    </div>
  )
}
