"use client"

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
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useImportBrands } from '../api/use-brands'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'

const importSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select a file' })
    .refine((file) => file.size > 0, 'File cannot be empty')
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      'File size must be less than 5MB'
    )
    .refine(
      (file) =>
        ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(
          file.type
        ),
      'File must be a CSV or Excel file'
    ),
})

type BrandsImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrandsImportDialog({
  open,
  onOpenChange,
}: BrandsImportDialogProps) {
  const importBrands = useImportBrands()
  const form = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
  })

  const onSubmit = async (data: z.infer<typeof importSchema>) => {
    try {
      const response = await importBrands.mutateAsync(data.file)
      const message = (response as any)?.message || 'Brands imported successfully'
      toast.success(message)
      form.reset()
      onOpenChange(false)
    } catch (error: any) {
      handleApiError(error, form.setError)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
      modal={true}
    >
      <DialogContent className='sm:max-w-md' onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className='text-start'>
          <DialogTitle>Import Brands</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import brands.
          </DialogDescription>
        </DialogHeader>
        <form
          id='brand-import-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name='file'
              render={({ field: { onChange, value, ...field }, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='import-file'>File</FieldLabel>
                  <Input
                    id='import-file'
                    type='file'
                    accept='.csv,.xlsx,.xls'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onChange(file)
                    }}
                    data-invalid={!!fieldState.error}
                    {...field}
                  />
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
          <Button type='submit' form='brand-import-form' disabled={importBrands.isPending}>
            {importBrands.isPending ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

