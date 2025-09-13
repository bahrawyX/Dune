'use client'

import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Onboarding is disabled - redirect users directly to main app
export default function OnboardingPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
        <p className="text-muted-foreground">Redirecting you to the job board...</p>
      </div>
    </div>
  )
}
