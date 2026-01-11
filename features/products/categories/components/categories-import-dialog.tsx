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
import { SAMPLE_CATEGORIES_CSV } from '@/lib/constants/sample-data'
import { useImportCategories } from '../api/use-categories'
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
        file.type === 'application/vnd.ms-excel' ||
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls'),
      'File must be a CSV, XLSX, or XLS file'
    ),
})

type CategoriesImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriesImportDialog({
  open,
  onOpenChange,
}: CategoriesImportDialogProps) {
  const importCategories = useImportCategories()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState<string[][]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const form = useForm<z.infer<typeof importSchema>>({
    resolver: zodResolver(importSchema),
  })

  const handleDownloadSample = () => {
    downloadCSV(SAMPLE_CATEGORIES_CSV, 'categories-sample.csv')
  }

  const handlePreview = async () => {
    const file = form.watch('file')
    if (!file) return
    
    try {
      const text = await file.text()
      const parsed = parseCSV(text)
      if (parsed.length > 0) {
        setPreviewData(parsed)
        setSelectedFile(file)
        setPreviewOpen(true)
      } else {
        toast.error('File is empty or invalid')
      }
    } catch (error) {
      toast.error('Failed to parse file')
    }
  }

  const handleConfirmImport = async () => {
    if (!selectedFile) return
    
    try {
      const response = await importCategories.mutateAsync(selectedFile)
      const message = (response as any)?.message || 'Categories imported successfully'
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
    // Preview is shown via handlePreview button click
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
          <DialogTitle>Import Categories</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import categories. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        <form
          id='category-import-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <FieldGroup>
            <div className='space-y-2 rounded-md border bg-muted/50 p-3 text-sm'>
              <div className='font-medium'>Required Fields:</div>
              <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                <li><code className='rounded bg-background px-1 py-0.5 text-xs'>name*</code> - Category name (required)</li>
              </ul>
              <div className='font-medium mt-3'>Optional Fields:</div>
              <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                <li><code className='rounded bg-background px-1 py-0.5 text-xs'>parent_category</code> - Parent category name</li>
              </ul>
              <div className='font-medium mt-3'>Column Order:</div>
              <div className='text-muted-foreground'>
                <code className='rounded bg-background px-1 py-0.5 text-xs'>name*, parent_category</code>
              </div>
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
                    accept='.csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        onChange(file)
                        setSelectedFile(file)
                      }
                    }}
                    data-invalid={!!fieldState.error}
                    {...field}
                  />
                  <FieldDescription>
                    CSV, XLSX, or XLS files are supported. Max file size: 5MB
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
          <Button type='button' onClick={handlePreview} disabled={importCategories.isPending || !form.watch('file')}>
            Preview
          </Button>
        </DialogFooter>
      </DialogContent>
      <CSVPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewData}
        onConfirm={handleConfirmImport}
        isImporting={importCategories.isPending}
        title='Preview Categories Import'
      />
    </Dialog>
  )
}

