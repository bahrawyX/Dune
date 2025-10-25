import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar'
import { BookmarkIcon, BrainIcon, ClipboardPenIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function BookmarksSidebar() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
      <SidebarGroupContent className="space-y-2">
        <Button asChild variant="outline" size="sm" className="w-full justify-start">
          <Link href="/job-seeker" className="flex items-center gap-2">
            <ClipboardPenIcon className="w-4 h-4" />
            Browse All Jobs
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="sm" className="w-full justify-start">
          <Link href="/job-seeker/ai-search" className="flex items-center gap-2">
            <BrainIcon className="w-4 h-4" />
            AI Job Search
          </Link>
        </Button>
        
        <div className="pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
            <BookmarkIcon className="w-4 h-4" />
            Bookmark Tips
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Save jobs you&apos;re interested in</p>
            <p>• Track application progress</p>
            <p>• Easy access to job details</p>
            <p>• Never lose track of opportunities</p>
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}