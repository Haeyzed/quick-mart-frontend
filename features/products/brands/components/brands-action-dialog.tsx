"use client"

import { useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload'
import { CloudUploadIcon, CancelCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom'
import { useTheme } from '@/context/theme-provider'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useCreateBrand, useUpdateBrand } from '../api/use-brands'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { type Brand } from '../data/schema'
import { Spinner } from '@/components/ui/spinner'

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  slug: z.string().max(255).optional().nullable(),
  short_description: z.string().max(1000).optional().nullable(),
  page_title: z.string().max(255).optional().nullable(),
  image: z.array(z.custom<File>()).max(1, 'Please select only one image').optional(),
  is_active: z.boolean(),
})

type BrandsActionDialogProps = {
  currentRow?: Brand
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrandsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: BrandsActionDialogProps) {
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const { resolvedTheme } = useTheme()
  const isEdit = !!currentRow

  const form = useForm<z.infer<typeof brandSchema>>({
    resolver: zodResolver(brandSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          slug: currentRow.slug || '',
          short_description: currentRow.short_description || '',
          page_title: currentRow.page_title || '',
          image: [],
          is_active: currentRow.is_active,
        }
      : {
          name: '',
          slug: '',
          short_description: '',
          page_title: '',
          image: [],
          is_active: true,
        },
  })

  useEffect(() => {
    if (currentRow) {
      form.reset({
        name: currentRow.name,
        slug: currentRow.slug || '',
        short_description: currentRow.short_description || '',
        page_title: currentRow.page_title || '',
        image: [],
        is_active: currentRow.is_active,
      })
    } else {
      form.reset({
        name: '',
        slug: '',
        short_description: '',
        page_title: '',
        image: [],
        is_active: true,
      })
    }
  }, [currentRow, form, open])

  const onSubmit = async (data: z.infer<typeof brandSchema>) => {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.slug) formData.append('slug', data.slug)
    if (data.short_description) formData.append('short_description', data.short_description)
    if (data.page_title) formData.append('page_title', data.page_title)
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0])
    }
    formData.append('is_active', String(data.is_active))

    try {
      let response
      if (isEdit && currentRow) {
        response = await updateBrand.mutateAsync({ id: currentRow.id, data: formData })
      } else {
        response = await createBrand.mutateAsync(formData)
      }
      
      // Show success message from API or default
      const message = (response as any)?.message || (isEdit ? 'Brand updated successfully' : 'Brand created successfully')
      toast.success(message)
      onOpenChange(false)
      form.reset()
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
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Brand' : 'Add New Brand'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the brand here. ' : 'Create new brand here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <form
            id='brand-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 px-0.5'
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name='name'
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor='brand-name'>Name *</FieldLabel>
                    <Input
                      id='brand-name'
                      placeholder='Brand name'
                      autoComplete='off'
                      {...field}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='slug'
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor='brand-slug'>Slug</FieldLabel>
                    <Input
                      id='brand-slug'
                      placeholder='brand-slug'
                      autoComplete='off'
                      {...field}
                      value={field.value || ''}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldDescription>
                      URL-friendly version of the name (auto-generated if left empty)
                    </FieldDescription>
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='short_description'
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor='brand-description'>Description</FieldLabel>
                    <Textarea
                      id='brand-description'
                      placeholder='Brand description'
                      rows={3}
                      className='resize-none'
                      {...field}
                      value={field.value || ''}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='page_title'
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor='brand-page-title'>Page Title</FieldLabel>
                    <Input
                      id='brand-page-title'
                      placeholder='Page title'
                      autoComplete='off'
                      {...field}
                      value={field.value || ''}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='image'
                render={({ field: { onChange, value, ...field }, fieldState }) => {
                  const existingImageUrl = isEdit && currentRow?.image_url ? currentRow.image_url : null
                  const hasNewImage = value && value.length > 0
                  
                  return (
                    <Field>
                      <FieldLabel htmlFor='brand-image'>Image</FieldLabel>
                      {existingImageUrl && !hasNewImage && (
                        <div className='mb-3 flex items-center gap-3 rounded-md border p-3'>
                          <div className='relative size-16 overflow-hidden rounded-md'>
                            <ImageZoom
                              backdropClassName={cn(
                                resolvedTheme === 'dark'
                                  ? '[&_[data-rmiz-modal-overlay="visible"]]:bg-white/80'
                                  : '[&_[data-rmiz-modal-overlay="visible"]]:bg-black/80'
                              )}
                            >
                              <Image
                                src={existingImageUrl}
                                alt={currentRow?.name || 'Brand image'}
                                width={64}
                                height={64}
                                className='object-cover'
                                unoptimized
                              />
                            </ImageZoom>
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>Current Image</p>
                            <p className='text-xs text-muted-foreground'>
                              Upload a new image to replace this one
                            </p>
                          </div>
                        </div>
                      )}
                      <FileUpload
                        value={value || []}
                        onValueChange={onChange}
                        accept='image/*'
                        maxFiles={1}
                        maxSize={5 * 1024 * 1024}
                        onFileReject={(_, message) => {
                          form.setError('image', {
                            message,
                          })
                        }}
                      >
                        <FileUploadDropzone className='flex-row flex-wrap border-dotted text-center'>
                          <HugeiconsIcon icon={CloudUploadIcon} className='size-4' />
                          Drag and drop or
                          <FileUploadTrigger asChild>
                            <Button variant='link' size='sm' className='p-0'>
                              choose file
                            </Button>
                          </FileUploadTrigger>
                          to upload
                        </FileUploadDropzone>
                        <FileUploadList>
                          {value?.map((file, index) => (
                            <FileUploadItem key={index} value={file}>
                              <FileUploadItemPreview />
                              <FileUploadItemMetadata />
                              <FileUploadItemDelete asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='size-7'
                                >
                                  <HugeiconsIcon icon={CancelCircleIcon} className='size-4' />
                                  <span className='sr-only'>Delete</span>
                                </Button>
                              </FileUploadItemDelete>
                            </FileUploadItem>
                          ))}
                        </FileUploadList>
                      </FileUpload>
                      <FieldDescription>
                        JPEG, PNG, JPG, GIF, or WebP. Max 5MB.
                      </FieldDescription>
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </Field>
                  )
                }}
              />
              <Controller
                control={form.control}
                name='is_active'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='brand-active'>Active</FieldLabel>
                    <Switch
                      id='brand-active'
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <DialogFooter>
          <Button
            type='submit'
            form='brand-form'
            disabled={createBrand.isPending || updateBrand.isPending}
          >
            {createBrand.isPending || updateBrand.isPending ? (
              <>
                <Spinner className="mr-2 size-4" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

