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
import { Input } from '@/components/ui/input'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { CSVPreviewDialog } from '@/components/csv-preview-dialog'
import { downloadCSV, parseCSV } from '@/lib/utils/csv-utils'
import { SAMPLE_UNITS_CSV } from '@/lib/constants/sample-data'
import { useImportUnits } from '../api/use-units'
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
        file.type === 'text/csv' || 
        file.name.endsWith('.csv'),
      'File must be a CSV file'
    ),
})

type UnitsImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnitsImportDialog({
  open,
  onOpenChange,
}: UnitsImportDialogProps) {
  const importUnits = useImportUnits()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<string[][]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const form = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
  })

  const handleDownloadSample = () => {
    downloadCSV(SAMPLE_UNITS_CSV, 'units-sample.csv')
  }

  const handleFileChange = async (file: File | null) => {
    if (!file) return
    
    try {
      const text = await file.text()
      const parsed = parseCSV(text)
      if (parsed.length > 0) {
        setPreviewData(parsed)
        setSelectedFile(file)
        setPreviewOpen(true)
      } else {
        toast.error('CSV file is empty or invalid')
      }
    } catch (error) {
      toast.error('Failed to parse CSV file')
    }
  }

  const handleConfirmImport = async () => {
    if (!selectedFile) return
    
    try {
      const response = await importUnits.mutateAsync(selectedFile)
      const message = (response as any)?.message || 'Units imported successfully'
      toast.success(message)
      form.reset()
      setSelectedFile(null)
      setPreviewOpen(false)
      onOpenChange(false)
    } catch (error: any) {
      handleApiError(error, form.setError)
      setPreviewOpen(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof importSchema>) => {
    // Preview will be shown via handleFileChange in the file input onChange
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
          <DialogTitle>Import Units</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import units. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        <form
          id='unit-import-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <FieldGroup>
            <div className='space-y-2 rounded-md border bg-muted/50 p-3 text-sm'>
              <div className='font-medium'>Required Fields:</div>
              <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                <li><code className='rounded bg-background px-1 py-0.5 text-xs'>code*</code> - Unit code (required)</li>
              </ul>
              <div className='font-medium mt-3'>Optional Fields:</div>
              <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                <li><code className='rounded bg-background px-1 py-0.5 text-xs'>name</code> - Unit name</li>
                <li><code className='rounded bg-background px-1 py-0.5 text-xs'>baseunit</code> - Base unit code</li>
                <li><code className='rounded bg-background px-1 py-0.5 text-xs'>operator</code> - Operator (* or /)</li>
                <li><code className='rounded bg-background px-1 py-0.5 text-xs'>operationvalue</code> - Operation value</li>
              </ul>
            </div>
            <div className='flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                Download sample CSV file to see the format
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleDownloadSample}
              >
                <HugeiconsIcon icon={Download01Icon} className='size-4 mr-2' />
                Download Sample
              </Button>
            </div>
            <Controller
              control={form.control}
              name='file'
              render={({ field: { onChange, value, ...field }, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='import-file'>CSV File *</FieldLabel>
                  <Input
                    id='import-file'
                    type='file'
                    accept='.csv,text/csv'
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        onChange(file)
                        await handleFileChange(file)
                      }
                    }}
                    data-invalid={!!fieldState.error}
                    {...field}
                  />
                  <FieldDescription>
                    Only CSV files are supported. Max file size: 5MB
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
          <Button type='submit' form='unit-import-form' disabled={importUnits.isPending || !form.watch('file')}>
            Preview
          </Button>
        </DialogFooter>
      </DialogContent>
      <CSVPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
        onConfirm={handleConfirmImport}
        isImporting={importUnits.isPending}
        title='Preview Units Import'
      />
    </Dialog>
  )
}

