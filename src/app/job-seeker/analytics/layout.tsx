import { ReactNode } from "react"
import AppSideBar from "@/components/sidebar/AppSideBar"
import SidebarUserButton from "@/features/users/components/SidebarUserButton"
import { JobSeekerAnalyticsSidebar } from "@/components/analytics/JobSeekerAnalyticsSidebar"
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup"
import { ArrowLeft, Brain, ClipboardPen, LayoutDashboard, Bookmark } from "lucide-react"

export default function JobSeekerAnalyticsLayout({ children }: { children: ReactNode }) {
  return (
    <AppSideBar
      content={
        <>
          <JobSeekerAnalyticsSidebar />
          <SidebarNavMenuGroup 
            items={[
              {href: "/job-seeker", icon: <ArrowLeft className="w-4 h-4" />, label: "Back to Job Board"},
              {href: "/job-seeker/ai-search", icon: <Brain className="w-4 h-4" />, label: "AI Search"},
              {href: "/job-seeker/bookmarks", icon: <Bookmark className="w-4 h-4" />, label: "Bookmarks", authStatus:"signed-in"},
              {href: "/employer", icon: <LayoutDashboard className="w-4 h-4" />, label: "Employer Portal", authStatus:"signed-in"}
            ]}
            className="mt-auto"
          />
        </>
      } 
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSideBar>
  )
}