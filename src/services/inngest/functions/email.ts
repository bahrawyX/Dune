import { db } from "@/app/drizzle/db"
import { inngest } from "../client"
import { and, eq, gte } from "drizzle-orm"
import {
  JobListingApplicationTable,
  JobListingTable,
  UserNotificationSettingsTable,
} from "@/app/drizzle/schema"
import { subDays } from "date-fns"
import { GetEvents } from "inngest"
import { getMatchingJobListings } from "@/services/inngest/ai/getMatchingListings"
import { resend } from "@/services/resend/client"
import DailyJobListingEmail from "@/services/resend/components/DailyJobListing"
import { env } from "@/app/data/env/server"

export const prepareDailyUserJobListingNotifications = inngest.createFunction(
  {
    id: "prepare-daily-user-job-listing-notifications",
    name: "Prepare Daily User Job Listing Notifications",
  },
  {
    cron: "TZ=America/Chicago 0 7 * * *",
  },
  async ({ step, event }) => {
    const getUsers = step.run("get-users", async () => {
      return await db.query.UserNotificationSettingsTable.findMany({
        where: eq(UserNotificationSettingsTable.newJobEmailNotifications, true),
        columns: {
          userId: true,
          newJobEmailNotifications: true,
          aiPrompt: true,
        },
        with: {
          user: {
            columns: {
              email: true,
              name: true,
            },
          },
        },
      })
    })

    const getJobListings = step.run("get-recent-job-listings", async () => {
      return await db.query.JobListingTable.findMany({
        where: and(
          gte(
            JobListingTable.postedAt,
            subDays(new Date(event.ts ?? Date.now()), 1)
          ),
          eq(JobListingTable.status, "published")
        ),
        columns: {
          createdAt: false,
          postedAt: false,
          updatedAt: false,
          status: false,
          organizationId: false,
        },
        with: {
          organization: {
            columns: { name: true },
          },
        },
      })
    })

    const [usersNotifications, jobListings] = await Promise.all([
        getUsers,
        getJobListings,
    ])

    console.log(`Found ${usersNotifications.length} users with notifications enabled`)
    console.log(`Found ${jobListings.length} job listings`)
    
    if(usersNotifications.length === 0) {
        console.log("No users with notifications enabled - exiting")
        return { message: "No users with notifications enabled" };
    }
    
    if(jobListings.length === 0) {
        console.log("No job listings found - exiting")
        return { message: "No job listings found" };
    }

    const events = usersNotifications.map((userNotification) => ({
        name: "app/email.daily-user-job-listings" as const,
        user: {
            email: userNotification.user.email,
            name: userNotification.user.name ?? "User",
        },
        data: {
            aiPrompt: userNotification.aiPrompt,
            jobListings: jobListings.map((jobListing) => ({
                ...jobListing,
                organizationName: jobListing.organization.name,
            })),
        },
    } satisfies GetEvents<typeof inngest>["app/email.daily-user-job-listings"]
))

    console.log(`Sending ${events.length} email events`)
    await step.sendEvent("send-emails", events)
    
    return { message: `Sent ${events.length} email events successfully` };
  

})

export const sendDailyUserJobListingEmail = inngest.createFunction(
  {
    id: "send-daily-user-job-listing-email",
    name: "Send Daily User Job Listing Email",
    throttle: {
      limit: 10,
      period: "1m",
    },
  },
  { event: "app/email.daily-user-job-listings" },
  async ({ event, step }) => {
    const data = event.data ?? { jobListings: [], aiPrompt: undefined as string | undefined }
    const user = event.user
    const jobListings = Array.isArray(data.jobListings) ? data.jobListings : []
    const aiPrompt = data.aiPrompt

    console.log(`Processing email for ${user.email}`)
    console.log(`Job listings count: ${jobListings.length}`)
    console.log(`AI Prompt: ${aiPrompt || 'No prompt'}`)

    if (jobListings.length === 0) {
      console.log("No job listings - returning early")
      return { message: "No job listings to process" };
    }

    let matchingJobListings: typeof jobListings = []
    if (aiPrompt == null || aiPrompt.trim() === "") {
      console.log("No AI prompt - using all job listings")
      matchingJobListings = jobListings
    } else {
      console.log("Filtering with AI prompt...")
      const matchingIds = await step.run("filter-with-ai", async () => {
        return await getMatchingJobListings(aiPrompt, jobListings)
      })
      matchingJobListings = jobListings.filter(listing =>
        matchingIds.includes(listing.id)
      )
      console.log(`AI filtered to ${matchingJobListings.length} matching jobs`)
    }

    if (matchingJobListings.length === 0) {
      console.log("No matching job listings after filtering - returning early")
      return { message: "No matching job listings found" };
    }

    const emailResult = await step.run("send-email", async () => {
      return await resend.emails.send({
        from: "Dune Jobs <notifications@resend.dev>",
        to: user.email,
        subject: `${matchingJobListings.length} New Job${matchingJobListings.length > 1 ? 's' : ''} Match${matchingJobListings.length === 1 ? 'es' : ''} Your Criteria`,
        react: DailyJobListingEmail({
          jobListings: matchingJobListings,
          userName: user.name,
          serverUrl: env.SERVER_URL,
        }),
      })
    })

    console.log(`Email sent successfully to ${user.email}`)
    return { 
      message: `Email sent to ${user.email}`, 
      jobCount: matchingJobListings.length,
      emailId: emailResult.data?.id 
    };
  }
)

