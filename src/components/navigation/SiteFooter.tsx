"use client"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="relative isolate 0 bg-zinc-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="border-t border-white/10" />
        <div className="grid gap-8 md:grid-cols-5 py-10">
          <div className="md:col-span-2 space-y-3">
            <div className="text-lg font-semibold tracking-tight">Dune Inc.</div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Crafting exceptional digital experiences. Clean design, fast performance, and thoughtful UX.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-6 md:col-span-3 md:grid-cols-3 text-sm">
            <div className="space-y-2">
              <div className="text-foreground/80 font-medium">Explore</div>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/job-seeker" className="hover:text-foreground transition-colors">Job Board</Link></li>
                <li><Link href="/job-seeker/ai-search" className="hover:text-foreground transition-colors">AI Search</Link></li>
                <li><Link href="/employer" className="hover:text-foreground transition-colors">Employer Portal</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-foreground/80 font-medium">Account</div>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/sign-in" className="hover:text-foreground transition-colors">Sign In</Link></li>
                <li><Link href="/job-seeker/user-settings/resume" className="hover:text-foreground transition-colors">Resume</Link></li>
                <li><Link href="/job-seeker/user-settings/notifications" className="hover:text-foreground transition-colors">Notifications</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-foreground/80 font-medium">Company</div>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
                <li><a href="#" className="pointer-events-none opacity-40">—</a></li>
                <li><a href="#" className="pointer-events-none opacity-40">—</a></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="border-t border-white/10" />
        <div className="flex items-center justify-between py-6 text-xs text-muted-foreground">
          <p>© {year} Dune Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="opacity-70">Built with Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
