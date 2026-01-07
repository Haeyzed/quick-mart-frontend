"use client"

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { fonts } from '@/config/fonts'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-provider'
import { useTheme } from '@/context/theme-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark']),
  font: z.enum(fonts),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { font, setFont } = useFont()
  const { theme, setTheme } = useTheme()

  // This can come from your database or API.
  const defaultValues: Partial<AppearanceFormValues> = {
    theme: theme as 'light' | 'dark',
    font,
  }

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues,
  })

  function onSubmit(data: AppearanceFormValues) {
    if (data.font != font) setFont(data.font)
    if (data.theme != theme) setTheme(data.theme)

    showSubmittedData(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
      <FieldGroup>
        <Controller
          control={form.control}
          name='font'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='appearance-font'>Font</FieldLabel>
              <FieldContent>
                <div className='relative w-max'>
                  <select
                    id='appearance-font'
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-[200px] appearance-none font-normal capitalize',
                      'dark:bg-background dark:hover:bg-background'
                    )}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      setFont(e.target.value as typeof fonts[number])
                    }}
                    data-invalid={!!fieldState.error}
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <HugeiconsIcon icon={ChevronDown} className='absolute end-3 top-2.5 h-4 w-4 opacity-50 pointer-events-none' />
                </div>
                <FieldDescription>
                  Set the font you want to use in the dashboard.
                </FieldDescription>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='theme'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='appearance-theme'>Theme</FieldLabel>
              <FieldContent>
                <FieldDescription>
                  Select the theme for the dashboard.
                </FieldDescription>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className='grid max-w-md grid-cols-2 gap-8 pt-2'
                >
                  <Field>
                    <FieldLabel
                      htmlFor='theme-light'
                      className='[&:has([data-state=checked])>div]:border-primary'
                    >
                      <RadioGroupItem value='light' id='theme-light' className='sr-only' />
                      <div className='items-center rounded-md border-2 border-muted p-1 hover:border-accent'>
                        <div className='space-y-2 rounded-sm bg-[#ecedef] p-2'>
                          <div className='space-y-2 rounded-md bg-white p-2 shadow-xs'>
                            <div className='h-2 w-[80px] rounded-lg bg-[#ecedef]' />
                            <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                          </div>
                          <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                            <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                            <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                          </div>
                          <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                            <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                            <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                          </div>
                        </div>
                      </div>
                      <span className='block w-full p-2 text-center font-normal'>
                        Light
                      </span>
                    </FieldLabel>
                  </Field>
                  <Field>
                    <FieldLabel
                      htmlFor='theme-dark'
                      className='[&:has([data-state=checked])>div]:border-primary'
                    >
                      <RadioGroupItem value='dark' id='theme-dark' className='sr-only' />
                      <div className='items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground'>
                        <div className='space-y-2 rounded-sm bg-slate-950 p-2'>
                          <div className='space-y-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                            <div className='h-2 w-[80px] rounded-lg bg-slate-400' />
                            <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                          </div>
                          <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                            <div className='h-4 w-4 rounded-full bg-slate-400' />
                            <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                          </div>
                          <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                            <div className='h-4 w-4 rounded-full bg-slate-400' />
                            <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                          </div>
                        </div>
                      </div>
                      <span className='block w-full p-2 text-center font-normal'>
                        Dark
                      </span>
                    </FieldLabel>
                  </Field>
                </RadioGroup>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>

      <Button type='submit'>Update preferences</Button>
    </form>
  )
}

