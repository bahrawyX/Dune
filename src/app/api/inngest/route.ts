import { inngest } from "@/services/inngest/client"
  import { clerkCreateUser, clerkUpdateUser, clerkDeleteUser, clerkCreateOrganization, clerkUpdateOrganization, clerkDeleteOrganization } from "@/services/inngest/functions/clerk"
import { createAiSummaryOfUploadedResume } from "@/services/inngest/functions/resume"
import { serve } from "inngest/next"
import { rankApplication } from "@/services/inngest/functions/JobListingApplication"


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkCreateUser,
    clerkUpdateUser,
    clerkDeleteUser,
    clerkCreateOrganization,
    clerkUpdateOrganization,
    clerkDeleteOrganization,
    createAiSummaryOfUploadedResume,
    rankApplication
  ],
})   