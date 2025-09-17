"use client"

import { createContext, useContext, useEffect, ReactNode } from "react"
import { initializePerformanceMonitoring, getPerformanceMonitor } from "@/lib/performance"

interface PerformanceContextType {
  trackCustomMetric: (name: string, value: number, metadata?: Record<string, any>) => void
  startTimer: (name: string) => () => void
}

const PerformanceContext = createContext<PerformanceContextType | null>(null)

interface PerformanceMonitoringProviderProps {
  children: ReactNode
}

export function PerformanceMonitoringProvider({ children }: PerformanceMonitoringProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring on mount
    initializePerformanceMonitoring()
  }, [])

  const trackCustomMetric = (name: string, value: number, metadata?: Record<string, any>) => {
    const monitor = getPerformanceMonitor()
    monitor?.trackCustomMetric(name, value, metadata)
  }

  const startTimer = (name: string) => {
    const monitor = getPerformanceMonitor()
    return monitor?.startTimer(name) || (() => {})
  }

  const value: PerformanceContextType = {
    trackCustomMetric,
    startTimer
  }

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformanceContext(): PerformanceContextType {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error("usePerformanceContext must be used within a PerformanceMonitoringProvider")
  }
  return context
}