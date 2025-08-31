import React, { ReactNode } from 'react'

const ClarkLayout = ({children}: {children: ReactNode}) => {
  return (
    <div className='flex h-screen w-full items-center justify-center'>
        {children}
    </div>
  )
}

export default ClarkLayout