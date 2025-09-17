"use client"

import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { useState, useTransition } from "react"
import { toggleJobBookmark } from "../actions/actions"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

interface BookmarkButtonProps {
  jobListingId: string
  initialBookmarked?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

export function BookmarkButton({ 
  jobListingId, 
  initialBookmarked = false,
  variant = "outline",
  size = "sm"
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked)
  const [isPending, startTransition] = useTransition()
  const { isSignedIn } = useUser()

  const handleToggle = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to bookmark jobs")
      return
    }

    startTransition(async () => {
      const result = await toggleJobBookmark(jobListingId)
      if (result.error) {
        toast.error(result.message)
      } else {
        setBookmarked(result.bookmarked ?? false)
        toast.success(result.message)
      }
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className="gap-2"
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4 text-blue-600" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {size !== "icon" && (bookmarked ? "Bookmarked" : "Bookmark")}
    </Button>
  )
}
