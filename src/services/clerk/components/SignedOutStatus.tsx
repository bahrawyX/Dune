import { SignedOut } from '@clerk/nextjs'
import React, { Suspense } from 'react'

type Props = {
    children: React.ReactNode
}

const SignedOutStatus = ({children}: Props) => {
  return (
    <Suspense>
        <SignedOut>
            {children}  
        </SignedOut>
    </Suspense> 
  )
}

export default SignedOutStatus