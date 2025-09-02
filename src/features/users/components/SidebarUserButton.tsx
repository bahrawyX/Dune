import { auth, currentUser } from '@clerk/nextjs/server'
import React, { Suspense } from 'react'
import { SidebarUserButtonClient } from './_SidebarUserButtonClient'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import SignedOutStatus from '@/services/clerk/components/SignedOutStatus'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { LogOutIcon } from 'lucide-react'

type Props = {}

const SidebarUserButton = (props: Props) => {
  return (
    <Suspense><SidebarUserSuspense /></Suspense>
  )
}

export default SidebarUserButton

async function SidebarUserSuspense() {
  const {user} = await getCurrentUser({allData : true});
  if (user == null){
    return (
      <SignedOutStatus>
        <SidebarMenuButton>
          <LogOutIcon className="w-4 h-4" />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignedOutStatus>
    )
  }

    return <SidebarUserButtonClient user={user} />
  }
