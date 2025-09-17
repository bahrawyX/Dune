"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ExperienceLevel,
  experienceLevels,
  JobListingType,
  jobListingTypes,
  LocationRequirement,
  locationRequirements,
} from "@/app/drizzle/schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  formatExperienceLevel,
  formatJobType,
  formatLocationRequirement,
} from "../lib/formatters"
import { StateSelectItems } from "./StateSelectItems"
import { Button } from "@/components/ui/button"
import { LoadingSwap } from "@/components/LoadingSwap"
import { useSidebar } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import { SkillsInput } from "./SkillsInput"
import { Switch } from "@/components/ui/switch"

const ANY_VALUE = "any"

const jobListingFilterSchema = z.object({
  title: z.string().optional(),
  city: z.string().optional(),
  stateAbbreviation: z.string().or(z.literal(ANY_VALUE)).optional(),
  experienceLevel: z.enum(experienceLevels).or(z.literal(ANY_VALUE)).optional(),
  type: z.enum(jobListingTypes).or(z.literal(ANY_VALUE)).optional(),
  locationRequirement: z
    .enum(locationRequirements)
    .or(z.literal(ANY_VALUE))
    .optional(),
  minSalary: z.string().optional(),
  maxSalary: z.string().optional(),
  skills: z.array(z.string()).optional(),
  datePosted: z.string().or(z.literal(ANY_VALUE)).optional(),
  remoteOnly: z.boolean().optional(),
})

export function JobListingFilterForm() {
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const form = useForm({
    resolver: zodResolver(jobListingFilterSchema),
    defaultValues: {
      title: searchParams.get("title") ?? "",
      city: searchParams.get("city") ?? "",
      locationRequirement:
        (searchParams.get("locationRequirement") as LocationRequirement) ??
        ANY_VALUE,
      stateAbbreviation: searchParams.get("state") ?? ANY_VALUE,
      experienceLevel:
        (searchParams.get("experience") as ExperienceLevel) ?? ANY_VALUE,
      type: (searchParams.get("type") as JobListingType) ?? ANY_VALUE,
      minSalary: searchParams.get("minSalary") ?? "",
      maxSalary: searchParams.get("maxSalary") ?? "",
      skills: searchParams.get("skills")?.split(",").filter(Boolean) ?? [],
      datePosted: searchParams.get("datePosted") ?? ANY_VALUE,
      remoteOnly: searchParams.get("remoteOnly") === "true",
    },
  })

  useEffect(() => {
    // Simulate form initialization loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])

  function onSubmit(data: z.infer<typeof jobListingFilterSchema>) {
    const newParams = new URLSearchParams()

    if (data.city) newParams.set("city", data.city)
    if (data.stateAbbreviation && data.stateAbbreviation !== ANY_VALUE) {
      newParams.set("state", data.stateAbbreviation)
    }
    if (data.title) newParams.set("title", data.title)
    if (data.experienceLevel && data.experienceLevel !== ANY_VALUE) {
      newParams.set("experience", data.experienceLevel)
    }
    if (data.type && data.type !== ANY_VALUE) {
      newParams.set("type", data.type)
    }
    if (data.locationRequirement && data.locationRequirement !== ANY_VALUE) {
      newParams.set("locationRequirement", data.locationRequirement)
    }
    if (data.minSalary && data.minSalary.trim() !== "") {
      newParams.set("minSalary", data.minSalary)
    }
    if (data.maxSalary && data.maxSalary.trim() !== "") {
      newParams.set("maxSalary", data.maxSalary)
    }
    if (data.skills && data.skills.length > 0) {
      newParams.set("skills", data.skills.join(","))
    }
    if (data.datePosted && data.datePosted !== ANY_VALUE) {
      newParams.set("datePosted", data.datePosted)
    }
    if (data.remoteOnly) {
      newParams.set("remoteOnly", "true")
    }

    router.push(`${pathname}?${newParams.toString()}`)
    setOpenMobile(false)
  }

  if (isLoading) {
    return <JobListingFilterFormSkeleton />
  }

  return (
    <Form {...form} >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 group-data-[collapsible=icon]:hidden">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
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
        <FormField
          name="city"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
                  <StateSelectItems />
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
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
                  <SelectItem value={ANY_VALUE}>Any</SelectItem>
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
        <div className="space-y-2">
          <FormLabel>Salary Range (Annual)</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            <FormField
              name="minSalary"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      placeholder="Min ($)" 
                      min="0"
                      step="1000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="maxSalary"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      placeholder="Max ($)" 
                      min="0"
                      step="1000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <FormField
          name="skills"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <SkillsInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Filter by skills..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="datePosted"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Posted</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ANY_VALUE}>Any Time</SelectItem>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="3">Last 3 days</SelectItem>
                  <SelectItem value="7">Last week</SelectItem>
                  <SelectItem value="14">Last 2 weeks</SelectItem>
                  <SelectItem value="30">Last month</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="remoteOnly"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Remote Jobs Only</FormLabel>
                <div className="text-[0.8rem] text-muted-foreground">
                  Show only remote and hybrid positions
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Filter
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  )
}

function JobListingFilterFormSkeleton() {
  return (
    <div className="space-y-6 group-data-[collapsible=icon]:hidden">
      {/* Job Title field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Location Requirement field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* City field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* State field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Job Type field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Experience Level field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Salary Range field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      {/* Skills field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Date Posted field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Remote Only toggle skeleton */}
      <div className="rounded-lg border p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      </div>
      
      {/* Submit button skeleton */}
      <Skeleton className="h-10 w-full" />
    </div>
  )
}