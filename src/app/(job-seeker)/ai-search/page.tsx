import AsyncIf from '@/components/AyncIf'
import { LoadingSwap } from '@/components/LoadingSwap'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import JobListingAiSearchForm from '@/features/jobListings/components/JobListingAiSearchForm'
import { SignInButton } from '@/services/clerk/components/AuthButtons'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import { Bot, Dot, ShieldAlert } from 'lucide-react'
import React from 'react'

const AiSearchPage = () => {
  return (
    <div className='p-4 flex items-center justify-center min-h-full'>
        <Card className='max-w-4xl'>
            <AsyncIf condition={async () => {
                const {userId} = await getCurrentUser()
                return userId != null
            }} 
            loadingFallback={<LoadingSwap isLoading={true}>
                                <AiCard />
                    </LoadingSwap>} 
            otherwise={<NoPermission />}
            >
                <AiCard />
            </AsyncIf>
        </Card>
    </div>
  )
}

export default AiSearchPage

function AiCard(){
    return (
        <>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'> <Bot className='w-5 h-5 mb-[2px]' /> AI Search</CardTitle>
                <CardDescription className='text-sm text-featured tracking-[0.05em] space-grotesk'>
                    This Can Take A Few Minutes To Process , So Please Be Patient
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6 w-full' >   
                <JobListingAiSearchForm />
            </CardContent>
        </>
    )
}
function NoPermission(){
    return (
            <CardContent className='flex flex-col items-center justify-center gap-4'>
                <h2 className='text-xl font-bold flex items-center gap-2'> <ShieldAlert className='w-5 h-5 ' /> No Permission</h2>
                <p className='text-sm text-featured space-grotesk flex items-center '><Dot className='w-6 h-6 ' /> You Need To Create An Account To Use This Feature</p>
                <SignInButton />
            </CardContent>
    )
}