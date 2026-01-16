"use client"

import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'

type Props = {
  href: string
  children: React.ReactNode
  className?: string
}

export function JobListingLink({ href, children, className }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  // Reset navigating state when pathname changes
  useEffect(() => {
    setIsNavigating(false)
  }, [pathname])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Don't navigate if clicking on interactive elements like buttons
    const target = e.target as HTMLElement
    const clickedButton = target.closest('button')
    
    // Only prevent navigation if we clicked a button (not the link itself)
    if (clickedButton) {
      e.preventDefault()
      return
    }
    
    // Extract the path without query params and check if we're already on this page
    const hrefPath = href.split('?')[0]
    const currentPath = pathname.split('?')[0]
    
    // Don't navigate if we're already on this job listing page
    if (hrefPath === currentPath || pathname.includes(hrefPath)) {
      e.preventDefault()
      return
    }
    
    e.preventDefault()
    setIsNavigating(true)
    
    startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  if (isNavigating) {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <LoadingSpinner className="size-8" />
        </div>
      </div>
    )
  }

  return (
    <Link 
      href={href} 
      onClick={handleClick} 
      className={className}
      prefetch={true}
      scroll={false}
    >
      {children}
    </Link>
  )
}
