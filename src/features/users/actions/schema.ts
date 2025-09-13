import { z } from "zod";

export const notificationSettingsSchema = z.object({
    newJobEmailNotifications: z.boolean(),
    aiPrompt: z.string().nullable(),
})