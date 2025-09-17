"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Log error to our analytics system
    this.logError(error, errorInfo)

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventType: "error",
          metadata: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        })
      })
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="max-w-lg mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Something went wrong
            </CardTitle>
            <CardDescription>
              An unexpected error occurred. You can try refreshing the page or contact support if the problem persists.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="font-medium text-red-800">Error: {this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-32">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={this.handleRetry} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} size="sm">
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

// Hook for manual error reporting
export function useErrorReporting() {
  const reportError = async (error: Error | string, context?: Record<string, unknown>) => {
    const errorObj = typeof error === "string" ? new Error(error) : error

    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventType: "error",
          metadata: {
            message: errorObj.message,
            stack: errorObj.stack,
            context,
            manual: true,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        })
      })
    } catch (loggingError) {
      console.error("Failed to report error:", loggingError)
    }
  }

  return { reportError }
}

// Global error handler for unhandled errors
export function setupGlobalErrorHandling() {
  if (typeof window === "undefined") return

  window.addEventListener("error", (event) => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventType: "error",
        metadata: {
          message: event.error?.message || event.message,
          stack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          global: true,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      })
    }).catch(console.error)
  })

  window.addEventListener("unhandledrejection", (event) => {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        eventType: "error",
        metadata: {
          message: event.reason?.message || "Unhandled Promise Rejection",
          stack: event.reason?.stack,
          reason: String(event.reason),
          promise: true,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      })
    }).catch(console.error)
  })
}