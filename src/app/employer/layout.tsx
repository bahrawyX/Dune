import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { LogInIcon } from "lucide-react";
import { ReactNode, Suspense } from "react";
import SignedOutStatus from "@/services/clerk/components/SignedOutStatus";
import SidebarUserButton from "@/features/users/components/SidebarUserButton";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AppSideBar from "@/components/sidebar/AppSideBar";

export default async function EmployerLayout({children}: {children: ReactNode}) {
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
    } 
    footerButton={<SidebarUserButton />}  >

    {children}
      </AppSideBar>
    </>
  );
}
