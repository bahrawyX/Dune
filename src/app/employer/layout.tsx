import { SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { ClipboardPen, Loader2, PlusIcon, BarChart3 } from "lucide-react";
import { ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import AppSideBar from "@/components/sidebar/AppSideBar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import { SidebarOrganizationButton } from "@/features/organizations/components/SidebarOrganizationButton";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import AsyncIf from "@/components/AyncIf";
import { sortJobListingsByStatus } from "@/features/jobListings/util/utils";
import { db } from "../drizzle/db";
import { JobListingApplicationTable, JobListingStatus, JobListingTable } from "../drizzle/schema";
import { count, desc, eq } from "drizzle-orm";
import { JobListingMenuGroup } from "./_JobListingMenuGroup";
import { Skeleton } from "@/components/ui/skeleton";
export default async function EmployerLayout({children}: {children: ReactNode}) {
return (
  <Suspense>
    <LayoutSuspense >
      {children}
    </LayoutSuspense>
  </Suspense>
)

}

async function LayoutSuspense({children}: {children: ReactNode}) {
  const {orgId} = await getCurrentOrganization()
  if (orgId == null) {
    redirect("/organizations/select")
  }
  return (
    <>
      <AppSideBar
       content={
            <>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground">
                Job Listings
              </SidebarGroupLabel>
                <AsyncIf  
                  condition={() => hasOrgUserPermission("job_listings:create")} 
                  loadingFallback={<Loader2 className='size-4 animate-spin text-muted-foreground' />} 
                  otherwise={null}
                >
                  <SidebarGroupAction 
                    className="cursor-pointer flex items-center gap-2 justify-center mx-auto hover:bg-primary/10 transition-colors rounded-md p-1" 
                    title="Add Job Listing" 
                    asChild
                  >
                    <Link href="/employer/job-listings/new" className="flex items-center gap-2 text-primary hover:text-primary/80">
                      <PlusIcon className="h-4 w-4" /> 
                      <span className="sr-only">Add Job Listing</span>
                    </Link>
                  </SidebarGroupAction>
                </AsyncIf>
              </SidebarGroup>
              <SidebarGroupContent className="group-data-[state=collapsed]:hidden px-2">
                <Suspense fallback={<JobListingSkeleton />}>
                  <JobListingMenu orgId={orgId} />
                </Suspense>
              </SidebarGroupContent>
              <SidebarNavMenuGroup    
                items={[
                  {href: "/employer/analytics", icon: <BarChart3 className="w-4 h-4" />, label: "Analytics", authStatus:"signed-in"},
                  {href: "/job-seeker", icon: <ClipboardPen className="w-4 h-4" />, label: "Job Board"},
                ]}
                className="mt-auto "
              />
            </>
    } 
    footerButton={<SidebarOrganizationButton />}  >

    {children}
      </AppSideBar>
    </>
  );
}

async function JobListingMenu({ orgId }: { orgId: string }) {
  const jobListings = await getJobListings(orgId)

  if (
    jobListings.length === 0 &&
    (await hasOrgUserPermission("job_listings:create"))
  ) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/employer/job-listings/new">
              <PlusIcon />
              <span>Create your first job listing</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return Object.entries(Object.groupBy(jobListings, j => j.status))
    .sort(([a], [b]) => {
      return sortJobListingsByStatus(
        a as JobListingStatus,
        b as JobListingStatus
      )
    })
    .map(([status, jobListings]) => (
      <JobListingMenuGroup
        key={status}
        status={status as JobListingStatus}
        jobListings={jobListings}
      />
    ))
}


async function getJobListings(orgId: string) {
  const data = await db.select({
    id: JobListingTable.id,
    title: JobListingTable.title,
    status: JobListingTable.status,
    isFeatured: JobListingTable.isFeatured,
    applicationCount: count(JobListingApplicationTable.userId),
  })
  .from(JobListingTable)
  .where(eq(JobListingTable.organizationId, orgId))
  .leftJoin(JobListingApplicationTable, eq(JobListingTable.id, JobListingApplicationTable.jobListingId))
  .groupBy(JobListingTable.id)
  .orderBy(desc(JobListingTable.createdAt))
  
  return data.map(item => ({
    ...item,
    status: item.status as JobListingStatus
  }))
}

function JobListingSkeleton() {
  return (
    <div className="space-y-3 px-2">
      {/* Category Headers */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-6 rounded-full ml-auto" />
          </div>
          {/* Job Items */}
          <div className="ml-6 space-y-1">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex items-center gap-2 p-2">
                <Skeleton className="h-3 w-3 rounded" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-4 w-6 rounded-full ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
