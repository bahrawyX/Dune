import AsyncIf from '@/components/AyncIf'
import { LoadingSwap } from '@/components/LoadingSwap'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import JobListingAiSearchForm from '@/features/jobListings/components/JobListingAiSearchForm'
import { SignInButton } from '@/services/clerk/components/AuthButtons'
import { getCurrentUser } from '@/services/clerk/lib/getCurrentAuth'
import { Bot, Dot, Lightbulb, ShieldAlert, Sparkles, Timer } from 'lucide-react'
import React from 'react'

const AiSearchPage = ({ searchParams }: { searchParams?: { preset?: string } }) => {
  return (
    <div className='p-4 flex items-center justify-center min-h-full'>
        <Card className='max-w-4xl'>
            <AsyncIf condition={async () => {
                const {userId} = await getCurrentUser()
                return userId != null
            }} 
            loadingFallback={<LoadingSwap isLoading={true}>
                                                                <AiCard initialQuery={searchParams?.preset} />
                    </LoadingSwap>} 
            otherwise={<NoPermission />}
            >
                                <AiCard initialQuery={searchParams?.preset} />
            </AsyncIf>
        </Card>
    </div>
  )
}

export default AiSearchPage

function AiCard({ initialQuery }: { initialQuery?: string }){
    const suggestedPrompts = [
        "Senior React engineer with 5+ years looking for remote roles building dashboards and design systems.",
        "Early career data analyst seeking SQL/Python roles in fintech with mentorship.",
        "AI/ML engineer focused on RAG and vector search, prefers startups with research time.",
    ]
    const suggestedSkills = [
        'React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind', 'Python', 'SQL', 'Docker', 'AWS'
    ]
    return (
        <>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'> <Bot className='w-5 h-5 mb-[2px]' /> AI Search</CardTitle>
                <CardDescription className='text-sm text-featured tracking-[0.05em] space-grotesk flex items-center gap-2'>
                    <Timer className='w-4 h-4' /> This can take a minute — thanks for your patience.
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6 w-full' >   
                <div className='rounded-md border bg-muted/30 p-3 text-xs flex items-center gap-2'>
                    <Lightbulb className='w-4 h-4 text-yellow-400' />
                    Tip: Be specific about your skills, seniority, location, and what you want in your next role.
                </div>
                <JobListingAiSearchForm initialQuery={initialQuery} suggestedPrompts={suggestedPrompts} suggestedSkills={suggestedSkills} />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    <div className='rounded-lg border p-3'>
                        <div className='flex items-center gap-2 text-sm font-medium'><Sparkles className='w-4 h-4'/> Great prompts</div>
                        <p className='text-xs text-muted-foreground mt-1'>Use the examples above or add your own flavor.</p>
                    </div>
                    <div className='rounded-lg border p-3'>
                        <div className='flex items-center gap-2 text-sm font-medium'><Timer className='w-4 h-4'/> Results open in Job Board</div>
                        <p className='text-xs text-muted-foreground mt-1'>We’ll filter the job board with your matches.</p>
                    </div>
                </div>
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