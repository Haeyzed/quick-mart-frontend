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
import { type Category } from '../data/schema'
import { CategoriesMultiDeleteDialog } from './categories-multi-delete-dialog'
import { ExportDialog } from '@/components/export-dialog'
import { useBulkDeleteCategories, useBulkActivateCategories, useBulkDeactivateCategories, useBulkEnableFeatured, useBulkDisableFeatured, useBulkEnableSync, useBulkDisableSync, useExportCategories } from '../api/use-categories'
import { useUsers } from '@/lib/hooks/use-users'
import { toast } from 'sonner'
import { handleApiError } from '@/lib/handle-api-error'
import { StarIcon, CloudUploadIcon, CancelCircleIcon } from '@hugeicons/core-free-icons'
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
  const bulkDelete = useBulkDeleteCategories()
  const bulkActivate = useBulkActivateCategories()
  const bulkDeactivate = useBulkDeactivateCategories()
  const bulkEnableFeatured = useBulkEnableFeatured()
  const bulkDisableFeatured = useBulkDisableFeatured()
  const bulkEnableSync = useBulkEnableSync()
  const bulkDisableSync = useBulkDisableSync()
  const exportCategories = useExportCategories()
  const { data: users = [] } = useUsers()

  const selectedCategories = selectedRows.map((row) => row.original as Category)
  const ids = selectedCategories.map((category) => category.id)

  const handleBulkDelete = async () => {
    try {
      const response = await bulkDelete.mutateAsync(ids)
      setShowDeleteConfirm(false)
      table.resetRowSelection()
      const message = (response as any)?.message || `Deleted ${ids.length} categor${ids.length > 1 ? 'ies' : 'y'}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkActivate = async () => {
    try {
      const response = await bulkActivate.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Activated ${ids.length} categor${ids.length > 1 ? 'ies' : 'y'}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkDeactivate = async () => {
    try {
      const response = await bulkDeactivate.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Deactivated ${ids.length} categor${ids.length > 1 ? 'ies' : 'y'}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkEnableFeatured = async () => {
    try {
      const response = await bulkEnableFeatured.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Enabled featured for ${ids.length} categor${ids.length > 1 ? 'ies' : 'y'}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkDisableFeatured = async () => {
    try {
      const response = await bulkDisableFeatured.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Disabled featured for ${ids.length} categor${ids.length > 1 ? 'ies' : 'y'}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkEnableSync = async () => {
    try {
      const response = await bulkEnableSync.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Enabled sync for ${ids.length} categor${ids.length > 1 ? 'ies' : 'y'}`
      toast.success(message)
    } catch (error: any) {
      handleApiError(error)
    }
  }

  const handleBulkDisableSync = async () => {
    try {
      const response = await bulkDisableSync.mutateAsync(ids)
      table.resetRowSelection()
      const message = (response as any)?.message || `Disabled sync for ${ids.length} categor${ids.length > 1 ? 'ies' : 'y'}`
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
      const response = await exportCategories.mutateAsync({
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
      <BulkActionsToolbar table={table} entityName='category'>
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={handleBulkActivate}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || bulkEnableFeatured.isPending || bulkDisableFeatured.isPending || bulkEnableSync.isPending || bulkDisableSync.isPending}
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
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || bulkEnableFeatured.isPending || bulkDisableFeatured.isPending || bulkEnableSync.isPending || bulkDisableSync.isPending}
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
                onClick={handleBulkEnableFeatured}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || bulkEnableFeatured.isPending || bulkDisableFeatured.isPending || bulkEnableSync.isPending || bulkDisableSync.isPending}
              >
                <HugeiconsIcon icon={StarIcon} className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enable featured for selected</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={handleBulkDisableFeatured}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || bulkEnableFeatured.isPending || bulkDisableFeatured.isPending || bulkEnableSync.isPending || bulkDisableSync.isPending}
              >
                <HugeiconsIcon icon={MultiplicationSignIcon} className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Disable featured for selected</TooltipContent>
          </Tooltip>
          <Separator orientation='vertical'/>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={handleBulkEnableSync}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || bulkEnableFeatured.isPending || bulkDisableFeatured.isPending || bulkEnableSync.isPending || bulkDisableSync.isPending}
              >
                <HugeiconsIcon icon={CloudUploadIcon} className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enable sync for selected</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={handleBulkDisableSync}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || bulkEnableFeatured.isPending || bulkDisableFeatured.isPending || bulkEnableSync.isPending || bulkDisableSync.isPending}
              >
                <HugeiconsIcon icon={CancelCircleIcon} className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Disable sync for selected</TooltipContent>
          </Tooltip>
          <Separator orientation='vertical'/>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowExportDialog(true)}
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || bulkEnableFeatured.isPending || bulkDisableFeatured.isPending || bulkEnableSync.isPending || bulkDisableSync.isPending || exportCategories.isPending}
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
                disabled={bulkActivate.isPending || bulkDeactivate.isPending || bulkDelete.isPending || bulkEnableFeatured.isPending || bulkDisableFeatured.isPending || bulkEnableSync.isPending || bulkDisableSync.isPending || exportCategories.isPending}
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
      <CategoriesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleBulkDelete}
        count={selectedRows.length}
      />
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
        isExporting={exportCategories.isPending}
        title='Export Categories'
        users={users}
      />
    </>
  )
}

