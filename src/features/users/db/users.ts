import { db } from "@/app/drizzle/db"
import { UserTable } from "@/app/drizzle/schema"
import { eq } from "drizzle-orm"

export async function insertUser(user: typeof UserTable.$inferInsert) {
  // First check if user already exists by ID
  const existingUserById = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, user.id)
  });
  
  if (existingUserById) {
    console.log('User already exists in database (by ID):', user.id);
    return { created: false, user: existingUserById };
  }
  
  // Also check if user exists by email (unique constraint)
  const existingUserByEmail = await db.query.UserTable.findFirst({
    where: eq(UserTable.email, user.email)
  });
  
  if (existingUserByEmail) {
    console.log('User already exists in database (by email):', user.email, 'with different ID:', existingUserByEmail.id);
    console.log('This user probably signed up with a different auth method or Clerk regenerated the ID');
    
    // Don't update the ID - just update other fields and use the existing record
    const updatedUser = await db.update(UserTable)
      .set({ 
        name: user.name,
        imageUrl: user.imageUrl,
        updatedAt: user.updatedAt 
      })
      .where(eq(UserTable.email, user.email))
      .returning();
    
    console.log('Updated existing user profile (keeping original ID):', existingUserByEmail.id);
    return { created: false, user: updatedUser[0] };
  }
  
  // Insert the new user
  try {
    const result = await db.insert(UserTable).values(user).returning();
    console.log('New user inserted into database:', user.id);
    return { created: true, user: result[0] };
  } catch (insertError) {
    // If we still get a constraint violation, something else is wrong
    console.error('Failed to insert user despite checks:', insertError);
    throw insertError;
  }
}

export async function updateUser(
  id: string,
  user: Partial<typeof UserTable.$inferInsert>
) {
  await db.update(UserTable).set(user).where(eq(UserTable.id, id))

}

export async function deleteUser(id: string) {
  await db.delete(UserTable).where(eq(UserTable.id, id))

}