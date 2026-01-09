"use client"

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { activeStatusMap, activeStatuses } from '../data/data'
import { type Unit } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { HugeiconsIcon } from '@hugeicons/react'

export const unitsColumns: ColumnDef<Unit>[] = [
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
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Code' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 font-mono'>{row.getValue('code')}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
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
    accessorKey: 'base_unit_relation',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Base Unit' />
    ),
    cell: ({ row }) => {
      const baseUnit = row.original.base_unit_relation
      return (
        <LongText className='max-w-36'>
          {baseUnit ? `${baseUnit.code} (${baseUnit.name})` : '-'}
        </LongText>
      )
    },
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'operator',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Operator' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-24 font-mono'>
        {row.original.operator || '-'}
      </LongText>
    ),
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'operation_value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Operation Value' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-24'>
        {row.original.operation_value !== null ? row.original.operation_value : '-'}
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

