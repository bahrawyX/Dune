import UserSettingsSidebar from '@/app/job-seeker/_shared/UserSettingdSidebar'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar'
import { FileText, Info } from 'lucide-react'
import React from 'react'

const UserResumePage = () => {
  return (
    <>
      <UserSettingsSidebar />
      <SidebarGroup>
        <SidebarGroupLabel className='flex items-center gap-2'><FileText className='w-4 h-4'/> Upload notes</SidebarGroupLabel>
        <SidebarGroupContent className='text-xs text-muted-foreground space-y-2'>
          <p>PDF only • Max 8MB • One file per upload.</p>
          <p>Uploading again replaces your current resume.</p>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

export default UserResumePage