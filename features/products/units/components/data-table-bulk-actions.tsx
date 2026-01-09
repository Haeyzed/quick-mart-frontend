"use client"

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Delete01Icon, MultiplicationSignIcon, CheckmarkCircle02Icon, MultiplicationSignCircleIcon, Download01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Unit } from '../data/schema'
import { UnitsMultiDeleteDialog } from './units-multi-delete-dialog'
import { ExportDialog } from '@/components/export-dialog'
import { useBulkDeleteUnits, useBulkActivateUnits, useBulkDeactivateUnits, useExportUnits } from '../api/use-units'
import { useUsers } from '@/lib/hooks/use-users'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { Separator } from '@/components/ui/separator'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const bulkDelete = useBulkDeleteUnits()
  const bulkActivate = useBulkActivateUnits()
  const bulkDeactivate = useBulkDeactivateUnits()
  const exportUnits = useExportUnits()
  const { data: users = [] } = useUsers()

  const selectedUnits = selectedRows.map((row) => row.original as Unit)
  const ids = selectedUnits.map((unit) => unit.id)

  const handleBulkDelete = async () => {
    try {
      const response = await bulkDelete.mutateAsync(ids)
      setShowDeleteConfirm(false)
      table.resetRowSelection()
      const message = (response as any)?.message || `Deleted ${ids.length} unit${ids.length > 1 ? 's' : ''}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkActivate = async () => {
    try {
      const response = await bulkActivate.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Activated ${ids.length} unit${ids.length > 1 ? 's' : ''}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkDeactivate = async () => {
    try {
      const response = await bulkDeactivate.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Deactivated ${ids.length} unit${ids.length > 1 ? 's' : ''}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleExport = async (data: {
    format: 'excel' | 'pdf'
    method: 'download' | 'email'
    user_id?: number
  }) => {
    try {
      const response = await exportUnits.mutateAsync({
        ids,
        ...data,
      })
      table.resetRowSelection()
      const message = (response as any)?.message || 'Export completed successfully'
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  if (selectedRows.length === 0) return null

  return (
    <>
      <BulkActionsToolbar table={table} entityName='unit'>
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
          <Separator orientation='vertical'/>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowExportDialog(true)}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || exportUnits.isPending}
              >
                <HugeiconsIcon icon={Download01Icon} className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export selected</TooltipContent>
          </Tooltip>
          <Separator orientation='vertical'/>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowDeleteConfirm(true)}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || exportUnits.isPending}
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
      <UnitsMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleBulkDelete}
        count={selectedRows.length}
      />
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
        isExporting={exportUnits.isPending}
        title='Export Units'
        users={users}
      />
    </>
  )
}

