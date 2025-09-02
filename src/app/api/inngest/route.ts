import { inngest } from "@/services/inngest/client"
  import { clerkCreateUser, clerkUpdateUser, clerkDeleteUser, onClerk } from "@/services/inngest/functions/clerk"
import { serve } from "inngest/next"


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkCreateUser,
    clerkUpdateUser,
    clerkDeleteUser,
  ],
})   