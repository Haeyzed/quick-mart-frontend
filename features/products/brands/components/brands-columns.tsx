"use client"

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { activeStatusMap, activeStatuses } from '../data/data'
import { type Brand } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'

export const brandsColumns: ColumnDef<Brand>[] = [
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
      <div className='flex items-center gap-3 ps-3'>
        {row.original.image_url ? (
          <Image
            src={row.original.image_url}
            alt={row.original.name}
            width={40}
            height={40}
            className='size-10 rounded-md object-cover'
          />
        ) : (
          <div className='flex size-10 items-center justify-center rounded-md bg-muted'>
            <span className='text-xs font-medium'>
              {row.original.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <LongText className='max-w-36'>{row.getValue('name')}</LongText>
      </div>
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
    accessorKey: 'slug',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Slug' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>
        {row.original.slug || '-'}
      </LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'short_description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48'>
        {row.original.short_description || '-'}
      </LongText>
    ),
    meta: { className: 'w-48' },
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

