import SidebarNavMenuGroup from '@/components/sidebar/SidebarNavMenuGroup'
import { BellRingIcon,  FileUserIcon } from 'lucide-react'
import React from 'react'

const UserSettingdSidebar = () => {
  return (
    <SidebarNavMenuGroup items={[
        {href:"/user-settings/notifications", icon: <BellRingIcon className="w-4 h-4" />, label: "Notifications"},
        {href:"/user-settings/resume", icon: <FileUserIcon className="w-4 h-4" />, label: "Resume"}
    ]}
    />
  )
}

export default UserSettingdSidebar