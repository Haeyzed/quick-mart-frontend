"use client"

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Checkmark, ChevronDown } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { DatePicker } from '@/components/date-picker'

const languages = [
  { label: 'English', value: 'en' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Russian', value: 'ru' },
  { label: 'Japanese', value: 'ja' },
  { label: 'Korean', value: 'ko' },
  { label: 'Chinese', value: 'zh' },
] as const

const accountFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter your name.')
    .min(2, 'Name must be at least 2 characters.')
    .max(30, 'Name must not be longer than 30 characters.'),
  dob: z.date({ required_error: 'Please select your date of birth.' }),
  language: z.string({ required_error: 'Please select a language.' }),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
  name: '',
}

export function AccountForm() {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })

  function onSubmit(data: AccountFormValues) {
    showSubmittedData(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
      <FieldGroup>
        <Controller
          control={form.control}
          name='name'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='account-name'>Name</FieldLabel>
              <FieldContent>
                <Input
                  id='account-name'
                  placeholder='Your name'
                  {...field}
                  data-invalid={!!fieldState.error}
                />
                <FieldDescription>
                  This is the name that will be displayed on your profile and in
                  emails.
                </FieldDescription>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='dob'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='account-dob'>Date of birth</FieldLabel>
              <FieldContent>
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  placeholder='Pick a date'
                />
                <FieldDescription>
                  Your date of birth is used to calculate your age.
                </FieldDescription>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='language'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='account-language'>Language</FieldLabel>
              <FieldContent>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id='account-language'
                      variant='outline'
                      role='combobox'
                      className={cn(
                        'w-[200px] justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : 'Select language'}
                      <HugeiconsIcon icon={ChevronDown} className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[200px] p-0'>
                    <Command>
                      <CommandInput placeholder='Search language...' />
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {languages.map((language) => (
                            <CommandItem
                              value={language.label}
                              key={language.value}
                              onSelect={() => {
                                form.setValue('language', language.value)
                              }}
                            >
                              <HugeiconsIcon
                                icon={Checkmark}
                                className={cn(
                                  'size-4',
                                  language.value === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {language.label}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FieldDescription>
                  This is the language that will be used in the dashboard.
                </FieldDescription>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>
      <Button type='submit'>Update account</Button>
    </form>
  )
}

