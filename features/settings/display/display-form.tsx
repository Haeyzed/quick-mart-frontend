"use client"

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

const items = [
  {
    id: 'recents',
    label: 'Recents',
  },
  {
    id: 'home',
    label: 'Home',
  },
  {
    id: 'applications',
    label: 'Applications',
  },
  {
    id: 'desktop',
    label: 'Desktop',
  },
  {
    id: 'downloads',
    label: 'Downloads',
  },
  {
    id: 'documents',
    label: 'Documents',
  },
] as const

const displayFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }),
})

type DisplayFormValues = z.infer<typeof displayFormSchema>

// This can come from your database or API.
const defaultValues: Partial<DisplayFormValues> = {
  items: ['recents', 'home'],
}

export function DisplayForm() {
  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
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
          name='items'
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <div className='mb-4'>
                  <FieldLabel className='text-base'>Sidebar</FieldLabel>
                  <FieldDescription>
                    Select the items you want to display in the sidebar.
                  </FieldDescription>
                </div>
                {items.map((item) => (
                  <Field key={item.id} orientation='horizontal'>
                    <Checkbox
                      id={`display-${item.id}`}
                      checked={field.value?.includes(item.id)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange([...field.value, item.id])
                          : field.onChange(
                              field.value?.filter(
                                (value) => value !== item.id
                              )
                            )
                      }}
                    />
                    <FieldLabel
                      htmlFor={`display-${item.id}`}
                      className='font-normal'
                    >
                      {item.label}
                    </FieldLabel>
                  </Field>
                ))}
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>
      <Button type='submit'>Update display</Button>
    </form>
  )
}

