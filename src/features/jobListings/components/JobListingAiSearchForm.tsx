"use client"
import React, { useEffect, useMemo } from 'react'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { jobListingAiSearchSchema } from '../action/schema'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { LoadingSwap } from '@/components/LoadingSwap'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getAiJobListingSearchResults } from '../action/actions'
import { useRouter } from 'next/navigation'

type Props = {
    initialQuery?: string
    suggestedPrompts?: string[]
    suggestedSkills?: string[]
}

const RECENT_KEY = "ai_search_recent"

const JobListingAiSearchForm = ({ initialQuery, suggestedPrompts = [], suggestedSkills = [] }: Props) => {
    const router = useRouter();
    const form =useForm({
        resolver: zodResolver(jobListingAiSearchSchema),
        defaultValues: {
                        query: initialQuery ?? "",
        },
    })
        useEffect(() => {
            if (initialQuery) {
                form.setValue("query", initialQuery)
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [initialQuery])

        const recents = useMemo<string[]>(() => {
            if (typeof window === 'undefined') return []
            try {
                const raw = localStorage.getItem(RECENT_KEY)
                if (!raw) return []
                const arr = JSON.parse(raw) as string[]
                return Array.isArray(arr) ? arr.slice(0, 5) : []
            } catch {
                return []
            }
        }, [initialQuery])

    async function onSubmit(data: z.infer<typeof jobListingAiSearchSchema>) {
        const results = await getAiJobListingSearchResults(data);
        if(results.error){
            toast.error(results.message);
            return;
        }
                try {
                    const existing: string[] = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
                    const next = [data.query, ...existing.filter(q => q !== data.query)]
                    localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, 10)))
                } catch {}
        toast.success("Jobs Matched Your Criteria Will Be Displayed Now");
        const params = new URLSearchParams();
        results.jobIds.forEach(jobId => {
            params.append("jobIds", jobId);
        });
        router.push(`/job-seeker?${params.toString()}`);
    }
  return (
    <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                
                name="query"
                control={form.control}
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Query</FormLabel>
                                                {suggestedSkills.length > 0 && (
                                                    <div className='flex flex-wrap gap-2 mb-2'>
                                                        {suggestedSkills.map((skill) => (
                                                            <Button key={skill} type='button' variant='secondary' size='sm' className='h-7'
                                                                onClick={() => form.setValue('query', (form.getValues('query') ? form.getValues('query') + ' ' : '') + skill)}>
                                                                {skill}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                )}
                        <FormControl>
                                                        <Textarea {...field} placeholder='E.g. Senior React engineer, remote-first teams, TypeScript/Node backend exposure, growth-stage startups.' className='w-full min-h-32 space-grotesk focus-visible:ring-0 ' />
                        </FormControl>
                        <FormDescription className='text-sm text-muted-foreground tracking-[0.05em] space-grotesk'>
                            Provide A Detailed Description Of Your Skills/Experience As Well As What You Are Looking For In A Job , The More Detailed The Better Results You Will Get
                        </FormDescription>
                        <FormMessage />

                    </FormItem>
                )}
            /> 

            <Button disabled={form.formState.isSubmitting} type='submit' className='w-full'>   
                <LoadingSwap isLoading={form.formState.isSubmitting}>
                    Search
                </LoadingSwap>
            </Button>
        </form>
    </Form>
  )
}

export default JobListingAiSearchForm