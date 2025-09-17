"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Settings, MapPin, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { StepData } from "../OnboardingStepper"

interface StepAdditionalPreferencesProps {
  data: StepData
  updateData: (stepKey: keyof StepData, data: Record<string, unknown>) => void
  onNext: () => void
  onPrevious: () => void
  isFirst?: boolean
  isLast?: boolean
}

const popularLocations = [
  "New York, NY",
  "San Francisco, CA",
  "Los Angeles, CA",
  "Chicago, IL",
  "Boston, MA",
  "Seattle, WA",
  "Austin, TX",
  "Denver, CO",
  "Miami, FL",
  "Atlanta, GA",
  "Remote",
  "Other"
]

export function StepAdditionalPreferences({ 
  data, 
  updateData, 
  onNext, 
  onPrevious, 
  // isFirst,
  // isLast
}: StepAdditionalPreferencesProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    location: data.additionalPreferences.location || "",
    remoteWork: data.additionalPreferences.remoteWork || false,
    salaryRange: {
      min: data.additionalPreferences.salaryRange.min || 0,
      max: data.additionalPreferences.salaryRange.max || 0
    }
  })
  const [customLocation, setCustomLocation] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.location.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select your preferred location.",
        variant: "destructive"
      })
      return
    }

    updateData("additionalPreferences", formData)
    onNext()
  }

  const handleLocationChange = (value: string) => {
    if (value === "Other") {
      // User will enter custom location
      return
    }
    setFormData(prev => ({ ...prev, location: value }))
    setCustomLocation("")
  }

  const handleCustomLocationSubmit = () => {
    if (customLocation.trim()) {
      setFormData(prev => ({ ...prev, location: customLocation.trim() }))
      setCustomLocation("")
    }
  }

  const formatSalary = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          Job Preferences
        </h3>
        <p className="text-muted-foreground">
          Tell us about your location and salary preferences to find the best matches.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Preferred Location *
            </Label>
            <Select value={formData.location} onValueChange={handleLocationChange}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select your preferred location" />
              </SelectTrigger>
              <SelectContent>
                {popularLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {customLocation !== "" || (!formData.location && customLocation === "") ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom location..."
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleCustomLocationSubmit())}
                  className="flex-1"
                />
                <Button type="button" onClick={handleCustomLocationSubmit} variant="outline">
                  Add
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Open to Remote Work</Label>
              <p className="text-sm text-muted-foreground">
                Include fully remote positions in your search
              </p>
            </div>
            <Switch
              checked={formData.remoteWork}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, remoteWork: checked }))
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Salary Range (Annual, USD) - Optional
          </Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minSalary" className="text-xs text-muted-foreground">
                Minimum
              </Label>
              <Input
                id="minSalary"
                type="number"
                placeholder="50,000"
                value={formData.salaryRange.min || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, min: parseInt(e.target.value) || 0 }
                }))}
                className="h-12"
              />
              {formData.salaryRange.min > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatSalary(formData.salaryRange.min)}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxSalary" className="text-xs text-muted-foreground">
                Maximum
              </Label>
              <Input
                id="maxSalary"
                type="number"
                placeholder="150,000"
                value={formData.salaryRange.max || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salaryRange: { ...prev.salaryRange, max: parseInt(e.target.value) || 0 }
                }))}
                className="h-12"
              />
              {formData.salaryRange.max > 0 && (
                <p className="text-xs text-muted-foreground">
                  {formatSalary(formData.salaryRange.max)}
                </p>
              )}
            </div>
          </div>
          
          {formData.salaryRange.min > 0 && formData.salaryRange.max > 0 && (
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm">
                <strong>Salary Range:</strong> {formatSalary(formData.salaryRange.min)} - {formatSalary(formData.salaryRange.max)} annually
              </p>
            </div>
          )}
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">Privacy Note</h4>
          <p className="text-sm text-muted-foreground">
            Your salary preferences are private and will only be used to filter job recommendations. 
            Employers cannot see this information unless you choose to share it during the application process.
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="submit" disabled={!formData.location.trim()}>
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
