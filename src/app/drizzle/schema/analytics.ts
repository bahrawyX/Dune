import { pgTable, varchar, json, integer, timestamp, index, pgEnum } from "drizzle-orm/pg-core"
import { createdAt, id } from "../schemaHelpers"
import { relations } from "drizzle-orm"
import { UserTable } from "./user"
import { OrganizationTable } from "./organization"
import { JobListingTable } from "./jobListing"

// Event types for tracking user actions
export const eventTypeEnum = pgEnum("event_type", [
  "page_view",
  "job_search",
  "job_view",
  "job_apply",
  "job_bookmark",
  "profile_update",
  "resume_upload",
  "login",
  "logout",
  "signup",
  "job_post",
  "job_edit",
  "application_review",
  "application_status_change",
  "email_open",
  "email_click"
])

// Analytics events table for tracking all user interactions
export const AnalyticsEventTable = pgTable("analytics_events", {
  id,
  eventType: eventTypeEnum("event_type").notNull(),
  userId: varchar("user_id").references(() => UserTable.id, { onDelete: "cascade" }),
  organizationId: varchar("organization_id").references(() => OrganizationTable.id, { onDelete: "cascade" }),
  jobListingId: varchar("job_listing_id").references(() => JobListingTable.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  referrer: varchar("referrer"),
  pathname: varchar("pathname"),
  searchQuery: varchar("search_query"),
  metadata: json("metadata"), // Additional event-specific data
  createdAt,
}, (table) => ({
  userIdIdx: index("analytics_events_user_id_idx").on(table.userId),
  eventTypeIdx: index("analytics_events_event_type_idx").on(table.eventType),
  createdAtIdx: index("analytics_events_created_at_idx").on(table.createdAt),
  orgIdIdx: index("analytics_events_org_id_idx").on(table.organizationId),
  jobListingIdIdx: index("analytics_events_job_listing_id_idx").on(table.jobListingId),
}))

// Daily aggregated metrics for performance
export const DailyMetricsTable = pgTable("daily_metrics", {
  id,
  date: timestamp("date", { withTimezone: true }).notNull(),
  metricType: varchar("metric_type").notNull(), // e.g., "total_views", "applications", "signups"
  entityType: varchar("entity_type"), // "user", "organization", "job_listing", "global"
  entityId: varchar("entity_id"), // ID of the specific entity
  value: integer("value").notNull().default(0),
  metadata: json("metadata"),
  createdAt,
}, (table) => ({
  dateIdx: index("daily_metrics_date_idx").on(table.date),
  metricTypeIdx: index("daily_metrics_metric_type_idx").on(table.metricType),
  entityIdx: index("daily_metrics_entity_idx").on(table.entityType, table.entityId),
  uniqueMetric: index("daily_metrics_unique_idx").on(table.date, table.metricType, table.entityType, table.entityId),
}))

// Job listing performance metrics
export const JobListingMetricsTable = pgTable("job_listing_metrics", {
  id,
  jobListingId: varchar("job_listing_id").notNull().references(() => JobListingTable.id, { onDelete: "cascade" }),
  totalViews: integer("total_views").notNull().default(0),
  uniqueViews: integer("unique_views").notNull().default(0),
  totalApplications: integer("total_applications").notNull().default(0),
  bookmarks: integer("bookmarks").notNull().default(0),
  searchImpressions: integer("search_impressions").notNull().default(0),
  clickThroughRate: integer("click_through_rate").default(0), // Stored as percentage * 100
  averageTimeOnPage: integer("average_time_on_page").default(0), // In seconds
  conversionRate: integer("conversion_rate").default(0), // Applications/Views * 10000
  lastCalculated: timestamp("last_calculated", { withTimezone: true }).notNull().defaultNow(),
  createdAt,
}, (table) => ({
  jobListingIdIdx: index("job_listing_metrics_job_id_idx").on(table.jobListingId),
  lastCalculatedIdx: index("job_listing_metrics_last_calc_idx").on(table.lastCalculated),
}))

// User activity metrics
export const UserMetricsTable = pgTable("user_metrics", {
  id,
  userId: varchar("user_id").notNull().references(() => UserTable.id, { onDelete: "cascade" }),
  totalLogins: integer("total_logins").notNull().default(0),
  totalJobViews: integer("total_job_views").notNull().default(0),
  totalApplications: integer("total_applications").notNull().default(0),
  totalBookmarks: integer("total_bookmarks").notNull().default(0),
  totalSearches: integer("total_searches").notNull().default(0),
  profileCompleteness: integer("profile_completeness").default(0), // Percentage * 100
  lastActiveDate: timestamp("last_active_date", { withTimezone: true }),
  lastCalculated: timestamp("last_calculated", { withTimezone: true }).notNull().defaultNow(),
  createdAt,
}, (table) => ({
  userIdIdx: index("user_metrics_user_id_idx").on(table.userId),
  lastActiveIdx: index("user_metrics_last_active_idx").on(table.lastActiveDate),
  lastCalculatedIdx: index("user_metrics_last_calc_idx").on(table.lastCalculated),
}))

// Organization metrics for employers
export const OrganizationMetricsTable = pgTable("organization_metrics", {
  id,
  organizationId: varchar("organization_id").notNull().references(() => OrganizationTable.id, { onDelete: "cascade" }),
  totalJobPostings: integer("total_job_postings").notNull().default(0),
  activeJobPostings: integer("active_job_postings").notNull().default(0),
  totalApplicationsReceived: integer("total_applications_received").notNull().default(0),
  totalHires: integer("total_hires").notNull().default(0),
  averageTimeToHire: integer("average_time_to_hire").default(0), // In days
  totalProfileViews: integer("total_profile_views").notNull().default(0),
  responseRate: integer("response_rate").default(0), // Percentage * 100
  lastCalculated: timestamp("last_calculated", { withTimezone: true }).notNull().defaultNow(),
  createdAt,
}, (table) => ({
  organizationIdIdx: index("org_metrics_org_id_idx").on(table.organizationId),
  lastCalculatedIdx: index("org_metrics_last_calc_idx").on(table.lastCalculated),
}))

// Relations
export const analyticsEventRelations = relations(AnalyticsEventTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [AnalyticsEventTable.userId],
    references: [UserTable.id],
  }),
  organization: one(OrganizationTable, {
    fields: [AnalyticsEventTable.organizationId],
    references: [OrganizationTable.id],
  }),
  jobListing: one(JobListingTable, {
    fields: [AnalyticsEventTable.jobListingId],
    references: [JobListingTable.id],
  }),
}))

export const jobListingMetricsRelations = relations(JobListingMetricsTable, ({ one }) => ({
  jobListing: one(JobListingTable, {
    fields: [JobListingMetricsTable.jobListingId],
    references: [JobListingTable.id],
  }),
}))

export const userMetricsRelations = relations(UserMetricsTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [UserMetricsTable.userId],
    references: [UserTable.id],
  }),
}))

export const organizationMetricsRelations = relations(OrganizationMetricsTable, ({ one }) => ({
  organization: one(OrganizationTable, {
    fields: [OrganizationMetricsTable.organizationId],
    references: [OrganizationTable.id],
  }),
}))