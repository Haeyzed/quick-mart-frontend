"use client"

import * as React from "react"
import { MultiplicationSignIcon, X } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface TagInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  delimiter?: string
  maxTags?: number
  className?: string
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Enter tags separated by comma",
  delimiter = ",",
  maxTags,
  className,
  ...props
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === delimiter) {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    
    // Auto-add tags when delimiter is typed
    if (e.target.value.includes(delimiter)) {
      const parts = e.target.value.split(delimiter)
      const newTag = parts[0].trim()
      if (newTag) {
        addTag(newTag)
        setInputValue(parts.slice(1).join(delimiter))
      }
    }
  }

  const addTag = (tag: string) => {
    if (!tag || (maxTags && value.length >= maxTags)) return
    
    // Check if tag already exists
    if (value.includes(tag)) return
    
    onChange([...value, tag])
    setInputValue("")
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text")
    const tags = pastedText
      .split(delimiter)
      .map(tag => tag.trim())
      .filter(tag => tag && !value.includes(tag))
    
    if (tags.length > 0) {
      const newTags = [...value, ...tags]
      if (maxTags) {
        onChange(newTags.slice(0, maxTags))
      } else {
        onChange(newTags)
      }
      setInputValue("")
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-1.5 items-center rounded-md border border-input bg-background px-3 py-2 min-h-[40px]", className)}>
      {value.map((tag, index) => (
        <div
          key={index}
          className="flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-sm"
        >
          <span>{tag}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-3 w-3 p-0 hover:bg-muted"
            onClick={() => removeTag(index)}
          >
            <HugeiconsIcon icon={MultiplicationSignIcon} className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Input
        {...props}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onPaste={handlePaste}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 border-0 bg-transparent p-0 h-auto min-w-[120px] focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  )
}

