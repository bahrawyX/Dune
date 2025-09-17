"use client"

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Search, 
  Send, 
  Clock,
  Target,
  Calendar,
  Activity
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const jobSeekerAnalyticsItems = [
  {
    title: "Overview",
    href: "/job-seeker/analytics",
    icon: BarChart3,
    description: "General analytics overview"
  },
  {
    title: "Job Search Activity",
    href: "/job-seeker/analytics#activity",
    icon: Search,
    description: "Search patterns and behavior"
  },
  {
    title: "Applications Tracking",
    href: "/job-seeker/analytics#applications",
    icon: Send,
    description: "Application status and success rate"
  },
  {
    title: "Profile Views",
    href: "/job-seeker/analytics#profile",
    icon: Eye,
    description: "Who viewed your profile"
  },
  {
    title: "Time Analytics", 
    href: "/job-seeker/analytics#time",
    icon: Clock,
    description: "Time spent on platform"
  },
  {
    title: "Goal Tracking",
    href: "/job-seeker/analytics#goals",
    icon: Target,
    description: "Job search goals and progress"
  }
]

export function JobSeekerAnalyticsSidebar() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm font-semibold text-primary flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Job Search Analytics
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {jobSeekerAnalyticsItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href}>
                <div className="flex py-6 ">
                    <item.icon className="w-4 h-4" />
                    <Link href={item.href} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                        <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs space-grotesk text-muted-foreground truncate">
                            {item.description}
                        </div>
                        </div>
                    </Link>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}