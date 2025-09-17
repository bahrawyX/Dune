"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, ChevronLeft, User, Briefcase, Upload, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { StepPersonalInfo } from "./steps/StepPersonalInfo"
import { StepJobPreferences } from "./steps/StepJobPreferences"
import { StepResumeUpload } from "./steps/StepResumeUpload"
import { StepAdditionalPreferences } from "./steps/StepAdditionalPreferences"
import { StepNotifications } from "./steps/StepNotifications"
import { StepCompletion } from "./steps/StepCompletion"
import { markOnboardingComplete } from "@/features/onboarding/actions/actions"

export interface StepData {
  personalInfo: {
    firstName: string
    lastName: string
  }
  jobPreferences: {
    title: string
    fieldsOfInterest: string[]
    experienceLevel: string
  }
  resume: {
    hasResume: boolean
    resumeUrl?: string
  }
  additionalPreferences: {
    location: string
    remoteWork: boolean
    salaryRange: {
      min: number
      max: number
    }
  }
  notifications: {
    emailAlerts: boolean
    aiPrompt: string
  }
}

const steps = [
  {
    id: 1,
    title: "Personal Info",
    description: "Tell us about yourself",
    icon: User,
    component: StepPersonalInfo
  },
  {
    id: 2,
    title: "Job Preferences",
    description: "What kind of work interests you?",
    icon: Briefcase,
    component: StepJobPreferences
  },
  {
    id: 3,
    title: "Resume",
    description: "Upload your resume (optional)",
    icon: Upload,
    component: StepResumeUpload
  },
  {
    id: 4,
    title: "Preferences",
    description: "Location and salary preferences",
    icon: Settings,
    component: StepAdditionalPreferences
  },
  {
    id: 5,
    title: "Notifications",
    description: "How would you like to be notified?",
    icon: Bell,
    component: StepNotifications
  }
]

export function OnboardingStepper() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [stepData, setStepData] = useState<StepData>({
    personalInfo: { firstName: "", lastName: "" },
    jobPreferences: { title: "", fieldsOfInterest: [], experienceLevel: "" },
    resume: { hasResume: false },
    additionalPreferences: { 
      location: "", 
      remoteWork: false, 
      salaryRange: { min: 0, max: 0 } 
    },
    notifications: { 
      emailAlerts: true, 
      aiPrompt: "" 
    }
  })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCompletedSteps(prev => [...prev, currentStep])
      setCurrentStep(prev => prev + 1)
    } else {
      // All steps completed, mark onboarding as complete and redirect
      startTransition(async () => {
        try {
          await markOnboardingComplete()
          router.push("/job-seeker")
        } catch (error) {
          console.error("Failed to mark onboarding complete:", error)
          // Still redirect even if marking fails
          router.push("/job-seeker")
        }
      })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleStepClick = (stepId: number) => {
    if (stepId <= currentStep || completedSteps.includes(stepId)) {
      setCurrentStep(stepId)
    }
  }

  const updateStepData = (stepKey: keyof StepData, data: any) => {
    setStepData(prev => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], ...data }
    }))
  }

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId)
  const isStepActive = (stepId: number) => currentStep === stepId
  const isStepAccessible = (stepId: number) => stepId <= currentStep || completedSteps.includes(stepId)

  // Show completion screen after all steps
  if (currentStep > steps.length) {
    return <StepCompletion onComplete={() => router.push("/job-seeker")} />
  }

  const CurrentStepComponent = steps[currentStep - 1].component

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.button
                onClick={() => handleStepClick(step.id)}
                disabled={!isStepAccessible(step.id)}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                  isStepCompleted(step.id)
                    ? "bg-primary border-primary text-primary-foreground"
                    : isStepActive(step.id)
                    ? "bg-primary/10 border-primary text-primary"
                    : isStepAccessible(step.id)
                    ? "bg-background border-muted-foreground/30 text-muted-foreground hover:border-primary/50 hover:text-primary cursor-pointer"
                    : "bg-muted border-muted-foreground/20 text-muted-foreground/50 cursor-not-allowed"
                )}
                whileHover={isStepAccessible(step.id) ? { scale: 1.05 } : {}}
                whileTap={isStepAccessible(step.id) ? { scale: 0.95 } : {}}
              >
                {isStepCompleted(step.id) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </motion.button>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-16 h-0.5 mx-2 transition-colors duration-300",
                  isStepCompleted(step.id) ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {steps[currentStep - 1].title}
          </h2>
          <p className="text-muted-foreground">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentStepComponent
                data={stepData}
                updateData={updateStepData}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirst={currentStep === 1}
                isLast={currentStep === steps.length}
              />
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>

        <Button
          onClick={handleNext}
          disabled={isPending}
          className="flex items-center gap-2"
        >
          {currentStep === steps.length ? "Complete Setup" : "Next"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
