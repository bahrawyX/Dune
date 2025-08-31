import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { HomeIcon, LogInIcon } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Suspense } from "react";
import SignedOutStatus from "@/services/clerk/components/SignedOutStatus";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
import { AppSidebarClient } from "./_AppSidebarClient";

export default function Home() {
  return (
    <>
      <SidebarProvider className="overflow-y-hidden">
        <AppSidebarClient>
            <Sidebar collapsible="icon" className="overflow-hidden">
              <SidebarHeader className="flex-row items-center">
                <SidebarTrigger />
                <span className="text-xl mt-[1px] text-nowrap">Lamine Inc.</span>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                <SidebarMenu>
                  <Suspense>
                  <SignedOutStatus>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="cursor-pointer">
                      <Link href="/sign-in">
                        <LogInIcon className="w-4 h-4" />
                        Sign In
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>      
                  </SignedOutStatus>
                  </Suspense>
                </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarUserButton />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>

            </Sidebar>
            <main className="flex-1 ">
              Main Content
            </main>
        </AppSidebarClient>
      </SidebarProvider>

    </>
  );
}
