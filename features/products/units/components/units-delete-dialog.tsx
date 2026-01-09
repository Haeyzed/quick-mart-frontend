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
import { useDeleteUnit } from '../api/use-units'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { type Unit } from '../data/schema'

type UnitsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit: Unit | null
}

export function UnitsDeleteDialog({
  open,
  onOpenChange,
  unit: currentRow,
}: UnitsDeleteDialogProps) {
  const deleteUnit = useDeleteUnit()

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      const response = await deleteUnit.mutateAsync(currentRow.id)
      const message = (response as any)?.message || 'Unit deleted successfully'
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
            You are about to delete the unit &quot;{currentRow.name}&quot;. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteUnit.isPending}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {deleteUnit.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

