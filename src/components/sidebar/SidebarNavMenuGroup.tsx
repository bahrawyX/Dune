"use client"
import React, { useState, useTransition, useEffect } from 'react'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar'
import SignedOutStatus from '@/services/clerk/components/SignedOutStatus'
import { usePathname, useRouter } from 'next/navigation'
import SignedInStatus from '@/services/clerk/components/SignedInStatus'
import Link from 'next/link'
import { LoadingSpinner } from '../LoadingSpinner'

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
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

  // Reset navigation state when pathname changes
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Don't navigate if already on this page
    if (pathname === href) {
      e.preventDefault()
      return
    }

    e.preventDefault()
    setNavigatingTo(href)
    
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <SidebarGroup className={className}>  
      <SidebarMenu>
        {
          items.map((item)=>{
            const isNavigating = navigatingTo === item.href
            const html = (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton 
                isActive={pathname === item.href} 
                asChild={!isNavigating}
                className="cursor-pointer relative"
                disabled={isNavigating}
              >
                {isNavigating ? (
                  <div className='w-full flex items-center justify-center'>
                    <LoadingSpinner className="size-4" />
                  </div>
                ) : (
                  <Link href={item.href} onClick={(e) => handleClick(e, item.href)} className='w-full flex items-center'>
                    <span className='mr-2 text-featured'>{item.icon}</span>
                    <span className="mt-[1px]">{item.label}</span>
                  </Link>
                )}
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