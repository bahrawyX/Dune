import React from 'react'

const JobListingPage = ({
    params: _params,
    searchParams: _searchParams,
}:{
    params:Promise<{jobListingId:string}>
    searchParams:Promise<Record<string,string | string[]>>
}) => {
  return (
    <div>JobListingPage</div>
  )
}

export default JobListingPage