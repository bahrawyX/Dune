
import { db } from "@/app/drizzle/db";
import { JobListingApplicationTable } from "@/app/drizzle/schema";
import { and, eq } from "drizzle-orm";

export async function insertJobListingApplication(
    application: typeof JobListingApplicationTable.$inferInsert
  ) {
    await db.insert(JobListingApplicationTable).values(application).onConflictDoNothing({
        target:[JobListingApplicationTable.jobListingId, JobListingApplicationTable.userId]
    })
  }
  
  export async function updateJobListingApplication(
    {
      jobListingId,
      userId,
    }: {
      jobListingId: string
      userId: string
    },
    data: Partial<typeof JobListingApplicationTable.$inferInsert>
  ) {
    await db
      .update(JobListingApplicationTable)
      .set(data)
      .where(
        and(
          eq(JobListingApplicationTable.jobListingId, jobListingId),
          eq(JobListingApplicationTable.userId, userId)
        )
      )
  
  }