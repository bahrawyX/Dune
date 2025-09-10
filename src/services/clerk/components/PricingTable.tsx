import React from 'react'
import { PricingTable as ClerkPricingTable } from '@clerk/nextjs'
const PricingTable = () => {
  return (
    <ClerkPricingTable forOrganizations newSubscriptionRedirectUrl='/employer/pricing' />
  )
}

export default PricingTable