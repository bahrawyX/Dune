"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Sparkles, ArrowRight, User, Briefcase, Upload, Settings, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import confetti from "canvas-confetti"
import { markOnboardingComplete } from "@/features/onboarding/actions/actions"

interface StepCompletionProps {
  onComplete: () => void
}

const completedFeatures = [
  {
    icon: User,
    title: "Profile Setup",
    description: "Your personal information is ready"
  },
  {
    icon: Briefcase,
    title: "Job Preferences",
    description: "We know what you're looking for"
  },
  {
    icon: Upload,
    title: "Resume",
    description: "Your experience is showcased"
  },
  {
    icon: Settings,
    title: "Preferences",
    description: "Location and salary preferences set"
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Stay updated on opportunities"
  }
]

export function StepCompletion({ onComplete }: StepCompletionProps) {
  const [showFeatures, setShowFeatures] = useState(false)

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    // Show features after a delay
    setTimeout(() => setShowFeatures(true), 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8 max-w-2xl mx-auto"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center"
      >
        <div className="relative">
          <div className="flex items-center justify-center w-24 h-24 bg-green-500 rounded-full">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 border-4 border-green-200 border-t-green-500 rounded-full"
          />
        </div>
      </motion.div>

      {/* Main Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
          All Set! 
          <Sparkles className="w-8 h-8 text-yellow-500" />
        </h1>
        <p className="text-xl text-muted-foreground">
          Your profile is ready and you're all set to find your dream job!
        </p>
      </motion.div>

      {/* Features List */}
      <AnimatePresence>
        {showFeatures && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {completedFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="text-left">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg">
                        <feature.icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="space-y-6"
      >
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              What's Next?
            </h3>
            <div className="text-sm text-muted-foreground space-y-2 text-left">
              <p>• Browse thousands of job opportunities tailored to your preferences</p>
              <p>• Get AI-powered job recommendations based on your profile</p>
              <p>• Apply to jobs with one click using your uploaded resume</p>
              <p>• Track your applications and get real-time updates</p>
            </div>
          </CardContent>
        </Card>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={async () => {
              try {
                await markOnboardingComplete()
              } catch (error) {
                console.error("Failed to mark onboarding complete:", error)
              }
              onComplete()
            }}
            size="lg" 
            className="w-full md:w-auto px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Start Exploring Jobs
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        <p className="text-sm text-muted-foreground">
          You can always update your preferences later in your profile settings.
        </p>
      </motion.div>
    </motion.div>
  )
}

