"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Briefcase, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { StepData } from "../OnboardingStepper"

interface StepJobPreferencesProps {
  data: StepData
  updateData: (stepKey: keyof StepData, data: any) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

const popularFields = [
  "Software Development",
  "Data Science",
  "Product Management",
  "Design",
  "Marketing",
  "Sales",
  "Finance",
  "Human Resources",
  "Operations",
  "Customer Support",
  "Engineering",
  "Healthcare",
  "Education",
  "Consulting"
]

const experienceLevels = [
  { value: "junior", label: "Junior Level (0-3 years)" },
  { value: "mid-level", label: "Mid Level (3-6 years)" },
  { value: "senior", label: "Senior Level (6+ years)" }
]

export function StepJobPreferences({ 
  data, 
  updateData, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast 
}: StepJobPreferencesProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: data.jobPreferences.title || "",
    fieldsOfInterest: data.jobPreferences.fieldsOfInterest || [],
    experienceLevel: data.jobPreferences.experienceLevel || ""
  })
  const [newField, setNewField] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your desired job title.",
        variant: "destructive"
      })
      return
    }

    if (formData.fieldsOfInterest.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one field of interest.",
        variant: "destructive"
      })
      return
    }

    if (!formData.experienceLevel) {
      toast({
        title: "Missing Information",
        description: "Please select your experience level.",
        variant: "destructive"
      })
      return
    }

    updateData("jobPreferences", formData)
    onNext()
  }

  const addField = (field: string) => {
    if (field && !formData.fieldsOfInterest.includes(field)) {
      setFormData(prev => ({
        ...prev,
        fieldsOfInterest: [...prev.fieldsOfInterest, field]
      }))
    }
  }

  const removeField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      fieldsOfInterest: prev.fieldsOfInterest.filter(f => f !== field)
    }))
  }

  const addCustomField = () => {
    if (newField.trim()) {
      addField(newField.trim())
      setNewField("")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Briefcase className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          What kind of work interests you?
        </h3>
        <p className="text-muted-foreground">
          Help us understand your career goals so we can find the perfect matches.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Desired Job Title *
          </Label>
          <Input
            id="title"
            type="text"
            placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="h-12"
            required
          />
          <p className="text-xs text-muted-foreground">
            This helps us match you with relevant opportunities
          </p>
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-medium">
            Fields of Interest * (Select at least one)
          </Label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {popularFields.map((field) => (
              <Button
                key={field}
                type="button"
                variant={formData.fieldsOfInterest.includes(field) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (formData.fieldsOfInterest.includes(field)) {
                    removeField(field)
                  } else {
                    addField(field)
                  }
                }}
                className="justify-start h-auto py-2 px-3 text-sm"
              >
                {field}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add custom field..."
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomField())}
              className="flex-1"
            />
            <Button type="button" onClick={addCustomField} size="icon" variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.fieldsOfInterest.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Fields:</Label>
              <div className="flex flex-wrap gap-2">
                {formData.fieldsOfInterest.map((field) => (
                  <Badge key={field} variant="secondary" className="flex items-center gap-1">
                    {field}
                    <button
                      type="button"
                      onClick={() => removeField(field)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience" className="text-sm font-medium">
            Experience Level *
          </Label>
          <Select 
            value={formData.experienceLevel} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button 
            type="submit"
            disabled={!formData.title.trim() || formData.fieldsOfInterest.length === 0 || !formData.experienceLevel}
          >
            Continue
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
