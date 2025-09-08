import { experienceLevels, jobListingStatuses, jobListingTypes, locationRequirements, wageIntervals } from "@/app/drizzle/schema";
import { title } from "process";
import z from "zod";

export const JobListingSchema = z.object({
        title: z.string().min(1 , "Title is required"),
        description: z.string().min(1 , "Description is required"),
        wage: z.number().int().positive().nullable(),
        experienceLevel: z.enum(experienceLevels).optional(),
        locationRequirement: z.enum(locationRequirements).optional(),
        type: z.enum(jobListingTypes).optional(),
        wageInterval: z.enum(wageIntervals).optional(),
        stateAbbreviation: z.string().transform(val => (val.trim() === "" ? null : val)).nullable(),
        city: z.string().transform(val => (val.trim() === "" ? null : val)).nullable(),
        status: z.enum(jobListingStatuses).optional(),
        isFeatured: z.boolean().optional(),
}).refine(listing => {
    return listing.locationRequirement === "remote" || listing.city != null || listing.stateAbbreviation != null;
},

{
    message: "City is required when location requirement is not remote",
    path: ["city"],
}).refine(listing => {
    return listing.locationRequirement === "remote" || listing.stateAbbreviation != null;
},

{
    message: "State abbreviation is required when location requirement is not remote",
    path: ["stateAbbreviation"],
}
)