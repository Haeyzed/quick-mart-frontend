"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

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
  ...inputProps
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("")

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === delimiter) {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value[value.length - 1])
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

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove))
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
    <div
      className={cn(
        "dark:bg-input/30 border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive dark:has-aria-invalid:border-destructive/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent bg-clip-padding px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:ring-[3px] has-aria-invalid:ring-[3px]",
        className
      )}
      data-invalid={inputProps['aria-invalid'] === 'true' || inputProps['aria-invalid'] === true ? '' : undefined}
    >
      {value.map((tag) => (
        <div
          key={tag}
          className={cn(
            "bg-muted text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap"
          )}
        >
          {tag}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="-ml-1 opacity-50 hover:opacity-100"
            onClick={() => removeTag(tag)}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="pointer-events-none" />
          </Button>
        </div>
      ))}
      <input
        {...inputProps}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onPaste={handlePaste}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-16 flex-1 outline-none bg-transparent"
      />
    </div>
  )
}