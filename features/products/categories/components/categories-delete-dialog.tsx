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
import { useDeleteCategory } from '../api/use-categories'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { type Category } from '../data/schema'

type CategoriesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: Category | null
}

export function CategoriesDeleteDialog({
  open,
  onOpenChange,
  category: currentRow,
}: CategoriesDeleteDialogProps) {
  const deleteCategory = useDeleteCategory()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      const response = await deleteCategory.mutateAsync(currentRow.id)
      const message = (response as any)?.message || 'Category deleted successfully'
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
            You are about to delete the category &quot;{currentRow.name}&quot;. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleteCategory.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

