"use client"

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Brain, Bookmark, BarChart3, Briefcase, Menu, Loader2, Bell, FileUser } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

export default function JobSeekerNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toggleSidebar } = useSidebar()
  const [isPending, startTransition] = useTransition()
  const [loadingPath, setLoadingPath] = useState<string | null>(null)

  const navItems = [
    { href: '/job-seeker', label: 'Jobs', icon: Briefcase },
    { href: '/job-seeker/ai-search', label: 'AI Search', icon: Brain },
    { href: '/job-seeker/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/job-seeker/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/job-seeker/user-settings/resume', label: 'Resume', icon: FileUser },
    { href: '/job-seeker/user-settings/notifications', label: 'Notifications', icon: Bell },
  ]

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (pathname === href) return
    
    setLoadingPath(href)
    startTransition(() => {
      router.push(href)
      // Clear loading state after navigation
      setTimeout(() => setLoadingPath(null), 500)
    })
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none flex justify-center px-2 sm:px-4">
      <nav
        className={cn(
          "pointer-events-auto mt-3 w-full max-w-4xl",
          "rounded-full border bg-background/60 backdrop-blur-xl",
          "border-white/20 dark:border-white/10 shadow-lg",
          "supports-[backdrop-filter]:bg-background/50",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 h-12">
          <Button 
            variant="ghost" 
            size="icon" 
            className="-ml-1 flex-shrink-0 h-8 w-8"
            onClick={toggleSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const isLoading = loadingPath === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavigation(item.href, e)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                    "transition-all duration-200 ease-in-out",
                    "hover:bg-accent hover:text-accent-foreground hover:scale-105",
                    "active:scale-95",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground",
                    isLoading && "opacity-70"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>
          
          <div className="w-8 flex-shrink-0" />
        </div>
      </nav>
    </div>
  )
}
