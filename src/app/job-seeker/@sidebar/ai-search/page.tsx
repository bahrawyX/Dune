import React from 'react'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '@/components/ui/sidebar'
import { Bot, Lightbulb, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const presets = [
  'Senior React engineer seeking remote roles building dashboards and design systems.',
  'Data analyst with Python/SQL looking for fintech roles with mentorship.',
  'AI/ML engineer focused on RAG/vector search at startups.'
]

export default function AiSearchSidebar() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className='flex items-center gap-2'>
        <Bot className='w-4 h-4'/> AI Search
      </SidebarGroupLabel>
      <SidebarGroupContent className='space-y-4'>
        <div className='rounded-md border p-2 text-xs flex items-start gap-2'>
          <p>Describe your skills, preferred stack, seniority, location, and company size to get better matches.</p>
      </div>
        <div className='space-y-2'>
          <div className='text-xs text-muted-foreground flex items-center gap-2'>
            <Sparkles className='w-3.5 h-3.5'/> Try a preset
          </div>
          <div className='flex flex-col gap-2 text-sm'>
            {presets.map((p, i) => (
              <Button asChild key={i} variant='secondary' size='sm' className='justify-start h-auto whitespace-normal'>
                <Link className='' href={`/job-seeker/ai-search?preset=${encodeURIComponent(p)}`}>
                  <p className='line-clamp-3 text-[13px] space-grotesk p-1'>
                    {p}
                  </p>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}