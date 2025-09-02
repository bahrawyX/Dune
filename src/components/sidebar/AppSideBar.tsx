import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";     
import { ReactNode } from "react";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
import { AppSidebarClient } from "./_AppSidebarClient";
import SignedInStatus from "@/services/clerk/components/SignedInStatus";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AppSideBar({content, footerButton, children}: {content: ReactNode, footerButton: ReactNode, children: ReactNode}    ) {
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
      <SidebarProvider className="overflow-y-hidden">
        <AppSidebarClient>
            <Sidebar collapsible="icon" className="overflow-hidden">
              <SidebarHeader className="flex-row items-center">
                <SidebarTrigger />
                <span className="text-lg  text-nowrap noize">Dune Inc.</span>
              </SidebarHeader>
              <SidebarContent>
                    {
                        content
                    }
              </SidebarContent>
              <SignedInStatus>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {footerButton}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
              </SignedInStatus>

            </Sidebar>
            <main className="flex-1 ">
              {children}
            </main>
        </AppSidebarClient>
      </SidebarProvider>

    </>
  );
}
