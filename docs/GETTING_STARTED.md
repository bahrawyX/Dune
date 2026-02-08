# Dune SaaS - Getting Started Development Guide

## Quick Start: Understanding the Codebase in 30 Minutes

### 1. First 5 Minutes: High-Level Overview

**What is Dune?**
- Job board SaaS application
- Two user types: Job seekers (browse jobs) + Employers (post jobs)
- Multi-tenant: Organizations can have multiple users
- Built with modern Next.js stack

**Key Technologies:**
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind
- **Database**: PostgreSQL + Drizzle ORM  
- **Auth**: Clerk (handles users + organizations)
- **Background Jobs**: Inngest (webhooks, async tasks)
- **UI**: Radix UI components

### 2. Next 10 Minutes: Code Structure Walkthrough

Open these files in order to understand the architecture:

```bash
# 1. Start with the main layout
src/app/layout.tsx                 # Root layout with providers

# 2. Check the authentication setup  
src/middleware.ts                  # Route protection
src/services/clerk/components/clerkProvider.tsx

# 3. Examine the database schema
src/app/drizzle/schema.ts         # All database tables
src/app/drizzle/schema/jobListing.ts  # Main business entity

# 4. Look at the main user interfaces
src/app/(job-seeker)/page.tsx     # Job seeker home page
src/app/employer/page.tsx         # Employer dashboard

# 5. Check a complete feature
src/features/jobListings/         # Complete job listing feature
├── action/actions.ts             # Server-side logic
├── components/JobListingForm.tsx # Main form component
└── db/jobListings.ts            # Database operations
```

### 3. Next 15 Minutes: Running the Application

#### Prerequisites Setup
```bash
# Install Node.js 18+ and PostgreSQL 17
# Or use Docker for PostgreSQL

# Clone the repository
git clone [your-repo-url]
cd Dune
```

#### Environment Configuration
```bash
# Create environment file
cp .env.example .env.local

# Add these variables to .env.local:
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=dune

# Clerk (get from https://clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

#### Database Setup
```bash
# Option 1: Docker (Recommended)
docker-compose up -d

# Option 2: Local PostgreSQL
createdb dune
```

#### Application Startup
```bash
# Install dependencies (may have network issues with inngest-cli)
npm install --ignore-scripts

# Run database migrations
npm run db:generate  # Generate schema
npm run db:migrate   # Apply to database

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## Understanding the Application Flow

### User Journey: Job Seeker
```
1. User visits "/" (homepage)
   ↓
2. JobListingItems component loads
   ↓ 
3. Database query fetches published job listings
   ↓
4. Jobs displayed with filters (location, type, etc.)
   ↓
5. User clicks job → "/job-listings/[id]"
   ↓
6. Job details page with apply button
   ↓
7. Apply requires authentication (Clerk)
   ↓
8. Application stored in database
```

### User Journey: Employer
```
1. User signs up/logs in via Clerk
   ↓
2. Creates or joins organization
   ↓
3. Redirected to "/employer"
   ↓
4. If no job listings → "/employer/job-listings/new"
   ↓
5. JobListingForm component for creating jobs
   ↓
6. Form submission → createJobListing server action
   ↓
7. Validation → Database insertion → Redirect
   ↓
8. Job listing created in "draft" status
   ↓
9. Can edit, publish, or delete via job management UI
```

### Data Synchronization Flow
```
Clerk Event (user signup)
   ↓
Webhook sent to "/api/inngest"
   ↓
Inngest processes webhook in background
   ↓
Creates local user record in PostgreSQL
   ↓
Sets up default user settings
   ↓
User data available for application logic
```

## Key Components Deep Dive

### 1. JobListingForm - The Heart of the Application

**Location:** `src/features/jobListings/components/JobListingForm.tsx`

**Purpose:** Create and edit job listings with full validation

**Key Features:**
- Form validation with Zod schemas
- Rich text editor for job descriptions
- Dynamic form fields based on job type
- Server actions for submission
- Error handling and user feedback

```typescript
// How it works:
1. useForm hook with Zod resolver for validation
2. Form fields map to database schema
3. onSubmit calls server action (createJobListing or updateJobListing)  
4. Server action validates permissions and data
5. Database transaction with error handling
6. Redirect to newly created job or show errors
7. UI revalidates to show latest data
```

### 2. Authentication Flow with Clerk

**Key Files:**
- `src/middleware.ts` - Route protection
- `src/services/clerk/lib/getCurrentAuth.ts` - Auth helpers
- `src/services/clerk/components/clerkProvider.tsx` - React context

**How Authentication Works:**
```typescript
// 1. Middleware checks every request
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect() // Redirects to sign-in if not authenticated
  }
})

// 2. Components use auth context
const { userId, orgId } = useAuth()
if (!userId) return <SignInButton />

// 3. Server actions verify permissions
async function createJobListing(data: FormData) {
  const { orgId } = await getCurrentOrganization()
  if (!orgId) throw new Error('Must be part of organization')
  // ... continue with business logic
}
```

### 3. Database Operations with Drizzle

**Schema Definition:**
```typescript
// src/app/drizzle/schema/jobListing.ts
export const JobListingTable = pgTable("job_listings", {
  id: varchar().primaryKey(),
  organizationId: varchar().references(() => OrganizationTable.id),
  title: varchar().notNull(),
  description: text().notNull(),
  // ... more fields with proper types and constraints
})
```

**Query Patterns:**
```typescript
// Simple queries
const jobs = await db.select().from(JobListingTable)

// With relations
const job = await db.query.JobListingTable.findFirst({
  where: eq(JobListingTable.id, jobId),
  with: {
    organization: true,
    applications: true,
  }
})

// Complex filtering
const filteredJobs = await db.select()
  .from(JobListingTable)
  .where(and(
    eq(JobListingTable.status, 'published'),
    ilike(JobListingTable.title, `%${searchTerm}%`)
  ))
  .orderBy(desc(JobListingTable.postedAt))
```

### 4. Server Actions Pattern

**Location:** `src/features/jobListings/action/actions.ts`

**Modern Next.js Pattern:**
```typescript
'use server' // Enables server action

export async function createJobListing(formData: FormData) {
  // 1. Get current user/organization
  const { orgId } = await getCurrentOrganization()
  
  // 2. Validate input data
  const validatedData = JobListingSchema.parse(formData)
  
  // 3. Check permissions/business rules
  const canCreate = await checkJobPostingLimits(orgId)
  if (!canCreate) throw new Error('Job posting limit reached')
  
  // 4. Database transaction
  const result = await db.transaction(async (tx) => {
    const job = await tx.insert(JobListingTable).values({
      ...validatedData,
      organizationId: orgId,
      id: generateId(),
    }).returning()
    
    // Update organization stats
    await tx.update(OrganizationTable)
      .set({ jobCount: sql`job_count + 1` })
      .where(eq(OrganizationTable.id, orgId))
    
    return job[0]
  })
  
  // 5. Revalidate cache
  revalidatePath('/employer/job-listings')
  revalidatePath('/')
  
  // 6. Redirect or return result
  redirect(`/employer/job-listings/${result.id}`)
}
```

**Benefits of Server Actions:**
- Type safety from client to database
- No API route boilerplate
- Automatic request deduplication
- Progressive enhancement (works without JavaScript)
- Direct database access with permission checks

## Development Workflow

### Making Changes to the Application

#### 1. Adding a New Feature
```bash
# Example: Adding job application system

# 1. Create database schema
# Edit src/app/drizzle/schema/jobListingApplication.ts
export const JobListingApplicationTable = pgTable("job_listing_applications", {
  id: varchar().primaryKey(),
  jobListingId: varchar().references(() => JobListingTable.id),
  userId: varchar().references(() => UserTable.id),
  status: applicationStatusEnum().default('pending'),
  appliedAt: timestamp().defaultNow(),
  // ... more fields
})

# 2. Generate migration
npm run db:generate

# 3. Apply migration  
npm run db:migrate

# 4. Create feature directory
mkdir src/features/applications

# 5. Add server actions
# src/features/applications/action/actions.ts
'use server'
export async function submitApplication(jobId: string, resumeData: FormData) {
  // Implementation
}

# 6. Create components
# src/features/applications/components/ApplicationForm.tsx

# 7. Add to UI
# Update job listing page to include application form
```

#### 2. Modifying Existing Features
```bash
# Example: Adding salary range filter

# 1. Update database schema (if needed)
# Add salary range fields to JobListingTable

# 2. Update validation schema
# src/features/jobListings/action/schema.ts
export const JobListingSchema = z.object({
  // ... existing fields
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
})

# 3. Update form component
# src/features/jobListings/components/JobListingForm.tsx
# Add salary range input fields

# 4. Update filter component
# src/features/jobListings/components/JobListingFilterForm.tsx
# Add salary range filters

# 5. Update database queries
# src/features/jobListings/db/jobListings.ts
# Add salary filtering logic

# 6. Test changes
npm run dev
# Verify form submission and filtering works
```

### Debugging Common Issues

#### Database Issues
```bash
# View current schema
npm run db:studio

# Check migration status
ls src/app/drizzle/migrations/

# Reset database (CAREFUL - loses data)
npm run db:push --force

# View logs
docker-compose logs db
```

#### Authentication Issues
```bash
# Check Clerk configuration
# 1. Verify environment variables
# 2. Check webhook endpoints in Clerk dashboard
# 3. Test webhook delivery

# Debug auth in components
const { isLoaded, isSignedIn, user, organization } = useAuth()
console.log({ isLoaded, isSignedIn, user, organization })
```

#### Build/Runtime Issues
```bash
# Check TypeScript errors
npx tsc --noEmit

# Run linting
npm run lint

# Check for unused dependencies
npx depcheck

# Bundle analysis (when build works)
npm run build
npx @next/bundle-analyzer
```

## Common Development Tasks

### 1. Adding a New Page
```typescript
// 1. Create page file
// src/app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>
}

// 2. Add navigation (if needed)
// Update relevant layout or navigation components

// 3. Add route protection (if needed) 
// Update middleware.ts if page should be protected
```

### 2. Creating a New Component
```typescript
// 1. Decide location
// - src/components/ui/ for reusable UI components
// - src/features/[domain]/components/ for feature-specific components

// 2. Create component file
// src/components/MyComponent.tsx
interface MyComponentProps {
  title: string
  onAction: () => void
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  )
}

// 3. Export from index (if in feature)
// src/features/myFeature/components/index.ts
export { MyComponent } from './MyComponent'
```

### 3. Adding Database Table
```typescript
// 1. Create schema file
// src/app/drizzle/schema/myTable.ts
export const MyTable = pgTable("my_table", {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  createdAt: timestamp().defaultNow(),
})

// 2. Add relations (if needed)
export const myTableRelations = relations(MyTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [MyTable.userId],
    references: [UserTable.id],
  }),
}))

// 3. Export from main schema
// src/app/drizzle/schema.ts
export * from "./schema/myTable"

// 4. Generate and apply migration
npm run db:generate
npm run db:migrate
```

### 4. Adding Environment Variables
```typescript
// 1. Add to environment schema
// src/app/data/env/server.ts
export const env = createEnv({
  server: {
    // ... existing vars
    NEW_API_KEY: z.string().min(1),
  },
  // ...
})

// 2. Add to .env.local
NEW_API_KEY=your_api_key_here

// 3. Use in application
import { env } from '@/app/data/env/server'
const apiKey = env.NEW_API_KEY
```

## Next Steps for Learning

### 1. Understand the Database Relationships
```bash
# Open Drizzle Studio
npm run db:studio

# Explore tables and relationships:
# - Users table connects to Organizations via Clerk
# - Organizations have many JobListings  
# - JobListings have many Applications
# - Users have settings and resume data
```

### 2. Follow a Complete Data Flow
```bash
# Pick one feature and trace from UI to database:
# 1. Start with JobListingForm component
# 2. Follow form submission to server action
# 3. Trace database insertion
# 4. See how data flows back to UI
# 5. Understand caching and revalidation
```

### 3. Examine Webhook Processing
```bash
# Look at Inngest functions:
# src/services/inngest/functions/clerk.ts
# - See how Clerk webhooks create local user records
# - Understand the synchronization process
# - Follow error handling patterns
```

### 4. Explore Authentication Patterns
```bash
# Study these files in order:
# 1. middleware.ts - Route protection
# 2. clerkProvider.tsx - React context setup
# 3. getCurrentAuth.ts - Server-side auth helpers
# 4. Any component using useAuth() hook
```

This guide should give you everything you need to understand and start working with the Dune SaaS codebase effectively. The key is to start with the high-level structure, then dive deep into specific features that interest you!