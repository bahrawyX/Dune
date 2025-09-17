"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bell, Mail, Calendar, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StepData } from "../OnboardingStepper"

interface StepNotificationsProps {
  data: StepData
  updateData: (stepKey: keyof StepData, data: any) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export function StepNotifications({ 
  data, 
  updateData, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast 
}: StepNotificationsProps) {
  const [formData, setFormData] = useState({
    emailAlerts: data.notifications.emailAlerts ?? true,
    aiPrompt: data.notifications.aiPrompt ?? ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateData("notifications", formData)
    onNext()
  }

  const notificationOptions = [
    {
      id: "emailAlerts",
      title: "Job Match Alerts",
      description: "Get notified when new jobs match your preferences",
      icon: Briefcase,
      checked: formData.emailAlerts,
      onChange: (checked: boolean) => 
        setFormData(prev => ({ ...prev, emailAlerts: checked }))
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          Notification Preferences
        </h3>
        <p className="text-muted-foreground">
          Choose how you'd like to stay updated about job opportunities and application status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
            {notificationOptions.map((option) => (
              <Card key={option.id} className="transition-colors hover:bg-muted/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                        <option.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{option.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {option.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={option.checked}
                      onCheckedChange={option.onChange}
                    />
                  </div>
                </CardHeader>
              </Card>
            ))}

            <Card className="transition-colors hover:bg-muted/30">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">AI Job Matching Prompt</CardTitle>
                    <CardDescription className="text-sm">
                      Describe your ideal job to help our AI find better matches (optional)
                    </CardDescription>
                  </div>
                </div>
                <textarea
                  placeholder="e.g., I'm looking for a remote software engineering role with focus on React and Node.js..."
                  value={formData.aiPrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, aiPrompt: e.target.value }))}
                  className="w-full p-3 border border-input rounded-lg resize-none h-24 text-sm"
                />
              </CardHeader>
            </Card>
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Preferences
          </h4>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              • You can change these settings anytime in your profile
            </p>
            <p>
              • All emails include an easy unsubscribe option
            </p>
            <p>
              • We respect your privacy and never share your email
            </p>
            {!formData.emailAlerts && (
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ You won't receive any email notifications with current settings
              </p>
            )}
          </div>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-full flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Stay Connected</h4>
                <p className="text-xs text-muted-foreground">
                  Enable notifications to never miss great opportunities. 
                  Our AI learns from your preferences to send you the most relevant matches.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="submit">
            Complete Setup
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
