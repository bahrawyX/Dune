"use client"
import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { JobListingSchema } from '../action/schema';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import z from 'zod';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { useForm } from 'react-hook-form';
import { experienceLevels, jobListingTypes, JobListingTable, locationRequirements, wageIntervals } from '@/app/drizzle/schema';
import { formatExperienceLevel, formatJobType, formatLocationRequirement, formatWageInterval } from '../lib/formatters';
import { StateSelectItems } from './StateSelectItems';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { Button } from '@/components/ui/button';
import { LoadingSwap } from '@/components/LoadingSwap';
import { createJobListing, updateJobListing } from '../action/actions';
import { toast } from 'sonner';
import { SkillsInput } from './SkillsInput';

const NONE_SELECT_VALUE = "none";
const JobListingForm = ({jobListing}: {jobListing?: Pick<typeof JobListingTable.$inferSelect, "title" | "description" | "skills" | "wage" | "experienceLevel" | "locationRequirement" | "type" | "wageInterval" | "stateAbbreviation" | "city" | "status" | "isFeatured" | "id">}) => {
    const form = useForm({
        resolver: zodResolver(JobListingSchema),
        defaultValues:{
            title: jobListing?.title ?? "",
            description: jobListing?.description ?? "",
            skills: jobListing?.skills ?? [],
            wage: jobListing?.wage ?? null,
            experienceLevel: jobListing?.experienceLevel ?? "junior",
            locationRequirement: jobListing?.locationRequirement ?? "on-site",
            type: jobListing?.type ?? "full-time",
            wageInterval: jobListing?.wageInterval ?? 'yearly',
            stateAbbreviation: jobListing?.stateAbbreviation ?? null,
            city: jobListing?.city ?? "",
            status: jobListing?.status ?? "draft",
            isFeatured: jobListing?.isFeatured ?? false,
        }
    });
    async function onSubmit(data: z.infer<typeof JobListingSchema>) {
       const action = jobListing ? updateJobListing.bind(null, jobListing.id) : createJobListing;
       try {
         const res = await action(data);
         if (res?.error) {
           toast.error(res.message);
         } else if (res) {
           // This shouldn't happen if redirect works, but just in case
           toast.success(jobListing ? "Job listing updated successfully!" : "Job listing created successfully!");
         }
         // If no res is returned, it means redirect was called successfully
       } catch (error) {
         // Check if this is a Next.js redirect error (which is expected)
        if (error && typeof error === 'object' && 'digest' in error && 
            (error as Record<string, unknown>).digest && 
            String((error as Record<string, unknown>).digest).includes('NEXT_REDIRECT')) {
           // This is a redirect, which is expected - don't show error
           return;
         }
         
         // Only show error toast for actual errors
         console.error('Unexpected error:', error);
         toast.error('An unexpected error occurred');
       }
    }

  return (
    <Form {...form}>
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6 @container"
    >
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder='Ex: Front-End Developer' className='space-grotesk focus-visible:ring-0' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="wage"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wage</FormLabel>
              <div className="flex">
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Ex: 1000'
                    type="number"
                    value={field.value ?? ""}
                    className="rounded-r-none no-arrows space-grotesk focus-visible:ring-0"
                    onChange={e =>
                      field.onChange(
                        isNaN(e.target.valueAsNumber)
                          ? null
                          : e.target.valueAsNumber
                      )
                    }
                  />
                </FormControl>
                <FormField
                  name="wageInterval"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={val => field.onChange(val ?? null)}
                      >
                        <FormControl>
                          <SelectTrigger className="rounded-l-none focus-visible:ring-0">
                            / <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wageIntervals.map(interval => (
                            <SelectItem key={interval} value={interval}>
                              {formatWageInterval(interval)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
        <div className="grid grid-cols-1 @xs:grid-cols-2 gap-x-2 gap-y-6 items-start">
          <FormField
            name="city"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input className='space-grotesk focus-visible:ring-0' placeholder='Ex: Canada' {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
            name="stateAbbreviation"
            control={form.control}
            render={({ field }) => (
            <FormItem>
                <FormLabel>State</FormLabel>
                <Select
                value={field.value ?? ""}
                onValueChange={val => field.onChange(val === NONE_SELECT_VALUE ? null : val)}
                >
                <FormControl>
                    <SelectTrigger className="w-full focus-visible:ring-0">
                     <SelectValue />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {field.value != null && (

                    <SelectItem  value={NONE_SELECT_VALUE}  className='text-muted-foreground'>Select State</SelectItem>
                    )}
                    <StateSelectItems />
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
                />
        </div>
        <FormField
            name="locationRequirement"
            control={form.control}
            render={({ field }) => (
            <FormItem>
                <FormLabel>Location Requirement</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                    <SelectTrigger className="w-full">
                     <SelectValue />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {locationRequirements.map(lr => (
                        <SelectItem key={lr} value={lr}>
                            {formatLocationRequirement(lr)}
                        </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
                />
    </div>
    <div className="grid grid-cols-1 @md:grid-cols-2 gap-x-4 gap-y-6 items-start">
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jobListingTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {formatJobType(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="experienceLevel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {experienceLevels.map(experience => (
                    <SelectItem key={experience} value={experience}>
                      {formatExperienceLevel(experience)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        name="skills"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Skills</FormLabel>
            <FormControl>
              <SkillsInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Add required skills (e.g., React, TypeScript, Node.js)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="description"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <MarkdownEditor 
                markdown={field.value} 
                onChange={field.onChange}
                onBlur={field.onBlur}
                className="focus-visible:ring-0" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

        
      
      

      <Button
        disabled={form.formState.isSubmitting}
        type="submit"
        className="w-full"
      >
        <LoadingSwap isLoading={form.formState.isSubmitting}>
          {jobListing ? "Update Job Listing" : "Create Job Listing"}
        </LoadingSwap>
      </Button> 
      
    </form>
  </Form>
  )
}

export default JobListingForm