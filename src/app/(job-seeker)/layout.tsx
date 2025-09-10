
import { Brain, ClipboardPen, LayoutDashboard, LogInIcon } from "lucide-react";
import { ReactNode, Suspense } from "react";
import SignedOutStatus from "@/services/clerk/components/SignedOutStatus";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AppSideBar from "@/components/sidebar/AppSideBar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";

export default async function JobSeekerLayout({children ,sidebar}: {children: ReactNode, sidebar: ReactNode}) {
  const { userId } = await auth()
  if (userId) {
    const user = await currentUser()
    const onboarded = Boolean((user?.unsafeMetadata as any)?.onboarded)
    if (!onboarded) {
      redirect("/onboarding")
    }
  }
  return (
    <>
      <AppSideBar
        content={
          <>
          {sidebar}
          <SidebarNavMenuGroup 
            items={[
              {href: "/", icon: <ClipboardPen className="w-4 h-4" />, label: "Job Board"},
              {href: "/ai-search", icon: <Brain className="w-4 h-4" />, label: "AI Search"},
              {href: "/employer", icon: <LayoutDashboard className="w-4 h-4" />, label: "Employer Portal" , authStatus:"signed-in"} ,
              {href: "/sign-in", icon: <LogInIcon className="w-4 h-4" />, label: "Sign In" , authStatus:"signed-out"}
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
