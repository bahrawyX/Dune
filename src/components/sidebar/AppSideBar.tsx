import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";     
import { ReactNode } from "react";
import { AppSidebarClient } from "./_AppSidebarClient";
import Link from "next/link";
// Removed auth imports - no longer checking for onboarding

export default async function AppSideBar({content, footerButton, children}: {content: ReactNode, footerButton: ReactNode, children: ReactNode}    ) {
  // Removed onboarding check - users go directly to main app after sign-in
  return (
    <>
      <SidebarProvider>
        <AppSidebarClient>
            <Sidebar collapsible="icon" className="overflow-hidden">
              <SidebarHeader className="flex-row items-center">
                <SidebarTrigger />
                <Link href="/" className="text-lg text-nowrap noize hover:opacity-80 transition-opacity">
                  Dune Inc.
                </Link>
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
            <main className="flex-1 overflow-auto">
              {children}
            </main>
        </AppSidebarClient>
      </SidebarProvider>

    </>
  );
}
