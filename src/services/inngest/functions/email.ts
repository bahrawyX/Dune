import { db } from "@/app/drizzle/db"
import { inngest } from "../client"
import { and, eq, gte } from "drizzle-orm"
import {
  JobListingApplicationTable,
  JobListingTable,
  OrganizationUserSettingsTable,
  UserNotificationSettingsTable,
} from "@/app/drizzle/schema"
import { subDays } from "date-fns"
import { GetEvents } from "inngest"
import { getMatchingJobListings } from "@/services/inngest/ai/getMatchingListings"
import { resend } from "@/services/resend/client"
import DailyJobListingEmail from "@/services/resend/components/DailyJobListing"
import { env } from "@/app/data/env/server"
import DailyApplicationEmail from "@/services/resend/components/DailyApplicationEmail"

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


export const prepareDailyOrganizationUserApplicationNotifications =
  inngest.createFunction(
    {
      id: "prepare-daily-organization-user-application-notifications",
      name: "Prepare Daily Organization User Application Notifications",
    },
    { cron: "TZ=America/Chicago 0 7 * * *" },
    async ({ step, event }) => {
      const getUsers = step.run("get-user-settings", async () => {
        return await db.query.OrganizationUserSettingsTable.findMany({
          where: eq(
            OrganizationUserSettingsTable.newApplicationEmailNotifications,
            true
          ),
          columns: {
            userId: true,
            organizationId: true,
            newApplicationEmailNotifications: true,
            minimumRating: true,
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

      const getApplications = step.run("get-recent-applications", async () => {
        return await db.query.JobListingApplicationTable.findMany({
          where: and(
            gte(
              JobListingApplicationTable.createdAt,
              subDays(new Date(event.ts ?? Date.now()), 1)
            )
          ),
          columns: {
            rating: true,
          },
          with: {
            user: {
              columns: {
                name: true,
              },
            },
            jobListing: {
              columns: {
                id: true,
                title: true,
              },
              with: {
                organization: {
                  columns: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        })
      })

      const [userNotifications, applications] = await Promise.all([
        getUsers,
        getApplications,
      ])

      console.log(`Found ${userNotifications.length} users with application notifications enabled`)
      console.log(`Found ${applications.length} recent applications`)

      if (applications.length === 0) {
        console.log("No applications found - exiting")
        return { message: "No applications found" }
      }
      
      if (userNotifications.length === 0) {
        console.log("No users with application notifications enabled - exiting")
        return { message: "No users with application notifications enabled" }
      }

      const groupedNotifications = Object.groupBy(
        userNotifications,
        n => n.userId
      )

      const events = Object.entries(groupedNotifications)
        .map(([, settings]) => {
          if (settings == null || settings.length === 0) return null
          const userName = settings[0].user.name
          const userEmail = settings[0].user.email

          const filteredApplications = applications
            .filter(a => {
              return settings.find(
                s =>
                  s.organizationId === a.jobListing.organization.id &&
                  (s.minimumRating == null ||
                    (a.rating ?? 0) >= s.minimumRating)
              )
            })
            .map(a => ({
              organizationId: a.jobListing.organization.id,
              organizationName: a.jobListing.organization.name,
              jobListingId: a.jobListing.id,
              jobListingTitle: a.jobListing.title,
              userName: a.user.name,
              rating: a.rating,
            }))

          console.log(`User ${userEmail} has ${filteredApplications.length} matching applications`)
          if (filteredApplications.length === 0) return null

          return {
            name: "app/email.daily-organization-user-applications",
            user: {
              name: userName ?? "",
              email: userEmail,
            },
            data: { applications: filteredApplications as any },
          } as const satisfies GetEvents<
            typeof inngest
          >["app/email.daily-organization-user-applications"]
        })
        .filter(v => v != null)

      console.log(`Sending ${events.length} application email events`)
      if (events.length === 0) {
        console.log("No events to send - exiting")
        return { message: "No events to send" }
      }
      
      await step.sendEvent("send-email", events)
      return { message: `Sent ${events.length} application email events successfully` }
    }
  )


export const sendDailyOrganizationUserApplicationEmail = inngest.createFunction(
  {
    id: "send-daily-organization-user-application-email",
    name: "Send Daily Organization User Application Email",
    throttle: {
      limit: 1000,
      period: "1m",
    },
  },
  { event: "app/email.daily-organization-user-applications" },
  async ({ event, step }) => {
    const { applications } = event.data
    const user = event.user
    
    console.log(`Processing application email for ${user.email}`)
    console.log(`Applications count: ${applications.length}`)
    
    if (applications.length === 0) {
      console.log("No applications - returning early")
      return { message: "No applications to process" }
    }

    const emailResult = await step.run("send-email", async () => {
      return await resend.emails.send({
        from: "DUNE <onboarding@dune.dev>",
        to: user.email,
        subject: "Daily Job Listing Applications",
        react: DailyApplicationEmail({
          applications,
          userName: user.name,
        }),
      })
    })

    console.log(`Application email sent successfully to ${user.email}`)
    return { 
      message: `Email sent to ${user.email}`, 
      applicationCount: applications.length,
      emailId: emailResult.data?.id 
    }
  }
)