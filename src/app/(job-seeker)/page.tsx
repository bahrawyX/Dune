import React from 'react'
import JobListingItems from './_shared/JobListingItems'

const HomePage = ({searchParams}:{searchParams: Promise<Record<string,string>>}) => {

  return (
    <div className='m-4 '>
      <JobListingItems  searchParams={searchParams}/>
    </div>
  )
}

export default HomePage;