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
import { type Unit } from '../data/schema'
import { activeStatuses } from '../data/data'

type UnitsViewDialogProps = {
  currentRow?: Unit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnitsViewDialog({
  currentRow,
  open,
  onOpenChange,
}: UnitsViewDialogProps) {
  if (!currentRow) return null

  const status = activeStatuses.find((s) => s.value === (currentRow.is_active ? 'active' : 'inactive'))
  const StatusIcon = status?.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className='sm:max-w-lg' onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader className='text-start'>
          <DialogTitle>Unit Details</DialogTitle>
          <DialogDescription>
            View unit information below.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <div className='space-y-6 px-0.5'>
            <div className='space-y-2'>
              <div className='text-sm font-medium text-muted-foreground'>Code</div>
              <div className='text-sm font-medium font-mono'>{currentRow.code}</div>
            </div>

            <div className='space-y-2'>
              <div className='text-sm font-medium text-muted-foreground'>Name</div>
              <div className='text-sm font-medium'>{currentRow.name}</div>
            </div>

            {currentRow.base_unit_relation && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>Base Unit</div>
                <div className='text-sm'>
                  {currentRow.base_unit_relation.code} - {currentRow.base_unit_relation.name}
                </div>
              </div>
            )}

            {currentRow.operator && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>Operator</div>
                <div className='text-sm font-mono'>{currentRow.operator}</div>
              </div>
            )}

            {currentRow.operation_value !== null && (
              <div className='space-y-2'>
                <div className='text-sm font-medium text-muted-foreground'>Operation Value</div>
                <div className='text-sm'>{currentRow.operation_value}</div>
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

