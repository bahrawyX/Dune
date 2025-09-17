import React from 'react'

const JobListingPage = ({
    params,
    searchParams,
}:{
    params:Promise<{jobListingId:string}>
    searchParams:Promise<Record<string,string | string[]>>
}) => {
  return (
    <div>JobListingPage</div>
  )
}

export default JobListingPage