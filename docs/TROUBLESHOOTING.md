# Dune SaaS - Troubleshooting & Improvements Guide

## Current Issues & Solutions

### 1. Critical Build Issues

#### Google Fonts Loading Failure
**Issue:** Build fails with Google Fonts fetch errors
```
Failed to fetch `Montserrat` from Google Fonts
Failed to fetch `Space Grotesk` from Google Fonts
```

**Root Cause:** Network restrictions during build prevent external font loading

**Solutions:**

**Option A: Local Fonts (Recommended)**
```typescript
// src/app/layout.tsx
import localFont from 'next/font/local'

const montserrat = localFont({
  src: [
    {
      path: './fonts/Montserrat-Variable.woff2',
      style: 'normal',
    },
  ],
  variable: '--font-montserrat',
  display: 'swap',
})

const spaceGrotesk = localFont({
  src: [
    {
      path: './fonts/SpaceGrotesk-Variable.woff2', 
      style: 'normal',
    },
  ],
  variable: '--font-space-grotesk',
  display: 'swap',
})

// Download fonts from Google Fonts and place in src/app/fonts/
```

**Option B: Font Fallbacks**
```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'arial'], // Graceful fallback
})

// Update CSS variables to use fallback fonts
```

**Option C: CDN Fonts**
```html
<!-- Add to src/app/layout.tsx head -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300..700&family=Space+Grotesk:wght@300..700&display=swap"
  rel="stylesheet"
/>
```

#### Inngest CLI Installation Failure
**Issue:** Network timeout when installing inngest-cli
```
npm error FetchError: request to https://cli.inngest.com/artifact/... failed
```

**Solution:**
```bash
# Option 1: Skip post-install scripts
npm install --ignore-scripts

# Option 2: Install inngest-cli separately when network allows
npm install -g inngest-cli

# Option 3: Use Inngest cloud instead of local development
# Update scripts in package.json to point to cloud instance
```

### 2. Code Quality Issues

#### Unused Imports and Variables
**Current ESLint Warnings:**
```
- 'Sidebar' is defined but never used
- 'SidebarContent' is defined but never used  
- 'getNextJobListingStatus' is defined but never used
- Various component imports not yet implemented
```

**Solutions:**
```typescript
// Clean up unused imports
// src/app/employer/layout.tsx
// Remove unused Sidebar components or implement planned functionality

// Add ESLint ignore for planned features
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getNextJobListingStatus } from './utils' // TODO: Implement status workflow

// Or implement the missing functionality
export function JobListingStatusButton({ currentStatus }: { currentStatus: string }) {
  const nextStatus = getNextJobListingStatus(currentStatus)
  return <Button>Move to {nextStatus}</Button>
}
```

#### Incomplete Feature Implementation
**Issues Found:**
- Sidebar components imported but not rendered
- Job listing status transitions not implemented
- Pricing plan enforcement missing
- Resume upload system incomplete

**Prioritized Fixes:**

**1. Implement Sidebar (High Priority)**
```typescript
// src/app/employer/layout.tsx
export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <OrganizationSwitcher />
            </SidebarHeader>
            <nav>
              <SidebarNavigationItems />
            </nav>
          </SidebarContent>
          <SidebarFooter>
            <UserButton />
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          <SidebarTrigger />
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
```

**2. Job Status Workflow (Medium Priority)**
```typescript
// src/features/jobListings/lib/statusWorkflow.ts
export function getNextJobListingStatus(current: JobListingStatus): JobListingStatus | null {
  const workflow = {
    'draft': 'published',
    'published': 'delisted', 
    'delisted': 'published',
  }
  return workflow[current] || null
}

export function canTransitionStatus(
  current: JobListingStatus, 
  next: JobListingStatus,
  userRole: string
): boolean {
  // Implement business rules for status transitions
  return true // Placeholder
}
```

### 3. Performance Optimizations

#### Database Query Optimization
**Current Issues:**
- Missing indexes on commonly queried fields
- Potential N+1 queries in job listings
- No pagination implemented
- Large result sets without limits

**Solutions:**

**Add Database Indexes:**
```sql
-- Add to migration file
CREATE INDEX idx_job_listings_published ON job_listings(status, posted_at) 
  WHERE status = 'published';

CREATE INDEX idx_job_listings_location ON job_listings(state_abbreviation, city)
  WHERE status = 'published';

CREATE INDEX idx_job_listings_search ON job_listings 
  USING gin(to_tsvector('english', title || ' ' || description))
  WHERE status = 'published';

CREATE INDEX idx_applications_user ON job_listing_applications(user_id);
CREATE INDEX idx_applications_job ON job_listing_applications(job_listing_id);
```

**Implement Pagination:**
```typescript
// src/features/jobListings/db/jobListings.ts
export async function getJobListings({
  page = 1,
  limit = 20,
  filters = {}
}: {
  page?: number
  limit?: number  
  filters?: JobListingFilters
}) {
  const offset = (page - 1) * limit
  
  const [jobs, totalCount] = await Promise.all([
    db.select()
      .from(JobListingTable)
      .where(buildWhereClause(filters))
      .orderBy(desc(JobListingTable.postedAt))
      .limit(limit)
      .offset(offset),
    
    db.select({ count: sql<number>`count(*)` })
      .from(JobListingTable)
      .where(buildWhereClause(filters))
  ])
  
  return {
    jobs,
    totalCount: totalCount[0].count,
    totalPages: Math.ceil(totalCount[0].count / limit),
    currentPage: page,
  }
}
```

**Optimize Queries with Relations:**
```typescript
// Avoid N+1 queries by including relations
export async function getJobListingsWithOrganizations() {
  return db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, 'published'),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        }
      }
    },
    orderBy: desc(JobListingTable.postedAt),
    limit: 50,
  })
}
```

#### Frontend Performance
**Current Issues:**
- Large bundle size from dependencies
- No code splitting implemented
- Images not optimized
- No caching strategy

**Solutions:**

**Bundle Optimization:**
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['images.clerk.dev'], // Clerk avatar images
  },
}
```

**Code Splitting:**
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'

const MarkdownEditor = dynamic(
  () => import('@/components/markdown/MarkdownEditor'),
  { 
    loading: () => <div>Loading editor...</div>,
    ssr: false, // Editor doesn't need SSR
  }
)

const JobListingForm = dynamic(
  () => import('@/features/jobListings/components/JobListingForm'),
  { loading: () => <FormSkeleton /> }
)
```

**Image Optimization:**
```typescript
// Use Next.js Image component
import Image from 'next/image'

export function OrganizationAvatar({ organization }: { organization: Organization }) {
  return (
    <Image
      src={organization.imageUrl || '/default-org.png'}
      alt={organization.name}
      width={48}
      height={48}
      className="rounded-lg"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Sx14b6bk+h0R+Sx14b6bk+h0R+Sx1rQqGLPnm8lAFsW+zNYCJ95ySF3n..."
    />
  )
}
```

### 4. Security Enhancements

#### Input Validation Strengthening
**Current State:** Basic Zod validation exists but needs enhancement

**Improvements:**
```typescript
// src/features/jobListings/action/schema.ts
export const JobListingSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .regex(/^[\w\s\-.,()&]+$/, "Title contains invalid characters")
    .transform(str => str.trim()),
    
  description: z.string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description too long")
    .transform(str => str.trim()),
    
  wage: z.coerce.number()
    .positive("Wage must be positive")
    .max(1000000, "Wage too high")
    .optional(),
    
  email: z.string()
    .email("Invalid email format")
    .toLowerCase()
    .optional(),
    
  // Sanitize URLs
  website: z.string()
    .url("Invalid website URL")
    .refine(url => url.startsWith('https://'), "Website must use HTTPS")
    .optional(),
})

// Add server-side rate limiting
// src/lib/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests per 10 seconds
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier)
  
  if (!success) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.round((reset - Date.now()) / 1000)} seconds`)
  }
  
  return { limit, reset, remaining }
}
```

#### CSRF Protection
```typescript
// src/lib/csrf.ts
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

export async function verifyCSRFToken(token: string): Promise<boolean> {
  const cookieStore = cookies()
  const storedToken = cookieStore.get('csrf-token')?.value
  return storedToken === token && token.length === 64
}

// Use in server actions
export async function createJobListing(formData: FormData) {
  'use server'
  
  const csrfToken = formData.get('csrf-token') as string
  if (!await verifyCSRFToken(csrfToken)) {
    throw new Error('Invalid CSRF token')
  }
  
  // Continue with business logic...
}
```

### 5. Error Handling Improvements

#### Global Error Boundaries
```typescript
// src/app/error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong!</h1>
            <p className="text-gray-600 mt-2">
              {error.message || 'An unexpected error occurred'}
            </p>
            {error.digest && (
              <p className="text-sm text-gray-400 mt-1">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

// src/components/ErrorBoundary.tsx
'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="text-red-600 mt-1">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

#### Improved Server Action Error Handling
```typescript
// src/lib/actionHelpers.ts
export type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown }

export function withErrorHandling<T extends any[], R>(
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<ActionResult<R>> => {
    try {
      const data = await action(...args)
      return { success: true, data }
    } catch (error) {
      console.error('Action error:', error)
      
      if (error instanceof Error) {
        return { 
          success: false, 
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      }
      
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      }
    }
  }
}

// Usage in server actions
export const createJobListing = withErrorHandling(async (formData: FormData) => {
  // Existing logic here
  // If any error occurs, it's automatically caught and formatted
})
```

### 6. Feature Completeness

#### Resume Upload System
```typescript
// src/features/users/components/ResumeUpload.tsx
'use client'

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'

export function ResumeUpload() {
  const [uploading, setUploading] = useState(false)
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: async (files) => {
      if (files.length === 0) return
      
      setUploading(true)
      const formData = new FormData()
      formData.append('resume', files[0])
      
      try {
        const result = await uploadResume(formData)
        if (result.success) {
          // Show success message
        } else {
          // Show error message
        }
      } finally {
        setUploading(false)
      }
    }
  })

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
    >
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading...</p>
      ) : (
        <div>
          <p>Drop your resume here, or click to select</p>
          <p className="text-sm text-gray-500">PDF, DOC, or DOCX (max 5MB)</p>
        </div>
      )}
    </div>
  )
}

// Server action for upload
export async function uploadResume(formData: FormData): Promise<ActionResult<string>> {
  'use server'
  
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  
  const file = formData.get('resume') as File
  if (!file) throw new Error('No file provided')
  
  // Validate file type and size
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type')
  }
  
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large')
  }
  
  // Upload to storage (S3, Supabase, etc.)
  const fileUrl = await uploadFileToStorage(file, `resumes/${userId}`)
  
  // Save to database
  await db.insert(UserResumeTable).values({
    userId,
    fileName: file.name,
    fileUrl,
    fileSize: file.size,
    uploadedAt: new Date(),
  }).onConflictDoUpdate({
    target: UserResumeTable.userId,
    set: {
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      uploadedAt: new Date(),
    }
  })
  
  revalidatePath('/profile')
  return { success: true, data: fileUrl }
}
```

#### Job Application System
```typescript
// src/features/applications/action/actions.ts
export async function submitJobApplication(
  jobListingId: string, 
  formData: FormData
): Promise<ActionResult<string>> {
  'use server'
  
  const { userId } = await auth()
  if (!userId) throw new Error('Must be signed in to apply')
  
  // Check if user already applied
  const existingApplication = await db.query.JobListingApplicationTable.findFirst({
    where: and(
      eq(JobListingApplicationTable.jobListingId, jobListingId),
      eq(JobListingApplicationTable.userId, userId)
    )
  })
  
  if (existingApplication) {
    throw new Error('You have already applied to this job')
  }
  
  // Validate job listing exists and is published
  const jobListing = await db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.status, 'published')
    )
  })
  
  if (!jobListing) {
    throw new Error('Job listing not found or not available')
  }
  
  // Parse application data
  const applicationData = ApplicationSchema.parse({
    coverLetter: formData.get('coverLetter'),
    // Additional fields
  })
  
  // Create application
  const application = await db.insert(JobListingApplicationTable).values({
    id: generateId(),
    jobListingId,
    userId,
    status: 'pending',
    coverLetter: applicationData.coverLetter,
    appliedAt: new Date(),
  }).returning()
  
  // Send notification to employer (via Inngest)
  await inngest.send({
    name: 'application/submitted',
    data: {
      applicationId: application[0].id,
      jobListingId,
      userId,
    }
  })
  
  revalidatePath(`/job-listings/${jobListingId}`)
  return { success: true, data: application[0].id }
}
```

## Testing Strategy Implementation

### Unit Tests Setup
```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom

# Create test configuration
# vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Example Tests
```typescript
// src/features/jobListings/lib/formatters.test.ts
import { describe, it, expect } from 'vitest'
import { formatWageInterval, formatJobType } from './formatters'

describe('Job Listing Formatters', () => {
  describe('formatWageInterval', () => {
    it('should format wage intervals correctly', () => {
      expect(formatWageInterval('hourly')).toBe('Hourly')
      expect(formatWageInterval('yearly')).toBe('Yearly')
      expect(formatWageInterval('monthly')).toBe('Monthly')
    })
  })

  describe('formatJobType', () => {
    it('should format job types correctly', () => {
      expect(formatJobType('full-time')).toBe('Full-time')
      expect(formatJobType('part-time')).toBe('Part-time')
      expect(formatJobType('internship')).toBe('Internship')
    })
  })
})

// src/features/jobListings/components/JobListingForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { JobListingForm } from './JobListingForm'

describe('JobListingForm', () => {
  it('should render form fields', () => {
    render(<JobListingForm />)
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create job listing/i })).toBeInTheDocument()
  })

  it('should show validation errors for invalid input', async () => {
    render(<JobListingForm />)
    
    const submitButton = screen.getByRole('button', { name: /create job listing/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/title must be at least 3 characters/i)).toBeInTheDocument()
    })
  })
})
```

This comprehensive troubleshooting and improvements guide addresses all the current issues in the Dune SaaS application and provides concrete solutions with code examples. It covers everything from critical build fixes to performance optimizations and feature completeness improvements.