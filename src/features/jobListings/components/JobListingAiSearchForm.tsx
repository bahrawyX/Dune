"use client"
import React from 'react'
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

const JobListingAiSearchForm = () => {
    const router = useRouter();
    const form =useForm({
        resolver: zodResolver(jobListingAiSearchSchema),
        defaultValues: {
            query: "",
        },
    })
    async function onSubmit(data: z.infer<typeof jobListingAiSearchSchema>) {
        const results = await getAiJobListingSearchResults(data);
        if(results.error){
            toast.error(results.message);
            return;
        }
        toast.success("Jobs Matched Your Criteria Will Be Displayed Now");
        const params = new URLSearchParams();
        results.jobIds.forEach(jobId => {
            params.append("jobIds", jobId);
        });
        router.push(`/?${params.toString()}`);
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
                        <FormControl>
                            <Textarea {...field} className='w-full min-h-32 space-grotesk focus-visible:ring-0 ' />
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