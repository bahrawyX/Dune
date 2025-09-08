import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import JobListingForm from '@/features/jobListings/components/JobListingForm'
import React from 'react'

const NewJobListingPage = () => {
  return (
    <div className='max-w-5xl mx-auto p-4'>
      <h1 className='text-2xl font-bold my-2'>New Job Listing</h1>
      <p className='text-sm text-muted-foreground space-grotesk my-3'>Create a new job listing for your organization but keep in mind that it will not be published this is just a draft.</p>
      <Card>
        <CardContent>
          <JobListingForm />
        </CardContent>
      </Card>        
    </div>
  )
}

export default NewJobListingPage