"use client"

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogClose,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUsers } from '@/lib/hooks/use-users'
import { Spinner } from '@/components/ui/spinner'
import { useExportTaxes } from '../api/use-taxes'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'

const exportSchema = z.object({
  format: z.enum(['excel', 'pdf']),
  method: z.enum(['download', 'email']),
  columns: z.array(z.string()).min(1, 'Please select at least one column'),
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

const AVAILABLE_COLUMNS = [
  { value: 'id', label: 'ID' },
  { value: 'name', label: 'Name' },
  { value: 'rate', label: 'Rate (%)' },
  { value: 'is_active', label: 'Is Active' },
  { value: 'created_at', label: 'Created At' },
  { value: 'updated_at', label: 'Updated At' },
] as const

type TaxExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ids?: number[]
}

export function TaxExportDialog({
  open,
  onOpenChange,
  ids = [],
}: TaxExportDialogProps) {
  const exportTaxes = useExportTaxes()
  const { data: users = [], isLoading: isLoadingUsers } = useUsers()
  
  const form = useForm<z.infer<typeof exportSchema>>({
    resolver: zodResolver(exportSchema),
    defaultValues: {
      format: 'excel',
      method: 'download',
      columns: ['id', 'name', 'rate', 'is_active'],
    },
  })

  const method = form.watch('method')

  const onSubmit = async (data: z.infer<typeof exportSchema>) => {
    try {
      await exportTaxes.mutateAsync({
        ids: ids.length > 0 ? ids : undefined,
        format: data.format,
        method: data.method,
        columns: data.columns,
        user_id: data.user_id,
      } as any)
      
      if (data.method === 'download') {
        toast.success('Export downloaded successfully')
      } else {
        toast.success('Export sent via email successfully')
      }
      
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      handleApiError(error, form.setError)
    }
  }

  const handleSelectAll = () => {
    form.setValue('columns', AVAILABLE_COLUMNS.map(col => col.value))
  }

  const handleDeselectAll = () => {
    form.setValue('columns', [])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
      modal={false}
    >
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto' onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className='text-start'>
          <DialogTitle>Export Taxes</DialogTitle>
          <DialogDescription>
            Select export format, method, and columns to export.
            {ids.length > 0 && ` ${ids.length} tax${ids.length > 1 ? 'es' : ''} selected.`}
          </DialogDescription>
        </DialogHeader>
        <form
          id='tax-export-form'
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
                        Excel (XLSX)
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
                render={({ field, fieldState }) => (
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
                )}
              />
            )}

            <Controller
              control={form.control}
              name='columns'
              render={({ field, fieldState }) => (
                <Field>
                  <div className='flex items-center justify-between'>
                    <FieldLabel>Select Columns *</FieldLabel>
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={handleSelectAll}
                      >
                        Select All
                      </Button>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={handleDeselectAll}
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-3 rounded-md border p-3 max-h-60 overflow-y-auto'>
                    {AVAILABLE_COLUMNS.map((column) => (
                      <div key={column.value} className='flex items-center space-x-2'>
                        <Checkbox
                          id={`column-${column.value}`}
                          checked={field.value?.includes(column.value) || false}
                          onCheckedChange={(checked) => {
                            const currentColumns = field.value || []
                            if (checked) {
                              field.onChange([...currentColumns, column.value])
                            } else {
                              field.onChange(currentColumns.filter((col) => col !== column.value))
                            }
                          }}
                        />
                        <label
                          htmlFor={`column-${column.value}`}
                          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                        >
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FieldDescription>
                    Select the columns you want to include in the export
                  </FieldDescription>
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter className='gap-y-2'>
          <DialogClose asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogClose>
          <Button
            type='submit'
            form='tax-export-form'
            disabled={exportTaxes.isPending || isLoadingUsers}
          >
            {exportTaxes.isPending ? (
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

