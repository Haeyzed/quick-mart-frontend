"use client"

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Delete01Icon, MultiplicationSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Product } from '../data/schema'
import { useBulkDeleteProducts } from '../api/use-products'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
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

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const bulkDelete = useBulkDeleteProducts()

  const selectedProducts = selectedRows.map((row) => row.original as Product)
  const ids = selectedProducts.map((product) => product.id)

  const handleBulkDelete = async () => {
    try {
      const response = await bulkDelete.mutateAsync(ids)
      setShowDeleteConfirm(false)
      table.resetRowSelection()
      const message = (response as any)?.message || `Deleted ${ids.length} product${ids.length > 1 ? 's' : ''}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  if (selectedRows.length === 0) return null

  return (
    <>
      <BulkActionsToolbar table={table} entityName='product'>
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowDeleteConfirm(true)}
                disabled={bulkDelete.isPending}
              >
                <HugeiconsIcon icon={Delete01Icon} className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete selected</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.resetRowSelection()}
              >
                <HugeiconsIcon icon={MultiplicationSignIcon} className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear selection</TooltipContent>
          </Tooltip>
        </div>
      </BulkActionsToolbar>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {ids.length} selected product{ids.length > 1 ? 's' : ''}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDelete.isPending}
              className='bg-red-600 hover:bg-red-700'
            >
              {bulkDelete.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

