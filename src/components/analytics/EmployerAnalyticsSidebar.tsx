"use client"

import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Eye,
  Send,
  Building,
  Calendar,
  Target,
  Activity
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const employerAnalyticsItems = [
  {
    title: "Overview",
    href: "/employer/analytics",
    icon: BarChart3,
    description: "Organization analytics overview"
  },
  {
    title: "Job Performance",
    href: "/employer/analytics#performance",
    icon: TrendingUp,
    description: "Job listing performance metrics"
  },
  {
    title: "Application Trends",
    href: "/employer/analytics#applications",
    icon: Send,
    description: "Application flow and trends"
  },
  {
    title: "Candidate Insights",
    href: "/employer/analytics#candidates",
    icon: Users,
    description: "Candidate behavior and demographics"
  },
  {
    title: "Job Listing Analytics",
    href: "/employer/analytics#listings",
    icon: FileText,
    description: "Individual job listing performance"
  },
  {
    title: "Traffic Sources",
    href: "/employer/analytics#traffic",
    icon: Eye,
    description: "Where candidates come from"
  },
  {
    title: "Organization Metrics",
    href: "/employer/analytics#organization",
    icon: Building,
    description: "Company-wide analytics"
  }
]

export function EmployerAnalyticsSidebar() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sm font-semibold text-primary flex items-center gap-2">
        <Activity className="w-4 h-4" />
        Employer Analytics
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {employerAnalyticsItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild className="cursor-pointer my-1" isActive={pathname === item.href}>
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