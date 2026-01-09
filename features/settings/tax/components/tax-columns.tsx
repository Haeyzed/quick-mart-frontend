"use client"

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { activeStatusMap, activeStatuses } from '../data/data'
import { type Tax } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { HugeiconsIcon } from '@hugeicons/react'

export const taxesColumns: ColumnDef<Tax>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>
        {row.getValue('name')}
      </LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'rate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rate (%)' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-24'>
        {row.getValue('rate')}%
      </LongText>
    ),
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.is_active ? 'active' : 'inactive'
      const statusConfig = activeStatuses.find((s) => s.value === status)
      const statusClass = activeStatusMap.get(status) || ''

      return (
        <Badge
          variant='outline'
          className={cn('gap-1.5 border', statusClass)}
        >
          {statusConfig && (
            <HugeiconsIcon
              icon={statusConfig.icon}
              className='size-3.5'
            />
          )}
          {statusConfig?.label}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.is_active ? 'active' : 'inactive')
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
    meta: {
      className: cn('max-md:sticky end-0 z-10 rounded-tr-[inherit]'),
    },
  },
]

