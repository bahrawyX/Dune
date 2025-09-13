import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";     
import { ReactNode } from "react";
import { AppSidebarClient } from "./_AppSidebarClient";
// Removed auth imports - no longer checking for onboarding

export default async function AppSideBar({content, footerButton, children}: {content: ReactNode, footerButton: ReactNode, children: ReactNode}    ) {
  // Removed onboarding check - users go directly to main app after sign-in
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
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {footerButton}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>

            </Sidebar>
            <main className="flex-1 ">
              {children}
            </main>
        </AppSidebarClient>
      </SidebarProvider>

    </>
  );
}
