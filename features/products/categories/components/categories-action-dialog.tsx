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
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
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
import { useCreateCategory, useUpdateCategory, useRootCategories } from '../api/use-categories'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { type Category } from '../data/schema'
import { Spinner } from '@/components/ui/spinner'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  slug: z.string().max(255).optional().nullable(),
  short_description: z.string().max(1000).optional().nullable(),
  page_title: z.string().max(255).optional().nullable(),
  image: z.array(z.custom<File>()).max(1, 'Please select only one image').optional(),
  icon: z.array(z.custom<File>()).max(1, 'Please select only one icon').optional(),
  parent_id: z.number().nullable().optional(),
  is_active: z.boolean(),
  featured: z.boolean(),
  is_sync_disable: z.boolean(),
  woocommerce_category_id: z.number().nullable().optional(),
})

type CategoriesActionDialogProps = {
  currentRow?: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: CategoriesActionDialogProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const { data: rootCategories = [] } = useRootCategories()
  const { resolvedTheme } = useTheme()
  const isEdit = !!currentRow

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: isEdit
        ? {
            name: currentRow.name,
            slug: currentRow.slug || '',
            short_description: currentRow.short_description || '',
            page_title: currentRow.page_title || '',
            image: [],
            icon: [],
            parent_id: currentRow.parent_id || null,
            is_active: currentRow.is_active,
            featured: currentRow.featured,
            is_sync_disable: currentRow.is_sync_disable,
            woocommerce_category_id: currentRow.woocommerce_category_id || null,
          }
        : {
            name: '',
            slug: '',
            short_description: '',
            page_title: '',
            image: [],
            icon: [],
            parent_id: null,
            is_active: true,
            featured: false,
            is_sync_disable: false,
            woocommerce_category_id: null,
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
        icon: [],
        parent_id: currentRow.parent_id || null,
        is_active: currentRow.is_active,
        featured: currentRow.featured,
        is_sync_disable: currentRow.is_sync_disable,
        woocommerce_category_id: currentRow.woocommerce_category_id || null,
      })
    } else {
      form.reset({
        name: '',
        slug: '',
        short_description: '',
        page_title: '',
        image: [],
        icon: [],
        parent_id: null,
        is_active: true,
        featured: false,
        is_sync_disable: false,
        woocommerce_category_id: null,
      })
    }
  }, [currentRow, form, open])

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.slug) formData.append('slug', data.slug)
    if (data.short_description) formData.append('short_description', data.short_description)
    if (data.page_title) formData.append('page_title', data.page_title)
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0])
    }
    if (data.icon && data.icon.length > 0) {
      formData.append('icon', data.icon[0])
    }
    if (data.parent_id !== null && data.parent_id !== undefined) {
      formData.append('parent_id', String(data.parent_id))
    }
    formData.append('is_active', String(data.is_active))
    formData.append('featured', String(data.featured))
    formData.append('is_sync_disable', String(data.is_sync_disable))
    if (data.woocommerce_category_id !== null && data.woocommerce_category_id !== undefined) {
      formData.append('woocommerce_category_id', String(data.woocommerce_category_id))
    }

    try {
      let response
      if (isEdit && currentRow) {
        response = await updateCategory.mutateAsync({ id: currentRow.id, data: formData })
      } else {
        response = await createCategory.mutateAsync(formData)
      }
      
      const message = (response as any)?.message || (isEdit ? 'Category updated successfully' : 'Category created successfully')
      toast.success(message)
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      handleApiError(error, form.setError)
    }
  }

  // Filter out current category and its children from parent options
  const availableParentCategories = rootCategories.filter(
    (cat) => !isEdit || (cat.id !== currentRow?.id && cat.parent_id !== currentRow?.id)
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
      modal={true}
    >
      <DialogContent className='sm:max-w-lg' onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the category here. ' : 'Create new category here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <form
            id='category-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 px-0.5'
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name='name'
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor='category-name'>Name *</FieldLabel>
                    <Input
                      id='category-name'
                      placeholder='Category name'
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
                    <FieldLabel htmlFor='category-slug'>Slug</FieldLabel>
                    <Input
                      id='category-slug'
                      placeholder='category-slug'
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
                name='parent_id'
                render={({ field, fieldState }) => {
                  const categoryItems = availableParentCategories.map((cat) => ({
                    id: cat.id,
                    name: cat.name,
                  }))
                  const selectedCategory = categoryItems.find((cat) => cat.id === field.value)

                  return (
                    <Field>
                      <FieldLabel htmlFor='category-parent'>Parent Category</FieldLabel>
                      <Combobox
                        items={categoryItems}
                        value={selectedCategory || null}
                        onValueChange={(value) => {
                          field.onChange(value ? value.id : null)
                        }}
                        itemToStringValue={(item) => String(item.id)}
                      >
                        <ComboboxInput
                          id='category-parent'
                          name='parent_id'
                          placeholder='Select parent category (optional)'
                          showClear
                          data-invalid={!!fieldState.error}
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>No parent categories available</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item.id} value={item}>
                                {item.name}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      <FieldDescription>
                        Select a parent category to create a subcategory
                      </FieldDescription>
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </Field>
                  )
                }}
              />
              <Controller
                control={form.control}
                name='short_description'
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor='category-description'>Description</FieldLabel>
                    <Textarea
                      id='category-description'
                      placeholder='Category description'
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
                    <FieldLabel htmlFor='category-page-title'>Page Title</FieldLabel>
                    <Input
                      id='category-page-title'
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
                name='icon'
                render={({ field: { onChange, value, ...field }, fieldState }) => {
                  const existingIconUrl = isEdit && currentRow?.icon_url ? currentRow.icon_url : null
                  const hasNewIcon = value && value.length > 0
                  
                  return (
                    <Field>
                      <FieldLabel htmlFor='category-icon'>Icon</FieldLabel>
                      {existingIconUrl && !hasNewIcon && (
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
                                src={existingIconUrl}
                                alt={currentRow?.name || 'Category icon'}
                                width={64}
                                height={64}
                                className='object-cover'
                                unoptimized
                              />
                            </ImageZoom>
                          </div>
                          <div className='flex-1'>
                            <p className='text-sm font-medium'>Current Icon</p>
                            <p className='text-xs text-muted-foreground'>
                              Upload a new icon to replace this one
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
                          form.setError('icon', {
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
                        Icon image file. JPEG, PNG, JPG, GIF, or WebP. Max 5MB.
                      </FieldDescription>
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </Field>
                  )
                }}
              />
              <Controller
                control={form.control}
                name='image'
                render={({ field: { onChange, value, ...field }, fieldState }) => {
                  const existingImageUrl = isEdit && currentRow?.image_url ? currentRow.image_url : null
                  const hasNewImage = value && value.length > 0
                  
                  return (
                    <Field>
                      <FieldLabel htmlFor='category-image'>Image</FieldLabel>
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
                                alt={currentRow?.name || 'Category image'}
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
                name='woocommerce_category_id'
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor='category-woocommerce-id'>WooCommerce Category ID</FieldLabel>
                    <Input
                      id='category-woocommerce-id'
                      type='number'
                      placeholder='WooCommerce category ID'
                      autoComplete='off'
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? null : Number(value))
                      }}
                      data-invalid={!!fieldState.error}
                    />
                    <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='is_active'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='category-active'>Active</FieldLabel>
                    <Switch
                      id='category-active'
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
                name='featured'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='category-featured'>Featured</FieldLabel>
                    <Switch
                      id='category-featured'
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
                name='is_sync_disable'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='category-sync-disable'>Disable Sync</FieldLabel>
                    <Switch
                      id='category-sync-disable'
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
            form='category-form'
            disabled={createCategory.isPending || updateCategory.isPending}
          >
            {createCategory.isPending || updateCategory.isPending ? (
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

