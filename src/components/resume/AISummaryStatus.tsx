"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer"

interface AISummaryStatusProps {
  userId: string
  initialSummary?: string | null
  resumeUpdatedAt?: Date | null
}

interface ResumeStatus {
  aiSummary: string | null
  updatedAt: Date | null
}

export function AISummaryStatus({ userId, initialSummary, resumeUpdatedAt }: AISummaryStatusProps) {
  const [summary, setSummary] = useState<string | null>(initialSummary || null)
  const [isProcessing, setIsProcessing] = useState(!initialSummary)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(resumeUpdatedAt || null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If we already have a summary, don't start polling
    if (initialSummary) {
      setIsProcessing(false)
      return
    }

    // Start polling for AI summary completion
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/resume/status?userId=${encodeURIComponent(userId)}`)
        
        if (!response.ok) {
          throw new Error('Failed to check resume status')
        }

        const data: ResumeStatus = await response.json()
        
        if (data.aiSummary && data.aiSummary !== summary) {
          setSummary(data.aiSummary)
          setLastUpdated(data.updatedAt ? new Date(data.updatedAt) : null)
          setIsProcessing(false)
          setError(null)
          // Stop polling once we have the summary
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error('Error polling for AI summary:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        // Don't stop polling on error, just log it
      }
    }, 3000) // Poll every 3 seconds

    // Stop polling after 5 minutes to avoid infinite polling
    const timeout = setTimeout(() => {
      clearInterval(pollInterval)
      if (isProcessing) {
        setIsProcessing(false)
        setError('AI summary generation timed out. Please try re-uploading your resume.')
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeout)
    }
  }, [userId, initialSummary, summary, isProcessing])

  if (isProcessing) {
    return (
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              AI Summary
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              Processing...
            </Badge>
          </div>
          <CardDescription className="text-sm text-blue-700 dark:text-blue-300">
            Our AI is analyzing your resume to create a professional summary. This usually takes 30-60 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Analyzing resume content...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              AI Summary
            </CardTitle>
            <Badge variant="destructive">
              Error
            </Badge>
          </div>
          <CardDescription className="text-sm text-red-700 dark:text-red-300">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!summary) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-lg flex items-center gap-2 justify-center">
            <FileText className="w-4 h-4" />
            AI Summary
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Once you upload your resume, our AI will analyze it and create a professional summary for employers to quickly understand your qualifications and experience.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-4 h-4" />
            AI Summary
          </CardTitle>
          <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">
          This summary is generated after your upload. {lastUpdated ? `Last updated ${lastUpdated.toLocaleString()}.` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <MarkdownRenderer source={summary} />
      </CardContent>
    </Card>
  )
}