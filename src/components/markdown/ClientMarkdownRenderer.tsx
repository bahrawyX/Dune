"use client"

import { cn } from "@/lib/utils"
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote"
import { serialize } from "next-mdx-remote/serialize"
import remarkGfm from "remark-gfm"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const markdownClassNames =
  "max-w-none prose prose-neutral dark:prose-invert font-sans"

interface ClientMarkdownRendererProps {
  source: string
  className?: string
}

export function ClientMarkdownRenderer({
  source,
  className,
}: ClientMarkdownRendererProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function serializeMarkdown() {
      try {
        setIsLoading(true)
        const serialized = await serialize(source, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        })
        setMdxSource(serialized)
      } catch (error) {
        console.error("Error serializing markdown:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (source) {
      serializeMarkdown()
    } else {
      setIsLoading(false)
    }
  }, [source])

  if (isLoading) {
    return (
      <div className={cn(markdownClassNames, className)}>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  if (!mdxSource) {
    return (
      <div className={cn(markdownClassNames, className)}>
        <p className="text-muted-foreground">No content available</p>
      </div>
    )
  }

  return (
    <div className={cn(markdownClassNames, className)}>
      <MDXRemote {...mdxSource} />
    </div>
  )
}