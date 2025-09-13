import SidebarNavMenuGroup from '@/components/sidebar/SidebarNavMenuGroup'
import { BellRingIcon,  FileUserIcon } from 'lucide-react'
import React from 'react'

const UserSettingdSidebar = () => {
  return (
    <SidebarNavMenuGroup items={[
        {href:"/user-settings/notifications", icon: <BellRingIcon />, label: "Notifications"},
        {href:"/user-settings/resume", icon: <FileUserIcon />, label: "Resume"}
    ]}
    />
  )
}

export default UserSettingdSidebar