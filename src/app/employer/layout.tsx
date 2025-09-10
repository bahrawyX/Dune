import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { ClipboardPen, Loader2, PlusIcon } from "lucide-react";
import { ReactNode, Suspense } from "react";
import { redirect } from "next/navigation";
import AppSideBar from "@/components/sidebar/AppSideBar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import { SidebarOrganizationButton } from "@/features/organizations/components/SidebarOrganizationButton";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import AsyncIf from "@/components/AyncIf";
import { getNextJobListingStatus, sortJobListingsByStatus } from "@/features/jobListings/util/utils";
import { db } from "../drizzle/db";
import { JobListingApplicationTable, JobListingStatus, JobListingTable } from "../drizzle/schema";
import { count, desc, eq } from "drizzle-orm";
import { JobListingMenuGroup } from "./_JobListingMenuGroup";
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
              <SidebarGroupLabel>Job Listing</SidebarGroupLabel>
                <AsyncIf  condition={() => hasOrgUserPermission("job_listings:create")} loadingFallback={<Loader2 className='size-4 animate-spin' />} otherwise={null}>
                  <SidebarGroupAction className="cursor-pointer flex items-center gap-2 justify-center mx-auto" title="Add Job Listing" asChild>
                  <Link href="/employer/job-listings/new">
                  <PlusIcon /> <div className="sr-only">Add Job Listing</div>
                  </Link>
               </SidebarGroupAction>
                </AsyncIf>
              </SidebarGroup>
              <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
                <Suspense>
                  <JobListingMenu orgId={orgId} />
                </Suspense>
              </SidebarGroupContent>
              <SidebarNavMenuGroup    
                items={[
                  {href: "/", icon: <ClipboardPen className="w-4 h-4" />, label: "Job Board"},
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
    id:JobListingTable.id,
    title:JobListingTable.title,
    status:JobListingTable.status,
    applicationCount:count(JobListingApplicationTable.userId),

  }).from(JobListingTable).where(eq(JobListingTable.organizationId, orgId))
  .leftJoin(JobListingApplicationTable, eq(JobListingTable.id, JobListingApplicationTable.jobListingId)).
  groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id).orderBy(desc(JobListingTable.createdAt))
  return data
}
