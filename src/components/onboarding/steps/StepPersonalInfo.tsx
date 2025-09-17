"use client"

import { useState, useTransition } from "react"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { StepData } from "../OnboardingStepper"

interface StepPersonalInfoProps {
  data: StepData
  updateData: (stepKey: keyof StepData, data: any) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export function StepPersonalInfo({ 
  data, 
  updateData, 
  onNext, 
  isFirst, 
  isLast 
}: StepPersonalInfoProps) {
  const { user } = useUser()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    firstName: data.personalInfo.firstName || user?.firstName || "",
    lastName: data.personalInfo.lastName || user?.lastName || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both your first and last name.",
        variant: "destructive"
      })
      return
    }

    startTransition(async () => {
      try {
        // Update Clerk user profile
        if (user && (user.firstName !== formData.firstName || user.lastName !== formData.lastName)) {
          await user.update({
            firstName: formData.firstName,
            lastName: formData.lastName
          })
        }

        // Update local state
        updateData("personalInfo", formData)
        
        toast({
          title: "Profile Updated",
          description: "Your name has been saved successfully.",
        })
        
        onNext()
      } catch (error) {
        console.error("Error updating profile:", error)
        toast({
          title: "Update Failed",
          description: "There was an error updating your profile. Please try again.",
          variant: "destructive"
        })
      }
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          Welcome! Let's start with your name
        </h3>
        <p className="text-muted-foreground">
          This information will be used to personalize your job search experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name *
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className="h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name *
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className="h-12"
              required
            />
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Privacy Note:</strong> Your name will be visible to employers when you apply for jobs. 
            You can always update this information later in your profile settings.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={isPending || !formData.firstName.trim() || !formData.lastName.trim()}
            className="min-w-32"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
