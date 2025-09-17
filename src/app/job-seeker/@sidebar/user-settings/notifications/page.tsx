import UserSettingsSidebar from '@/app/job-seeker/_shared/UserSettingdSidebar'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar'
import { Bell, Clock, Sparkles } from 'lucide-react'
import React from 'react'

const UserNotificationPage = () => {
  return (
    <>
      <UserSettingsSidebar />
      <SidebarGroup>
        <SidebarGroupLabel className='flex items-center gap-2'><Bell className='w-4 h-4'/> Email tips</SidebarGroupLabel>
        <SidebarGroupContent className='text-xs text-muted-foreground space-y-3'>
          <div className='flex items-start gap-2'>
            <Sparkles className='w-3.5 h-3.5 mt-0.5'/>
            <p>Be specific in your prompt: skills, seniority, location, and salary preferences.</p>
          </div>
          <div className='flex items-start gap-2'>
            <Clock className='w-3.5 h-3.5 mt-0.5'/> 
            <p>Digests are sent once per day. You can disable at any time.</p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

export default UserNotificationPage