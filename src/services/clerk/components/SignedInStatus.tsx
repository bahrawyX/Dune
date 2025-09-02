import { SignedIn } from '@clerk/nextjs'
import React, { Suspense } from 'react'

type Props = {
    children: React.ReactNode
}

const SignedInStatus = ({children}: Props) => {
  return (
    <Suspense>
        <SignedIn >
            {children}  
        </SignedIn>
    </Suspense> 
  )
}

export default SignedInStatus   