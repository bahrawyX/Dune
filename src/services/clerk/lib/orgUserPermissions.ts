import { auth, User } from "@clerk/nextjs/server";
type UserPermission =
  | "job_listings:create"
  | "job_listings:update"
  | "job_listings:delete"
  | "job_listings:change_status"
  | "job_listing_applications:change_rating"
  | "job_listing_applications:change_stage"

  
export async function hasOrgUserPermission(permission : UserPermission) {
    try {
        const {has} = await auth();
        
        if (!has) {
            return false;
        }
        
        return has({permission});
    } catch (error) {
        console.error('Error checking permission:', error)
        return false;
    }
}