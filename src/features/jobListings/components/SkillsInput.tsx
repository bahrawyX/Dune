"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { useState, KeyboardEvent } from "react"

interface SkillsInputProps {
  value: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
  className?: string
}

export function SkillsInput({ 
  value = [], 
  onChange, 
  placeholder = "Add skills...",
  className 
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("")

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim()
    if (trimmedSkill && !value.includes(trimmedSkill)) {
      onChange([...value, trimmedSkill])
    }
    setInputValue("")
  }

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill(inputValue)
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1])
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((skill, index) => (
          <Badge key={index} variant="secondary" className="pr-1">
            {skill}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-1 ml-1 hover:bg-transparent"
              onClick={() => removeSkill(skill)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="focus-visible:ring-0"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Press Enter or comma to add skills. Click × to remove.
      </p>
    </div>
  )
}
