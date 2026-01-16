"use client"

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={`pt-20 transition-opacity duration-200 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {children}
    </div>
  )
}
