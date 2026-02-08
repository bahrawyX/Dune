# Dune SaaS - Complete Application Guide

## Table of Contents
1. [Application Overview](#application-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Deep Dive](#architecture-deep-dive)
4. [Database Design](#database-design)
5. [Authentication Flow](#authentication-flow)
6. [Development Workflow](#development-workflow)
7. [Feature Organization](#feature-organization)
8. [API Design](#api-design)
9. [Deployment Guide](#deployment-guide)
10. [Current Issues & Improvements](#current-issues--improvements)

## Application Overview

**Dune** is a modern, full-stack Job Board SaaS application built with Next.js. It's designed as a multi-tenant platform where organizations can post job listings and job seekers can browse and apply for positions.

### Core Concept
- **Mission**: "Your Way To Your Dream Job or Dream Team"
- **Business Model**: SaaS with tiered pricing for organizations
- **Target Users**: 
  - **Job Seekers**: Individuals looking for employment
  - **Employers**: Organizations/companies looking to hire

### Key Features
1. **Multi-tenant Architecture**: Each organization has its own workspace
2. **Role-based Access**: Different interfaces for job seekers vs employers
3. **Job Management**: Full CRUD operations for job listings
4. **Application System**: Job seekers can apply with resumes
5. **Pricing Plans**: Different tiers with varying features
6. **Real-time Sync**: Clerk webhooks keep user data synchronized

## Technology Stack

### Frontend Technologies
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library for smooth interactions

### Backend Technologies
- **Next.js API Routes**: Server-side API endpoints
- **PostgreSQL**: Primary database for all application data
- **Drizzle ORM**: Type-safe database operations
- **Clerk**: Authentication and user management
- **Inngest**: Background job processing and webhooks

### Development Tools
- **ESLint**: Code linting and formatting
- **Drizzle Kit**: Database migrations and schema management
- **Docker Compose**: Local PostgreSQL development environment
- **Zod**: Runtime type validation for forms and APIs

### External Services
- **Clerk**: Handles authentication, user management, and organizations
- **Google Fonts**: Typography (Montserrat, Space Grotesk)
- **Svix**: Webhook verification for Clerk events

## Architecture Deep Dive

### Application Structure
The application follows a **feature-based architecture** with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router pages
│   ├── (clerk)/           # Authentication pages
│   ├── (job-seeker)/      # Job seeker interface
│   ├── employer/          # Employer interface
│   ├── api/               # API routes
│   ├── drizzle/           # Database schema and migrations
│   └── data/              # Environment configuration
├── components/            # Reusable UI components
├── features/              # Business logic by domain
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── services/              # External service integrations
```

### Route Organization

#### Authentication Routes (`(clerk)`)
- `/sign-in` - User login
- `/organizations/select` - Organization selection for multi-tenant access

#### Job Seeker Routes (`(job-seeker)`)
- `/` - Home page with job listings
- `/job-listings/[id]` - Individual job listing details
- Parallel routing with `@sidebar` for consistent navigation

#### Employer Routes (`employer`)
- `/employer` - Dashboard (redirects to latest job listing)
- `/employer/job-listings/new` - Create new job listing
- `/employer/job-listings/[id]` - View/manage specific job listing
- `/employer/job-listings/[id]/edit` - Edit job listing
- `/employer/pricing` - Subscription management

### Multi-tenant Architecture
The application implements multi-tenancy through Clerk organizations:
1. **Users** can belong to multiple organizations
2. **Organizations** have their own job listings and settings
3. **Data isolation** ensures each organization only sees their data
4. **Role-based access** controls what users can do within organizations

## Database Design

### Core Entities

#### Users Table
```typescript
{
  id: string (Primary Key, from Clerk)
  name: string
  imageUrl: string  
  email: string (Unique)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Organizations Table  
```typescript
{
  id: string (Primary Key, from Clerk)
  name: string
  imageUrl: string | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Job Listings Table
```typescript
{
  id: string (Primary Key, generated)
  organizationId: string (Foreign Key)
  title: string
  description: text
  wage: number | null
  wageInterval: 'hourly' | 'monthly' | 'yearly' | null
  stateAbbreviation: string | null
  city: string | null
  isFeatured: boolean (default: false)
  locationRequirement: 'on-site' | 'hybrid' | 'remote'
  experienceLevel: 'junior' | 'mid-level' | 'senior'
  status: 'draft' | 'published' | 'delisted' (default: 'draft')
  type: 'internship' | 'part-time' | 'full-time'
  postedAt: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Supporting Tables

#### Job Listing Applications
- Links job seekers to job listings they've applied for
- Tracks application status and timestamps

#### User Settings
- **UserNotificationSettings**: Email/notification preferences
- **UserResume**: Resume data and files
- **OrganizationUserSettings**: User preferences per organization

### Database Relationships
- **One-to-Many**: Organization → Job Listings
- **One-to-Many**: Job Listing → Applications  
- **One-to-One**: User → Resume, Notification Settings
- **Many-to-Many**: Users ↔ Organizations (via Clerk)

### Indexing Strategy
- **Primary Keys**: All tables have efficient primary keys
- **Foreign Keys**: Properly indexed for join performance
- **Geographic**: Index on `stateAbbreviation` for location filtering
- **Status Queries**: Indexes support common filtering patterns

## Authentication Flow

### Clerk Integration
Dune uses Clerk for comprehensive authentication and organization management:

#### User Authentication
1. **Sign Up/Sign In**: Handled entirely by Clerk's UI components
2. **Session Management**: Clerk maintains user sessions
3. **Multi-factor Auth**: Available through Clerk configuration
4. **Social Logins**: Can be configured in Clerk dashboard

#### Organization Management
1. **Organization Creation**: Users can create organizations in Clerk
2. **Member Invitations**: Invite users to join organizations
3. **Role Management**: Admin, member roles within organizations
4. **Organization Switching**: Users can switch between organizations

### Webhook Synchronization
Critical for keeping local database in sync with Clerk:

#### User Webhooks
- **user.created**: Creates local user record with notification settings
- **user.updated**: Updates user information
- **user.deleted**: Removes user and associated data

#### Organization Webhooks  
- **organization.created**: Creates local organization record
- **organization.updated**: Updates organization information
- **organization.deleted**: Removes organization and cascades to job listings

### Middleware Protection
```typescript
// src/middleware.ts
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/',
  '/api(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect() // Requires authentication
  }
})
```

### Permission System
- **Job Seekers**: Can view all job listings, manage own applications
- **Organization Members**: Can view their organization's job listings
- **Organization Admins**: Can create/edit job listings, manage organization

## Development Workflow

### Environment Setup

#### Prerequisites
```bash
Node.js 18+ 
PostgreSQL 17+
npm or yarn
```

#### Local Development Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd Dune

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Configure database and Clerk credentials

# 4. Start local database
docker-compose up -d

# 5. Run database migrations
npm run db:migrate

# 6. Start development server
npm run dev

# 7. (Optional) Start Inngest background jobs
npm run inngest
```

#### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=dune

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### Database Development Workflow

#### Schema Changes
```bash
# 1. Modify schema files in src/app/drizzle/schema/
# 2. Generate migration
npm run db:generate

# 3. Review generated migration in src/app/drizzle/migrations/
# 4. Apply migration
npm run db:migrate

# 5. (Optional) Open Drizzle Studio to inspect data
npm run db:studio
```

#### Migration Best Practices
- **Always review** generated migrations before applying
- **Test migrations** on development data first
- **Backup production** before applying migrations
- **Rollback plan** for each migration

### Testing Strategy

#### Current State
- No automated tests currently implemented
- Manual testing through development server
- Database testing through Drizzle Studio

#### Recommended Testing Setup
```bash
# Unit Tests
npm install --save-dev vitest @testing-library/react

# Integration Tests  
npm install --save-dev playwright

# Database Tests
npm install --save-dev @testcontainers/postgresql
```

### Code Quality Tools

#### Linting
```bash
npm run lint              # Run ESLint
npm run lint:fix         # Auto-fix issues
```

#### Type Checking
```bash
npx tsc --noEmit         # Check TypeScript without building
```

#### Formatting (Recommended)
```bash
npm install --save-dev prettier
```

## Feature Organization

### Feature-Based Structure
Each business domain has its own feature directory:

```
src/features/
├── jobListings/
│   ├── action/           # Server actions
│   ├── components/       # UI components
│   ├── db/              # Database operations
│   ├── lib/             # Utilities
│   └── util/            # Helper functions
├── organizations/
└── users/
```

### Job Listings Feature

#### Components
- **JobListingForm**: Create/edit job listings with validation
- **JobListingBadges**: Display job metadata (remote, salary, etc.)
- **JobListingFilterForm**: Search and filter job listings
- **StateSelectItems**: US state selection component

#### Server Actions
```typescript
// src/features/jobListings/action/actions.ts
export async function createJobListing(data: JobListingFormData)
export async function updateJobListing(id: string, data: JobListingFormData)
export async function deleteJobListing(id: string)
export async function publishJobListing(id: string)
```

#### Database Operations
```typescript
// src/features/jobListings/db/jobListings.ts
export async function getJobListings(filters: JobListingFilters)
export async function getJobListingById(id: string)
export async function getJobListingsByOrganization(orgId: string)
```

#### Validation Schema
```typescript
// src/features/jobListings/action/schema.ts
export const JobListingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(50),
  wage: z.number().positive().optional(),
  wageInterval: z.enum(['hourly', 'monthly', 'yearly']).optional(),
  locationRequirement: z.enum(['on-site', 'hybrid', 'remote']),
  experienceLevel: z.enum(['junior', 'mid-level', 'senior']),
  type: z.enum(['internship', 'part-time', 'full-time']),
  // ... more fields
})
```

### Organizations Feature
- **Database operations** for organization CRUD
- **Components** for organization management UI
- **Clerk integration** for organization synchronization

### Users Feature  
- **User settings** management
- **Resume handling** and storage
- **Notification preferences**

## API Design

### REST Endpoints

#### Public Endpoints
- `GET /api/job-listings` - List published job listings
- `GET /api/job-listings/[id]` - Get specific job listing

#### Protected Endpoints  
- `POST /api/job-listings` - Create job listing (requires organization membership)
- `PUT /api/job-listings/[id]` - Update job listing (requires ownership)
- `DELETE /api/job-listings/[id]` - Delete job listing (requires ownership)

#### Webhook Endpoints
- `POST /api/inngest` - Inngest webhook handler
- `POST /api/clerk/webhooks` - Clerk webhook handler (user/org sync)

### Server Actions
Next.js Server Actions provide type-safe, direct database operations:

```typescript
// Direct database mutations without API layer
async function createJobListing(formData: FormData) {
  'use server'
  
  const session = await auth()
  // Validate permissions
  // Process data
  // Update database
  // Revalidate cache
}
```

### Response Patterns
```typescript
type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
  message?: string
}
```

## Deployment Guide

### Production Environment

#### Vercel Deployment (Recommended)
```bash
# 1. Connect GitHub repository to Vercel
# 2. Configure environment variables in Vercel dashboard
# 3. Set up production database (Neon, Supabase, or RDS)
# 4. Deploy automatically on push to main branch
```

#### Environment Variables for Production
```env
# Database (Production)
DATABASE_URL=postgresql://user:pass@host:port/db

# Clerk (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Domain Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

#### Database Setup
```bash
# 1. Create production PostgreSQL database
# 2. Run migrations
npm run db:migrate

# 3. Verify schema
npm run db:studio
```

### Docker Deployment
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

### Monitoring & Observability

#### Recommended Tools
- **Error Tracking**: Sentry or Rollbar
- **Performance**: Vercel Analytics or Google Analytics
- **Database**: PostgreSQL built-in monitoring
- **Uptime**: Pingdom or UptimeRobot

#### Health Checks
```typescript
// pages/api/health.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  })
}
```

## Current Issues & Improvements

### Identified Issues

#### 1. Build Problems
**Issue**: Google Fonts fetch failures during build
```
Failed to fetch `Montserrat` from Google Fonts
Failed to fetch `Space Grotesk` from Google Fonts
```

**Solution**: 
```typescript
// Switch to local fonts or font fallbacks
const montserrat = localFont({
  src: './fonts/Montserrat-Variable.woff2',
  variable: '--font-montserrat',
})
```

#### 2. Unused Imports/Code
**Issue**: ESLint warnings for unused imports
- Sidebar components in employer layout
- Various utility functions

**Solution**: Clean up unused imports or implement planned features

#### 3. Incomplete Features
**Issue**: Some components reference unimplemented functionality
- Pricing plan enforcement
- Advanced job filtering
- Resume upload system

#### 4. Error Handling
**Issue**: Limited error handling and user feedback
**Solution**: Implement comprehensive error boundaries and user-friendly error messages

### Performance Improvements

#### 1. Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_job_listings_status_posted ON job_listings(status, posted_at);
CREATE INDEX idx_job_listings_location ON job_listings(state_abbreviation, city);
CREATE INDEX idx_job_listings_type_experience ON job_listings(type, experience_level);
```

#### 2. Caching Strategy
```typescript
// Implement Redis caching for job listings
import { cache } from 'react'

export const getJobListings = cache(async (filters: JobListingFilters) => {
  // Database query with caching
})
```

#### 3. Image Optimization
```typescript
// Optimize organization and user images
import Image from 'next/image'

<Image
  src={organization.imageUrl}
  alt={organization.name}
  width={64}
  height={64}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Security Enhancements

#### 1. Input Validation
```typescript
// Strengthen server-side validation
export const JobListingSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s-_.]+$/, "Title contains invalid characters"),
  // ... more validation
})
```

#### 2. Rate Limiting
```typescript
// Implement rate limiting for API endpoints
import { Ratelimit } from "@upstash/ratelimit"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})
```

#### 3. CSRF Protection
```typescript
// Add CSRF tokens for forms
import { csrf } from '@/lib/csrf'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await csrf(req, res)
  // Handle request
}
```

### Feature Roadmap

#### Phase 1: Core Stability
- [ ] Fix Google Fonts build issues
- [ ] Complete error handling implementation
- [ ] Add comprehensive input validation
- [ ] Implement missing UI components

#### Phase 2: Enhanced Functionality  
- [ ] Advanced job search and filtering
- [ ] Resume upload and parsing
- [ ] Email notifications for applications
- [ ] Pricing plan feature enforcement

#### Phase 3: Analytics & Growth
- [ ] Admin dashboard with analytics
- [ ] Job performance metrics
- [ ] A/B testing infrastructure
- [ ] SEO optimization for job listings

#### Phase 4: Scale & Performance
- [ ] Implement caching layer
- [ ] Database query optimization
- [ ] CDN for static assets
- [ ] Background job processing improvements

This comprehensive guide should give you a complete understanding of how the Dune SaaS application works, from the high-level architecture down to specific implementation details. Each section can be expanded further based on your specific interests or areas where you'd like to dive deeper.