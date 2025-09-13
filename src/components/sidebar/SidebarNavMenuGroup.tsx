"use client"
import React from 'react'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar'
import SignedOutStatus from '@/services/clerk/components/SignedOutStatus'
import { usePathname } from 'next/navigation'
import SignedInStatus from '@/services/clerk/components/SignedInStatus'
import Link from 'next/link'

const SidebarNavMenuGroup = ({items, className} : {
  items:{
    href : string ,
    icon : React.ReactNode,
    label : string,
    authStatus? : "signed-in" | "signed-out" 
  }[]
  className ?: string
}) => {
  const pathname = usePathname()
  return (
    <SidebarGroup className={className}>  
      <SidebarMenu>
        {
          items.map((item)=>{
            const html = (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton isActive={pathname === item.href} asChild className="cursor-pointer">
              <Link href={item.href} className='w-full flex items-center '>
                  <span className='mr-2 text-featured' >{item.icon}</span>
                  <span className="mt-[1px]">{item.label}</span>
              </Link>
                </SidebarMenuButton>
           </SidebarMenuItem>   
            )
            if (item.authStatus === "signed-out") {
              return (
                <SignedOutStatus key={item.href}>
                  {html}
                </SignedOutStatus>
              )
            }
            if (item.authStatus === "signed-in") {
              return (
                <SignedInStatus key={item.href}>
                  {html}
                </SignedInStatus>
              )
            }
            return html
          })
        }
        
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default SidebarNavMenuGroup