import dynamic from "next/dynamic";

export const MarkdownEditor = dynamic(() => import("./_MarkdownEditor.tsx"), { ssr: false })

