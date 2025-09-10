"use client"

import useIsDarkMode from "@/hooks/useIsDarkMode"
import { cn } from "@/lib/utils"
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  headingsPlugin,
  InsertTable,
  InsertThematicBreak,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  MDXEditorProps,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor"
import { forwardRef } from "react"

const InternalMarkdownEditor = forwardRef<MDXEditorMethods, MDXEditorProps & { className?: string }>(function InternalMarkdownEditor(
  { className, ...props },
  ref
) {
  const isDarkMode = useIsDarkMode()

  return (
    <MDXEditor
      {...props}
      ref={ref}
      className={cn(isDarkMode && "dark-theme", className)}
      suppressHtmlProcessing
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <BlockTypeSelect />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <InsertThematicBreak />
              <InsertTable />
            </>
          ),
        }),
      ]}
    />
  )
})

export default InternalMarkdownEditor