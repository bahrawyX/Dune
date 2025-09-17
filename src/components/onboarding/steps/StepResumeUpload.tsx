"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { StepData } from "../OnboardingStepper"
import { UploadDropzone } from "@/services/uploadthing/components/UploadThing"

interface StepResumeUploadProps {
  data: StepData
  updateData: (stepKey: keyof StepData, data: any) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export function StepResumeUpload({ 
  data, 
  updateData, 
  onNext, 
  onPrevious, 
  isFirst, 
  isLast 
}: StepResumeUploadProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    hasResume: data.resume.hasResume || false,
    resumeUrl: data.resume.resumeUrl || ""
  })
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateData("resume", formData)
    onNext()
  }

  const handleSkip = () => {
    updateData("resume", { hasResume: false })
    onNext()
  }

  const handleUploadComplete = (res: any[]) => {
    if (res && res.length > 0) {
      const uploadedFile = res[0]
      setFormData({
        hasResume: true,
        resumeUrl: uploadedFile.url
      })

      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully!",
      })
    }
  }

  const handleUploadError = (error: Error) => {
    toast({
      title: "Upload Failed",
      description: error.message || "There was an error uploading your resume. Please try again.",
      variant: "destructive"
    })
  }

  const removeFile = () => {
    setFormData({ hasResume: false, resumeUrl: "" })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          Upload Your Resume
        </h3>
        <p className="text-muted-foreground">
          Adding your resume helps employers learn more about your experience. This step is optional.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {!formData.hasResume ? (
            <div className="space-y-4">
              <UploadDropzone
                endpoint="resumeUploader"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadBegin={(name) => {
                  console.log('Upload began for file:', name);
                }}
                onUploadProgress={(progress) => {
                  console.log('Upload progress:', progress);
                }}
              />
              <p className="text-center text-xs text-muted-foreground">
                PDF only · Max size 4MB · 1 file
              </p>
            </div>
          ) : (
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Resume uploaded successfully!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Your resume is ready to be shared with employers.
                      </p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="font-medium mb-2">Why upload a resume?</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Employers can better understand your experience</li>
            <li>• Faster application process for future jobs</li>
            <li>• AI can better match you with relevant positions</li>
            <li>• You can always update or remove it later</li>
          </ul>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={handleSkip}>
              Skip for Now
            </Button>
            <Button type="submit" disabled={!formData.hasResume}>
              Continue
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  )
}
