"use client"

import { AlertTriangle } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteBrand } from '../api/use-brands'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { type Brand } from '../data/schema'

type BrandsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: Brand | null
}

export function BrandsDeleteDialog({
  open,
  onOpenChange,
  brand: currentRow,
}: BrandsDeleteDialogProps) {
  const deleteBrand = useDeleteBrand()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      const response = await deleteBrand.mutateAsync(currentRow.id)
      const message = (response as any)?.message || 'Brand deleted successfully'
      toast.success(message)
      onOpenChange(false)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  if (!currentRow) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <HugeiconsIcon
              icon={AlertTriangle}
              className='size-5 text-destructive'
            />
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to delete the brand &quot;{currentRow.name}&quot;. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteBrand.isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleteBrand.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

