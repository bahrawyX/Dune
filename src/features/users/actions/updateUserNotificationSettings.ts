"use server"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { notificationSettingsSchema } from "./schemas";
import z from "zod";
import { updateUserNotificationSettingsDB } from "../db/userNotificationSettings";

export async function updateUserNotificationSettings(unsafe: z.infer<typeof notificationSettingsSchema>) {
    const {success, data} = notificationSettingsSchema.safeParse(unsafe);
    const {userId} = await getCurrentUser();
    if(!userId) {
        return {error: true, message: "You Have To Be Logged In To Update Your Notification Settings"};
    }
    if(!success) {
        return {error: true, message: "There was an error processing your request. Please try again later or contact support if the problem persists"};
    }
    await updateUserNotificationSettingsDB(userId, data);
    return { error: false, message: "Notification settings updated successfully" };
}