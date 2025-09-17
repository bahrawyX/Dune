
import { Brain, ClipboardPen, LayoutDashboard, LogInIcon, Bookmark } from "lucide-react";
import { ReactNode } from "react";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
// Removed auth imports - no longer checking for onboarding
import AppSideBar from "@/components/sidebar/AppSideBar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";

export default async function JobSeekerLayout({children ,sidebar}: {children: ReactNode, sidebar: ReactNode}) {
  // Removed onboarding check - users go directly to main app after sign-in
  return (
    <>
      <AppSideBar
        content={
          <>
          {sidebar}
          <SidebarNavMenuGroup 
            items={[
              {href: "/job-seeker", icon: <ClipboardPen className="w-4 h-4" />, label: "Job Board"},
              {href: "/job-seeker/ai-search", icon: <Brain className="w-4 h-4" />, label: "AI Search"},
              {href: "/job-seeker/bookmarks", icon: <Bookmark className="w-4 h-4" />, label: "Bookmarks", authStatus:"signed-in"},
              {href: "/employer", icon: <LayoutDashboard className="w-4 h-4" />, label: "Employer Portal" , authStatus:"signed-in"} ,
            ]}
            className="mt-auto "
            />
            </>
    } 
      footerButton={<SidebarUserButton />}  >
            {children}
      </AppSideBar>
    </>
  );
} 
