# Dune - Job Board SaaS Platform

**Your Way To Your Dream Job or Dream Team**

Dune is a modern, full-stack Job Board SaaS application built with Next.js 15. It's designed as a multi-tenant platform where organizations can post job listings and job seekers can browse and apply for positions.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd Dune

# Install dependencies
npm install --ignore-scripts

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start database (Docker)
docker-compose up -d

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Complete Documentation

This repository includes comprehensive documentation to help you understand every aspect of the application:

### 🎯 [Getting Started Guide](./docs/GETTING_STARTED.md)
**Perfect for new developers joining the project**
- 30-minute codebase walkthrough
- Step-by-step setup instructions
- Understanding user journeys and data flows
- Common development tasks

### 🏗️ [Complete Application Guide](./docs/README.md)
**In-depth technical overview of the entire system**
- Application architecture and design decisions
- Technology stack breakdown
- Database design and relationships
- Authentication and authorization flow
- Feature organization and API design
- Deployment strategies

### 🔧 [Technical Deep Dive](./docs/TECHNICAL_DEEP_DIVE.md)
**Detailed analysis of development workflow and constraints**
- Complete development cycle explanation
- Database schema evolution and migration strategies
- Authentication architecture with Clerk
- Business logic organization patterns
- Performance considerations and scaling strategies

### 🛠️ [Troubleshooting & Improvements](./docs/TROUBLESHOOTING.md)
**Solutions for current issues and improvement recommendations**
- Build and deployment issue fixes
- Performance optimization strategies
- Security enhancements
- Feature completion guides
- Testing implementation

## 🏃‍♂️ Quick Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate new migration
npm run db:migrate      # Apply migrations
npm run db:push         # Push schema changes
npm run db:studio       # Open database admin

# Background Jobs
npm run inngest         # Start Inngest development server
```

## 🏛️ Architecture Overview

```
┌─ Next.js 15 App Router ─────────────────────────┐
├─ Authentication (Clerk) ───────────────────────┤
├─ Database (PostgreSQL + Drizzle ORM) ──────────┤
├─ Background Jobs (Inngest) ────────────────────┤
├─ UI Components (Radix UI + Tailwind) ──────────┤
└─ Multi-tenant Organizations ───────────────────┘
```

### Key Features
- **Multi-tenant Architecture**: Organizations with role-based access
- **Modern Stack**: Next.js 15, React 19, TypeScript, Tailwind
- **Type-safe Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk with organization management
- **Background Processing**: Inngest for webhooks and async tasks
- **Rich UI**: Radix UI components with dark mode support

## 🧭 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (clerk)/           # Authentication routes
│   ├── (job-seeker)/      # Job seeker interface
│   ├── employer/          # Employer interface
│   ├── api/               # API routes and webhooks
│   └── drizzle/           # Database schema and migrations
├── components/            # Reusable UI components
├── features/              # Business logic by domain
│   ├── jobListings/       # Job posting functionality
│   ├── organizations/     # Organization management
│   └── users/             # User settings and profiles
├── services/              # External service integrations
└── docs/                  # Comprehensive documentation
```

## 🎭 User Types

### Job Seekers
- Browse published job listings
- Filter by location, type, experience level
- Apply to jobs with cover letters
- Manage application history

### Employers (Organizations)
- Create and manage organizations
- Post job listings with rich descriptions
- Review applications from candidates
- Manage team members and permissions

## 🔧 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL, Drizzle ORM, Drizzle Kit
- **Authentication**: Clerk (users + organizations)
- **Background Jobs**: Inngest
- **UI Components**: Radix UI, Lucide Icons
- **Forms**: React Hook Form, Zod validation
- **Rich Text**: MDX Editor
- **Styling**: Tailwind CSS, CSS Variables
- **Development**: ESLint, TypeScript

## 📦 Environment Setup

Key environment variables needed:

```env
# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=dune

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

See [.env.example](./.env.example) for complete configuration.

## 🤝 Contributing

1. Read the [Getting Started Guide](./docs/GETTING_STARTED.md) first
2. Check current issues in [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
3. Follow the development workflow in [Technical Deep Dive](./docs/TECHNICAL_DEEP_DIVE.md)
4. Make sure to run `npm run lint` before submitting changes

## 📖 Learning Path

1. **Start Here**: [Getting Started Guide](./docs/GETTING_STARTED.md) (30 min)
2. **Understand Architecture**: [Complete Application Guide](./docs/README.md) (1 hour)
3. **Deep Technical Knowledge**: [Technical Deep Dive](./docs/TECHNICAL_DEEP_DIVE.md) (1 hour)
4. **Fix Issues**: [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) (ongoing)

## 🚀 Deployment

The application is designed to deploy easily on modern platforms:

- **Recommended**: Vercel (automatic deployments)
- **Database**: Neon, Supabase, or AWS RDS
- **Authentication**: Clerk (handles all auth complexity)
- **Background Jobs**: Inngest Cloud

See the [deployment section](./docs/README.md#deployment-guide) in the complete guide.

---

**Ready to dive in?** Start with the [Getting Started Guide](./docs/GETTING_STARTED.md) to understand the codebase in 30 minutes!
