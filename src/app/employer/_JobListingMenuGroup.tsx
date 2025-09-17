"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { JobListingStatus, JobListingTable } from "@/app/drizzle/schema"
import { 
  ChevronRightIcon, 
  FileText, 
  Eye, 
  EyeOff, 
  Star, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle,
  Archive
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { formatJoblistingStatus } from "@/features/jobListings/lib/formatters"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type JobListing = Pick<typeof JobListingTable.$inferSelect, "title" | "id" | "isFeatured"> & {
  applicationCount: number
  status: JobListingStatus
}

export function JobListingMenuGroup({
  status,
  jobListings,
}: {
  status: JobListingStatus
  jobListings: JobListing[]
}) {
  const { jobListingId } = useParams()

  const getStatusIcon = (status: JobListingStatus) => {
    switch (status) {
      case "published":
        return <Eye className="h-4 w-4 " />
      case "draft":
        return <FileText className="h-4 w-4 text-gray-500" />
      case "delisted":
        return <EyeOff className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadgeColor = (status: JobListingStatus) => {
    switch (status) {
      case "published":
        return "bg-featured/10 text-featured border-featured/20"
      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-200"
      case "delisted":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <SidebarMenu>
      <Collapsible
        defaultOpen={
          status !== "delisted" ||
          jobListings.find(job => job.id === jobListingId) != null
        }
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="hover:bg-muted/50">
              <div className="flex items-center gap-2 flex-1">
                {getStatusIcon(status)}
                <span className="font-medium">{formatJoblistingStatus(status)}</span>
                <Badge 
                  variant="default" 
                  className={cn("ml-auto text-xs px-2 py-0.5", getStatusBadgeColor(status))}
                >
                  {jobListings.length}
                </Badge>
              </div>
              <ChevronRightIcon className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="ml-2 border-l border-border/40">
              {jobListings.map(jobListing => (
                <JobListingMenuItem key={jobListing.id} {...jobListing} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  )
}

function JobListingMenuItem({ id, title, applicationCount, isFeatured, status }: JobListing) {
  const { jobListingId } = useParams()
  const isActive = jobListingId === id

  return (
    <SidebarMenuSubItem className="relative">
      <SidebarMenuSubButton 
        isActive={isActive} 
        asChild
        className={cn(
          "group relative pr-16 hover:bg-muted/80 transition-colors",
          isActive && "bg-primary/10 border-r-2 border-r-primary"
        )}
      >
        <Link href={`/employer/job-listings/${id}`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="truncate text-sm font-medium">{title}</span>
            {isFeatured && (
              <Star className="h-3 w-3 text-yellow-600 fill-yellow-600 shrink-0" />
            )}
          </div>
        </Link>
      </SidebarMenuSubButton>
      
      {/* Application Count Badge */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {applicationCount > 0 && (
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center",
              applicationCount > 0 && "bg-primary/10 text-primary border-primary/20",
              applicationCount > 9 && "bg-orange-100 text-orange-700 border-orange-200",
              applicationCount > 99 && "bg-red-100 text-red-700 border-red-200"
            )}
          >
            {applicationCount > 99 ? "99+" : applicationCount}
          </Badge>
        )}
        {status === "published" && applicationCount === 0 && (
          <div className="h-2 w-2 bg-muted-foreground/40 rounded-full" />
        )}
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
      )}
    </SidebarMenuSubItem>
  )
}