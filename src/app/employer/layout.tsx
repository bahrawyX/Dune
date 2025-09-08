import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { Brain, ClipboardPen, LayoutDashboard, LogInIcon, PlusIcon } from "lucide-react";
import { ReactNode, Suspense } from "react";
import SignedOutStatus from "@/services/clerk/components/SignedOutStatus";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AppSideBar from "@/components/sidebar/AppSideBar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import { SidebarOrganizationButton } from "@/features/organizations/components/SidebarOrganizationButton";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
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
              <SidebarGroupAction className="cursor-pointer flex items-center gap-2 justify-center mx-auto" title="Add Job Listing" asChild>
                <Link href="/employer/job-listings/new">
                 <PlusIcon /> <div className="sr-only">Add Job Listing</div>
                </Link>
              </SidebarGroupAction>
            </SidebarGroup>
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
