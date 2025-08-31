import { auth, currentUser } from '@clerk/nextjs/server'
import React, { Suspense } from 'react'
import { SidebarUserButtonClient } from './_SidebarUserButtonClient'

type Props = {}

const SidebarUserButton = (props: Props) => {
  return (
    <Suspense><SidebarUserSuspense /></Suspense>
  )
}

export default SidebarUserButton

async function SidebarUserSuspense() {
  const {userId} = await auth();

  return <SidebarUserButtonClient user={{email:"abbahrwy@gmail.com",name:"Abdelrahman Bahrawy" ,"imageUrl":"https://github.com/shadcn.png"}} />
}
