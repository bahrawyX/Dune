import { ReactNode, Suspense } from "react"
import { redirect } from "next/navigation"
import AppSideBar from "@/components/sidebar/AppSideBar"
import { SidebarOrganizationButton } from "@/features/organizations/components/SidebarOrganizationButton"
import { EmployerAnalyticsSidebar } from "@/components/analytics/EmployerAnalyticsSidebar"
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup"
import { ArrowLeft, ClipboardPen } from "lucide-react"
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth"

export default async function EmployerAnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <LayoutSuspense>
        {children}
      </LayoutSuspense>
    </Suspense>
  )
}

async function LayoutSuspense({ children }: { children: ReactNode }) {
  const { orgId } = await getCurrentOrganization()
  
  if (orgId == null) {
    redirect("/organizations/select")
  }

  return (
    <AppSideBar
      content={
        <>
          <EmployerAnalyticsSidebar />
          <SidebarNavMenuGroup 
            items={[
              {href: "/employer", icon: <ArrowLeft className="w-4 h-4" />, label: "Back to Dashboard"},
              {href: "/job-seeker", icon: <ClipboardPen className="w-4 h-4" />, label: "Job Board"}
            ]}
            className="mt-auto"
          />
        </>
      } 
      footerButton={<SidebarOrganizationButton />}
    >
      {children}
    </AppSideBar>
  )
}