"use client"

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

const exportSchema = z.object({
  format: z.enum(['pdf', 'excel']),
  method: z.enum(['download', 'email']),
  user_id: z.number().optional(),
}).refine(
  (data) => {
    if (data.method === 'email') {
      return data.user_id !== undefined
    }
    return true
  },
  {
    message: 'Please select a user to send the email to',
    path: ['user_id'],
  }
)

type ExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (data: { format: 'pdf' | 'excel'; method: 'download' | 'email'; user_id?: number }) => Promise<void>
  isExporting?: boolean
  title?: string
  users?: Array<{ id: number; name: string; email: string }>
}

export function ExportDialog({
  open,
  onOpenChange,
  onExport,
  isExporting = false,
  title = 'Export Data',
  users = [],
}: ExportDialogProps) {
  const form = useForm<z.infer<typeof exportSchema>>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: 'excel',
      method: 'download',
    },
  })

  const method = form.watch('method')

  const onSubmit = async (data: z.infer<typeof exportSchema>) => {
    try {
      await onExport(data)
      form.reset()
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className='sm:max-w-md'  onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className='text-start'>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choose export format and method.
          </DialogDescription>
        </DialogHeader>
        <form
          id='export-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name='format'
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Export Format *</FieldLabel>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className='flex gap-4'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='excel' id='format-excel' />
                      <label htmlFor='format-excel' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Excel
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='pdf' id='format-pdf' />
                      <label htmlFor='format-pdf' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        PDF
                      </label>
                    </div>
                  </RadioGroup>
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name='method'
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Export Method *</FieldLabel>
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      if (value === 'download') {
                        form.setValue('user_id', undefined)
                      }
                    }}
                    className='flex gap-4'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='download' id='method-download' />
                      <label htmlFor='method-download' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Download
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='email' id='method-email' />
                      <label htmlFor='method-email' className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Send via Email
                      </label>
                    </div>
                  </RadioGroup>
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            {method === 'email' && (
              <Controller
                control={form.control}
                name='user_id'
                render={({ field, fieldState }) => {
                  const selectedUser = users.find((u) => u.id === field.value)
                  return (
                    <Field>
                      <FieldLabel>Select User *</FieldLabel>
                      <Select
                        value={field.value ? String(field.value) : ''}
                        onValueChange={(value) => {
                          field.onChange(value ? Number(value) : undefined)
                        }}
                      >
                        <SelectTrigger className='w-full' data-invalid={!!fieldState.error}>
                          <SelectValue placeholder='Select user to send email to' />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={String(user.id)}>
                              <div className='flex flex-col'>
                                <span className='font-medium'>{user.name}</span>
                                <span className='text-xs text-muted-foreground'>{user.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Select a user to receive the export file via email
                      </FieldDescription>
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </Field>
                  )
                }}
              />
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type='submit'
            form='export-form'
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Spinner className='mr-2 size-4' />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

