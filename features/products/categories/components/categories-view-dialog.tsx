"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { HugeiconsIcon } from '@hugeicons/react'
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom'
import { useTheme } from '@/context/theme-provider'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { type Category } from '../data/schema'
import { activeStatuses } from '../data/data'

type CategoriesViewDialogProps = {
  currentRow?: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoriesViewDialog({
  currentRow,
  open,
  onOpenChange,
}: CategoriesViewDialogProps) {
  if (!currentRow) return null

  const { resolvedTheme } = useTheme()
  const status = activeStatuses.find((s) => s.value === (currentRow.is_active ? 'active' : 'inactive'))
  const StatusIcon = status?.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className='sm:max-w-lg' onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className='text-start'>
          <DialogTitle>Category Details</DialogTitle>
          <DialogDescription>
            View category information below.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <div className='space-y-6 px-0.5'>
            {currentRow.image_url && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>Image</div>
                <div className='relative h-48 w-full overflow-hidden rounded-md border'>
                  <ImageZoom
                    backdropClassName={cn(
                      resolvedTheme === 'dark'
                        ? '[&_[data-rmiz-modal-overlay="visible"]]:bg-white/80'
                        : '[&_[data-rmiz-modal-overlay="visible"]]:bg-black/80'
                    )}
                  >
                    <Image
                      src={currentRow.image_url}
                      alt={currentRow.name}
                      width={800}
                      height={400}
                      className='h-full w-full object-cover'
                      unoptimized
                    />
                  </ImageZoom>
                </div>
              </div>
            )}
            
            <div className='space-y-2'>
              <div className='text-sm font-medium text-muted-foreground'>Name</div>
              <div className='text-sm font-medium'>{currentRow.name}</div>
            </div>

            {currentRow.slug && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>Slug</div>
                <div className='text-sm font-mono text-muted-foreground'>{currentRow.slug}</div>
              </div>
            )}

            {currentRow.parent_name && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>Parent Category</div>
                <div className='text-sm font-medium'>{currentRow.parent_name}</div>
              </div>
            )}

            {currentRow.icon && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>Icon</div>
                <div className='text-sm'>{currentRow.icon}</div>
              </div>
            )}

            {currentRow.short_description && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>Description</div>
                <div className='text-sm text-muted-foreground whitespace-pre-wrap'>
                  {currentRow.short_description}
                </div>
              </div>
            )}

            {currentRow.page_title && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>Page Title</div>
                <div className='text-sm'>{currentRow.page_title}</div>
              </div>
            )}

            {currentRow.woocommerce_category_id && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>WooCommerce Category ID</div>
                <div className='text-sm'>{currentRow.woocommerce_category_id}</div>
              </div>
            )}

            <div className='space-y-2'>
              <div className='text-sm font-medium text-muted-foreground'>Status</div>
              <Badge
                variant='outline'
                className={`flex w-fit items-center gap-1.5 ${
                  currentRow.is_active
                    ? 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'
                    : 'bg-neutral-300/40 border-neutral-300'
                }`}
              >
                {StatusIcon && <HugeiconsIcon icon={StatusIcon} className='size-3' />}
                {status?.label}
              </Badge>
            </div>

            <div className='space-y-2'>
              <div className='text-sm font-medium text-muted-foreground'>Featured</div>
              <Badge
                variant='outline'
                className={`flex w-fit items-center gap-1.5 ${
                  currentRow.featured
                    ? 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'
                    : 'bg-neutral-300/40 border-neutral-300'
                }`}
              >
                {currentRow.featured ? 'Yes' : 'No'}
              </Badge>
            </div>

            <div className='space-y-2'>
              <div className='text-sm font-medium text-muted-foreground'>Sync Disabled</div>
              <Badge
                variant='outline'
                className={`flex w-fit items-center gap-1.5 ${
                  currentRow.is_sync_disable
                    ? 'bg-orange-100/30 text-orange-900 dark:text-orange-200 border-orange-200'
                    : 'bg-neutral-300/40 border-neutral-300'
                }`}
              >
                {currentRow.is_sync_disable ? 'Yes' : 'No'}
              </Badge>
            </div>

            <Separator />

            <div className='space-y-2'>
              <div className='text-sm font-medium text-muted-foreground'>Created At</div>
              <div className='text-sm text-muted-foreground'>
                {currentRow.created_at
                  ? new Date(currentRow.created_at).toLocaleString()
                  : 'N/A'}
              </div>
            </div>

            <div className='space-y-2'>
              <div className='text-sm font-medium text-muted-foreground'>Updated At</div>
              <div className='text-sm text-muted-foreground'>
                {currentRow.updated_at
                  ? new Date(currentRow.updated_at).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

