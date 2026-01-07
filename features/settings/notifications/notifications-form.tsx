"use client"

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'

const notificationsFormSchema = z.object({
  type: z.enum(['all', 'mentions', 'none'], {
    required_error: 'Please select a notification type.',
  }),
  mobile: z.boolean().default(false).optional(),
  communication_emails: z.boolean().default(false).optional(),
  social_emails: z.boolean().default(false).optional(),
  marketing_emails: z.boolean().default(false).optional(),
  security_emails: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

// This can come from your database or API.
const defaultValues: Partial<NotificationsFormValues> = {
  communication_emails: false,
  marketing_emails: false,
  social_emails: true,
  security_emails: true,
}

export function NotificationsForm() {
  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues,
  })

  return (
    <form
      onSubmit={form.handleSubmit((data) => showSubmittedData(data))}
      className='space-y-8'
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name='type'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='notifications-type'>Notify me about...</FieldLabel>
              <FieldContent>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='flex flex-col gap-2'
                >
                  <Field>
                    <FieldLabel
                      htmlFor='notify-all'
                      className='flex items-center font-normal'
                    >
                      <RadioGroupItem value='all' id='notify-all' />
                      <span className='ms-2'>All new messages</span>
                    </FieldLabel>
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor='notify-mentions'
                      className='flex items-center font-normal'
                    >
                      <RadioGroupItem value='mentions' id='notify-mentions' />
                      <span className='ms-2'>Direct messages and mentions</span>
                    </FieldLabel>
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor='notify-none'
                      className='flex items-center font-normal'
                    >
                      <RadioGroupItem value='none' id='notify-none' />
                      <span className='ms-2'>Nothing</span>
                    </FieldLabel>
                  </Field>
                </RadioGroup>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
        <div className='relative'>
          <h3 className='mb-4 text-lg font-medium'>Email Notifications</h3>
          <div className='space-y-4'>
            <Controller
              control={form.control}
              name='communication_emails'
              render={({ field, fieldState }) => (
                <Field orientation='horizontal'>
                  <FieldContent className='flex-1'>
                    <FieldLabel htmlFor='comm-emails' className='text-base'>
                      Communication emails
                    </FieldLabel>
                    <FieldDescription>
                      Receive emails about your account activity.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id='comm-emails'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-invalid={!!fieldState.error}
                  />
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name='marketing_emails'
              render={({ field, fieldState }) => (
                <Field orientation='horizontal'>
                  <FieldContent className='flex-1'>
                    <FieldLabel htmlFor='marketing-emails' className='text-base'>
                      Marketing emails
                    </FieldLabel>
                    <FieldDescription>
                      Receive emails about new products, features, and more.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id='marketing-emails'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-invalid={!!fieldState.error}
                  />
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name='social_emails'
              render={({ field, fieldState }) => (
                <Field orientation='horizontal'>
                  <FieldContent className='flex-1'>
                    <FieldLabel htmlFor='social-emails' className='text-base'>
                      Social emails
                    </FieldLabel>
                    <FieldDescription>
                      Receive emails for friend requests, follows, and more.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id='social-emails'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-invalid={!!fieldState.error}
                  />
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name='security_emails'
              render={({ field, fieldState }) => (
                <Field orientation='horizontal'>
                  <FieldContent className='flex-1'>
                    <FieldLabel htmlFor='security-emails' className='text-base'>
                      Security emails
                    </FieldLabel>
                    <FieldDescription>
                      Receive emails about your account activity and security.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id='security-emails'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled
                    aria-readonly
                    data-invalid={!!fieldState.error}
                  />
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
          </div>
        </div>
        <Controller
          control={form.control}
          name='mobile'
          render={({ field, fieldState }) => (
            <Field orientation='horizontal'>
              <Checkbox
                id='mobile-settings'
                checked={field.value}
                onCheckedChange={field.onChange}
                data-invalid={!!fieldState.error}
              />
              <FieldContent className='flex-1'>
                <FieldLabel htmlFor='mobile-settings'>
                  Use different settings for my mobile devices
                </FieldLabel>
                <FieldDescription>
                  You can manage your mobile notifications in the{' '}
                  <Link
                    href='/settings'
                    className='underline decoration-dashed underline-offset-4 hover:decoration-solid'
                  >
                    mobile settings
                  </Link>{' '}
                  page.
                </FieldDescription>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>
      <Button type='submit'>Update notifications</Button>
    </form>
  )
}

