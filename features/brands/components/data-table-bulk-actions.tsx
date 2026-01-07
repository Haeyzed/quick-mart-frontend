"use client"

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Delete01Icon, MultiplicationSignIcon, CheckmarkCircle02Icon, MultiplicationSignCircleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Brand } from '../data/schema'
import { BrandsMultiDeleteDialog } from './brands-multi-delete-dialog'
import { useBulkDeleteBrands, useBulkActivateBrands, useBulkDeactivateBrands } from '../api/use-brands'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const bulkDelete = useBulkDeleteBrands()
  const bulkActivate = useBulkActivateBrands()
  const bulkDeactivate = useBulkDeactivateBrands()

  const selectedBrands = selectedRows.map((row) => row.original as Brand)
  const ids = selectedBrands.map((brand) => brand.id)

  const handleBulkDelete = async () => {
    try {
      const response = await bulkDelete.mutateAsync(ids)
      setShowDeleteConfirm(false)
      table.resetRowSelection()
      const message = (response as any)?.message || `Deleted ${ids.length} brand${ids.length > 1 ? 's' : ''}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkActivate = async () => {
    try {
      const response = await bulkActivate.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Activated ${ids.length} brand${ids.length > 1 ? 's' : ''}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkDeactivate = async () => {
    try {
      const response = await bulkDeactivate.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Deactivated ${ids.length} brand${ids.length > 1 ? 's' : ''}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  if (selectedRows.length === 0) return null

  return (
    <>
      <BulkActionsToolbar table={table} entityName='brand'>
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={handleBulkActivate}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending}
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Activate selected</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={handleBulkDeactivate}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending}
              >
                <HugeiconsIcon icon={MultiplicationSignCircleIcon} className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deactivate selected</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowDeleteConfirm(true)}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending}
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
      <BrandsMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleBulkDelete}
        count={selectedRows.length}
      />
    </>
  )
}

