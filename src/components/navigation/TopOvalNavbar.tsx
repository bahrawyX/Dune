"use client"
import React, { ReactNode } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import Link from "next/link"

type TopOvalNavbarProps = {
  title?: string
  leftSlot?: ReactNode
  rightSlot?: ReactNode
  className?: string
}

export default function TopOvalNavbar({
  title = "Dune Inc.",
  leftSlot,
  rightSlot,
  className,
}: TopOvalNavbarProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none flex justify-center px-2 sm:px-4">
      <div
        className={cn(
          "pointer-events-auto mt-3 w-full max-w-5xl",
          "rounded-full border bg-background/60 backdrop-blur-xl",
          "border-white/20 dark:border-white/10 shadow-lg",
          "supports-[backdrop-filter]:bg-background/50",
          className
        )}
      >
        <div className="flex items-center gap-2 px-3 sm:px-4 h-12">
          <Link href="/job-seeker">
          {leftSlot ?? (
            <SidebarTrigger className="-ml-1" />
          )}
          </Link>
          <div className="flex-1 flex justify-center">
            <div className="ml-[73px] noize text-sm sm:text-base font-semibold tracking-wide select-none">
              {title}
            </div>
          </div>
          <div className="min-w-[2rem] flex items-center justify-end">
            {rightSlot}
          </div>
        </div>
      </div>
    </div>
  )
}
