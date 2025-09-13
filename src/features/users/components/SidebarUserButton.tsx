import React, { Suspense } from 'react'
import { SidebarUserButtonClient } from './_SidebarUserButtonClient'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { LogInIcon } from 'lucide-react'
import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'

const SidebarUserButton = () => {
  return (
    <Suspense><SidebarUserSuspense /></Suspense>
  )
}

export default SidebarUserButton

async function SidebarUserSuspense() {
  const {userId, user} = await getCurrentUser({allData : true});
  console.log('SidebarUserSuspense - userId:', userId, 'user:', user?.name);
  
  if (user == null) {
    // Fallback: fetch directly from Clerk if DB user not yet created (e.g., webhook delay)
    if (userId) {
      const clerkUser = await currentUser()
      if (clerkUser) {
        const fallbackUser = {
          name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
          imageUrl: clerkUser.imageUrl,
          email: clerkUser.primaryEmailAddress?.emailAddress || 'unknown'
        }
        return <SidebarUserButtonClient user={fallbackUser} />
      }
    }
    return (
      <SidebarMenuButton asChild>
        <Link href="/sign-in">
          <LogInIcon className="w-4 h-4" />
          <span>Sign In</span>
        </Link>
      </SidebarMenuButton>
    )
  }

  return <SidebarUserButtonClient user={user} />
}
