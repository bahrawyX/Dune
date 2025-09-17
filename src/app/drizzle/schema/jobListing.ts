import {
    integer,
    pgEnum,
    pgTable,
    text,
    varchar,
    boolean,
    timestamp,
    index,
  } from "drizzle-orm/pg-core"
  import { createdAt, id, updatedAt } from "../schemaHelpers"
  import { OrganizationTable } from "./organization"
  import { relations } from "drizzle-orm"
  import { JobListingApplicationTable } from "./jobListingApplication"
  
  export const wageIntervals = ["hourly", "monthly", "yearly"] as const
  export type WageInterval = (typeof wageIntervals)[number]
  export const wageIntervalEnum = pgEnum(
    "job_listings_wage_interval",
    wageIntervals
  )
  
  export const locationRequirements = ["on-site", "hybrid", "remote"] as const
  export type LocationRequirement = (typeof locationRequirements)[number]
  export const locationRequirementEnum = pgEnum(
    "job_listings_location_requirement",
    locationRequirements
  )
  
  export const experienceLevels = ["junior", "mid-level", "senior"] as const
  export type ExperienceLevel = (typeof experienceLevels)[number]
  export const experienceLevelEnum = pgEnum(
    "job_listings_experience_level",
    experienceLevels
  )
  
  export const jobListingStatuses = ["draft", "published", "delisted"] as const
  export type JobListingStatus = (typeof jobListingStatuses)[number]
  export const jobListingStatusEnum = pgEnum(
    "job_listings_status",
    jobListingStatuses
  )
  
  export const jobListingTypes = ["internship", "part-time", "full-time"] as const
  export type JobListingType = (typeof jobListingTypes)[number]
  export const jobListingTypeEnum = pgEnum("job_listings_type", jobListingTypes)
  
  export const JobListingTable = pgTable(
    "job_listings",
    {
      id,
      organizationId: varchar()
        .references(() => OrganizationTable.id, { onDelete: "cascade" })
        .notNull(),
      title: varchar().notNull(),
      description: text().notNull(),
      skills: text().array().default([]).notNull(),
      wage: integer(),
      wageInterval: wageIntervalEnum(),
      stateAbbreviation: varchar(),
      city: varchar(),
      isFeatured: boolean().notNull().default(false),
      locationRequirement: locationRequirementEnum().notNull(),
      experienceLevel: experienceLevelEnum().notNull(),
      status: jobListingStatusEnum().notNull().default("draft"),
      type: jobListingTypeEnum().notNull(),
      postedAt: timestamp({ withTimezone: true }),
      createdAt,
      updatedAt,
    },
    table => ({
      stateIdx: index("job_listings_state_idx").on(table.stateAbbreviation),
      cityIdx: index("job_listings_city_idx").on(table.city),
      statusIdx: index("job_listings_status_idx").on(table.status),
      postedAtIdx: index("job_listings_posted_at_idx").on(table.postedAt),
      experienceIdx: index("job_listings_experience_idx").on(table.experienceLevel),
      typeIdx: index("job_listings_type_idx").on(table.type),
      locationReqIdx: index("job_listings_location_req_idx").on(table.locationRequirement),
      featuredIdx: index("job_listings_featured_idx").on(table.isFeatured),
      organizationIdx: index("job_listings_org_idx").on(table.organizationId),
      skillsIdx: index("job_listings_skills_idx").using("gin", table.skills),
      statusPostedIdx: index("job_listings_status_posted_idx").on(table.status, table.postedAt),
      statusFeaturedIdx: index("job_listings_status_featured_idx").on(table.status, table.isFeatured),
    })
  )
  
  export const jobListingReferences = relations(
    JobListingTable,
    ({ one, many }) => ({
      organization: one(OrganizationTable, {
        fields: [JobListingTable.organizationId],
        references: [OrganizationTable.id],
      }),
      applications: many(JobListingApplicationTable),
    })
  )