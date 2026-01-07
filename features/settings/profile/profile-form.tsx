"use client"

import { z } from 'zod'
import { useFieldArray, useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const profileFormSchema = z.object({
  username: z
    .string()
    .min(2, 'Username must be at least 2 characters.')
    .max(30, 'Username must not be longer than 30 characters.'),
  email: z.string().email('Please select an email to display.'),
  bio: z.string().max(160).min(4),
  urls: z
    .array(
      z.object({
        value: z.string().url('Please enter a valid URL.'),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<ProfileFormValues> = {
  bio: 'I own a computer.',
  urls: [
    { value: 'https://shadcn.com' },
    { value: 'http://twitter.com/shadcn' },
  ],
}

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  return (
    <form
      onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
      className='space-y-8'
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name='username'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='profile-username'>Username</FieldLabel>
              <FieldContent>
                <Input
                  id='profile-username'
                  placeholder='shadcn'
                  {...field}
                  data-invalid={!!fieldState.error}
                />
                <FieldDescription>
                  This is your public display name. It can be your real name or a
                  pseudonym. You can only change this once every 30 days.
                </FieldDescription>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='email'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='profile-email'>Email</FieldLabel>
              <FieldContent>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id='profile-email'>
                    <SelectValue placeholder='Select a verified email to display' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='m@example.com'>m@example.com</SelectItem>
                    <SelectItem value='m@google.com'>m@google.com</SelectItem>
                    <SelectItem value='m@support.com'>m@support.com</SelectItem>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  You can manage verified email addresses in your{' '}
                  <Link href='/' className='underline'>
                    email settings
                  </Link>
                  .
                </FieldDescription>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='bio'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='profile-bio'>Bio</FieldLabel>
              <FieldContent>
                <Textarea
                  id='profile-bio'
                  placeholder='Tell us a little bit about yourself'
                  className='resize-none'
                  {...field}
                  data-invalid={!!fieldState.error}
                />
                <FieldDescription>
                  You can <span>@mention</span> other users and organizations to
                  link to them.
                </FieldDescription>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <Controller
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field: fieldItem, fieldState }) => (
                <Field>
                  <FieldLabel
                    htmlFor={`profile-url-${index}`}
                    className={cn(index !== 0 && 'sr-only')}
                  >
                    URLs
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={`profile-url-${index}`}
                      {...fieldItem}
                      className={cn(index !== 0 && 'mt-1.5')}
                      data-invalid={!!fieldState.error}
                    />
                    {index === 0 && (
                      <FieldDescription>
                        Add links to your website, blog, or social media profiles.
                      </FieldDescription>
                    )}
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </FieldContent>
                </Field>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            Add URL
          </Button>
        </div>
      </FieldGroup>
      <Button type='submit'>Update profile</Button>
    </form>
  )
}

