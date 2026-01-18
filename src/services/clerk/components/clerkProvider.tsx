'use client'
import React, { Suspense } from 'react'
import { ClerkProvider as OriginalClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import useIsDarkMode from '@/hooks/useIsDarkMode'
type Props = {
    children: React.ReactNode
}

const ClerkProvider = ({ children }: Props) => {
    const isDarkMode = useIsDarkMode()
  return (
    <Suspense>
        <OriginalClerkProvider 
            appearance={isDarkMode ? {baseTheme: [dark]} : undefined}
            afterSignOutUrl="/"
            signInFallbackRedirectUrl="/getting-ready"
            signUpFallbackRedirectUrl="/getting-ready"
        >
            {children}
        </OriginalClerkProvider>
    </Suspense>
  )
}

export default ClerkProvider