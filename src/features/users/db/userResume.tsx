import { db } from "@/app/drizzle/db";
import { UserResumeTable } from "@/app/drizzle/schema";
import { eq } from "drizzle-orm";

export async function upsertUserResume(userId: string, resume: Omit<typeof UserResumeTable.$inferInsert, "userId">) {
  return await db.insert(UserResumeTable).values({userId, ...resume}).onConflictDoUpdate({
    target: [UserResumeTable.userId],
    set: resume,
  });
}
export async function updateUserResume(userId: string, resume: Partial< Omit<typeof UserResumeTable.$inferInsert, "userId">>) {
  return await db.update(UserResumeTable).set({...resume}).where(eq(UserResumeTable.userId, userId));
}

