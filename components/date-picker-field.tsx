"use client"

import * as React from "react"
import { Calendar01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { format, parse } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field"

interface DatePickerFieldProps {
  label?: string
  description?: string
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  error?: string
  required?: boolean
}

export function DatePickerField({
  label,
  description,
  value,
  onChange,
  placeholder = "Pick a date",
  error,
  required,
}: DatePickerFieldProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? parse(value, "yyyy-MM-dd", new Date()) : undefined
  )

  React.useEffect(() => {
    if (value) {
      const parsed = parse(value, "yyyy-MM-dd", new Date())
      if (!isNaN(parsed.getTime())) {
        setDate(parsed)
      }
    } else {
      setDate(undefined)
    }
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onChange(selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined)
  }

  return (
    <Field>
      {label && (
        <FieldLabel>
          {label} {required && <span className='text-destructive'>*</span>}
        </FieldLabel>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}

