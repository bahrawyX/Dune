"use client"
import { Sheet } from '@/components/ui/sheet'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const ClientSheet = ({children}:{children:React.ReactNode}) => {
    const [isOpen,setIsOpen] = useState(true)
    const searchParams = useSearchParams()
    const router = useRouter()
  return (
    <Sheet modal open={isOpen} onOpenChange={open => {
      if (!open) {
        setIsOpen(false)
        router.push(`/?${searchParams.toString()}`)
      }
    }}>
      {children}
    </Sheet>
  )
}

export default ClientSheet