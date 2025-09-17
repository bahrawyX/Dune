import SidebarNavMenuGroup from '@/components/sidebar/SidebarNavMenuGroup'
import { BellRingIcon,  FileUserIcon } from 'lucide-react'
import React from 'react'

const UserSettingsSidebar = () => {
  return (
    <SidebarNavMenuGroup items={[
        {href:"/job-seeker/user-settings/notifications", icon: <BellRingIcon className="w-4 h-4" />, label: "Notifications"},
        {href:"/job-seeker/user-settings/resume", icon: <FileUserIcon className="w-4 h-4" />, label: "Resume"}
    ]}
    />
  )
}

export default UserSettingsSidebar