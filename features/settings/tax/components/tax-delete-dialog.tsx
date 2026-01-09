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
import { useDeleteTax } from '../api/use-taxes'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { type Tax } from '../data/schema'

type TaxesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tax: Tax | null
}

export function TaxesDeleteDialog({
  open,
  onOpenChange,
  tax: currentRow,
}: TaxesDeleteDialogProps) {
  const deleteTax = useDeleteTax()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      const response = await deleteTax.mutateAsync(currentRow.id)
      const message = (response as any)?.message || 'Tax deleted successfully'
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
            You are about to delete the tax &quot;{currentRow.name}&quot;. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTax.isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleteTax.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

