"use client"

import { useEffect, useRef } from "react"

// Performance metrics interface
interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  url: string
  metadata?: Record<string, unknown>
}

// Navigation timing metrics
interface NavigationMetrics {
  domContentLoaded: number
  loadComplete: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observer: PerformanceObserver | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.setupPerformanceObserver()
      this.trackNavigationMetrics()
      this.trackWebVitals()
    }
  }

  private setupPerformanceObserver() {
    if (!("PerformanceObserver" in window)) return

    this.observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric({
          name: entry.name,
          value: entry.duration || entry.startTime,
          timestamp: Date.now(),
          url: window.location.href,
          metadata: {
            entryType: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration
          }
        })
      })
    })

    // Observe different types of performance entries
    try {
      this.observer.observe({ entryTypes: ["navigation", "paint", "largest-contentful-paint", "first-input", "layout-shift"] })
    } catch (error) {
      console.warn("Performance observer setup failed:", error)
    }
  }

  private trackNavigationMetrics() {
    if (!("performance" in window) || !window.performance.timing) return

    window.addEventListener("load", () => {
      setTimeout(() => {
        const timing = window.performance.timing
        const navigationStart = timing.navigationStart

        const metrics = {
          domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
          loadComplete: timing.loadEventEnd - navigationStart,
          domInteractive: timing.domInteractive - navigationStart,
          domComplete: timing.domComplete - navigationStart
        }

        Object.entries(metrics).forEach(([name, value]) => {
          this.recordMetric({
            name: `navigation.${name}`,
            value,
            timestamp: Date.now(),
            url: window.location.href
          })
        })
      }, 0)
    })
  }

  private trackWebVitals() {
    // Track Core Web Vitals
    this.trackLCP()
    this.trackFID()
    this.trackCLS()
  }

  private trackLCP() {
    if (!("PerformanceObserver" in window)) return

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as PerformanceEntry
      
      this.recordMetric({
        name: "web-vitals.lcp",
        value: lastEntry.startTime,
        timestamp: Date.now(),
        url: window.location.href,
        metadata: {
          element: (lastEntry as any).element?.tagName
        }
      })
    })

    try {
      observer.observe({ entryTypes: ["largest-contentful-paint"] })
    } catch (error) {
      console.warn("LCP tracking failed:", error)
    }
  }

  private trackFID() {
    if (!("PerformanceObserver" in window)) return

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: PerformanceEntry) => {
        this.recordMetric({
          name: "web-vitals.fid",
          value: (entry as any).processingStart - entry.startTime,
          timestamp: Date.now(),
          url: window.location.href
        })
      })
    })

    try {
      observer.observe({ entryTypes: ["first-input"] })
    } catch (error) {
      console.warn("FID tracking failed:", error)
    }
  }

  private trackCLS() {
    if (!("PerformanceObserver" in window)) return

    let clsValue = 0
    let sessionValue = 0
    let sessionEntries: PerformanceEntry[] = []

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: PerformanceEntry) => {
        const clsEntry = entry as any
        if (!clsEntry.hadRecentInput) {
          const firstSessionEntry = sessionEntries[0]
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1]

          if (sessionValue && entry.startTime - (lastSessionEntry as any).startTime < 1000 &&
              entry.startTime - (firstSessionEntry as any).startTime < 5000) {
            sessionValue += clsEntry.value
            sessionEntries.push(entry)
          } else {
            sessionValue = clsEntry.value
            sessionEntries = [entry]
          }

          if (sessionValue > clsValue) {
            clsValue = sessionValue
            this.recordMetric({
              name: "web-vitals.cls",
              value: clsValue,
              timestamp: Date.now(),
              url: window.location.href
            })
          }
        }
      })
    })

    try {
      observer.observe({ entryTypes: ["layout-shift"] })
    } catch (error) {
      console.warn("CLS tracking failed:", error)
    }
  }

  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Send to analytics if threshold is met or critical metric
    const criticalMetrics = ["web-vitals.lcp", "web-vitals.fid", "web-vitals.cls", "navigation.loadComplete"]
    
    if (criticalMetrics.includes(metric.name) || this.metrics.length >= 10) {
      this.flushMetrics()
    }
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return

    const metricsToSend = [...this.metrics]
    this.metrics = []

    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventType: "performance",
          metadata: {
            metrics: metricsToSend,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            connectionType: (navigator as any).connection?.effectiveType || "unknown",
            deviceMemory: (navigator as any).deviceMemory || "unknown"
          }
        })
      })
    } catch (error) {
      console.error("Failed to send performance metrics:", error)
      // Re-add metrics back to queue for retry
      this.metrics.unshift(...metricsToSend)
    }
  }

  public trackCustomMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    this.recordMetric({
      name: `custom.${name}`,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      metadata
    })
  }

  public startTimer(name: string): () => void {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      this.trackCustomMetric(name, endTime - startTime, {
        startTime,
        endTime
      })
    }
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.flushMetrics()
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor && typeof window !== "undefined") {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor!
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = useRef<PerformanceMonitor | null>(null)

  useEffect(() => {
    monitor.current = getPerformanceMonitor()

    return () => {
      // Don't destroy the singleton, just clean up the ref
      monitor.current = null
    }
  }, [])

  const trackCustomMetric = (name: string, value: number, metadata?: Record<string, unknown>) => {
    monitor.current?.trackCustomMetric(name, value, metadata)
  }

  const startTimer = (name: string) => {
    return monitor.current?.startTimer(name) || (() => {})
  }

  return {
    trackCustomMetric,
    startTimer
  }
}

// Database query performance tracker
export class DatabaseQueryTracker {
  private static instance: DatabaseQueryTracker
  private queryMetrics: Array<{
    query: string
    duration: number
    timestamp: number
    success: boolean
    error?: string
  }> = []

  static getInstance(): DatabaseQueryTracker {
    if (!DatabaseQueryTracker.instance) {
      DatabaseQueryTracker.instance = new DatabaseQueryTracker()
    }
    return DatabaseQueryTracker.instance
  }

  trackQuery<T>(
    queryName: string,
    queryPromise: Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    
    return queryPromise
      .then(result => {
        const duration = performance.now() - startTime
        this.recordQuery(queryName, duration, true)
        return result
      })
      .catch(error => {
        const duration = performance.now() - startTime
        this.recordQuery(queryName, duration, false, error.message)
        throw error
      })
  }

  private recordQuery(query: string, duration: number, success: boolean, error?: string) {
    this.queryMetrics.push({
      query,
      duration,
      timestamp: Date.now(),
      success,
      error
    })

    // Flush metrics if we have enough or if there's an error
    if (this.queryMetrics.length >= 5 || !success) {
      this.flushQueryMetrics()
    }
  }

  private async flushQueryMetrics() {
    if (this.queryMetrics.length === 0) return

    const metricsToSend = [...this.queryMetrics]
    this.queryMetrics = []

    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          eventType: "database_performance",
          metadata: {
            queries: metricsToSend,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error("Failed to send database metrics:", error)
    }
  }
}

// Utility function to track database queries
export function trackDatabaseQuery<T>(
  queryName: string,
  queryPromise: Promise<T>
): Promise<T> {
  return DatabaseQueryTracker.getInstance().trackQuery(queryName, queryPromise)
}

// Initialize performance monitoring
export function initializePerformanceMonitoring() {
  if (typeof window !== "undefined") {
    getPerformanceMonitor()
  }
}