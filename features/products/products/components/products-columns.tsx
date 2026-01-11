"use client"

import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Product } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { HugeiconsIcon } from '@hugeicons/react'
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom'
import { useTheme } from '@/context/theme-provider'
import Image from 'next/image'
import Link from 'next/link'

function ImageZoomCell({ src, alt }: { src: string; alt: string }) {
  const { resolvedTheme } = useTheme()
  return (
    <ImageZoom
      backdropClassName={cn(
        resolvedTheme === 'dark'
          ? '[&_[data-rmiz-modal-overlay="visible"]]:bg-white/80'
          : '[&_[data-rmiz-modal-overlay="visible"]]:bg-black/80'
      )}
    >
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        className='size-10 rounded-md object-cover'
        unoptimized
      />
    </ImageZoom>
  )
}

export const productsColumns: ColumnDef<Product>[] = [
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
      <DataTableColumnHeader column={column} title='Product' />
    ),
    cell: ({ row }) => (
      <div className='flex items-center gap-3 ps-3'>
        {row.original.image_url && row.original.image_url.length > 0 ? (
          <ImageZoomCell
            src={row.original.image_url[0]}
            alt={row.original.name}
          />
        ) : (
          <div className='flex size-10 items-center justify-center rounded-md bg-muted'>
            <span className='text-xs font-medium'>
              {row.original.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className='flex flex-col'>
          <LongText className='max-w-36 font-medium'>{row.getValue('name')}</LongText>
          <span className='text-xs text-muted-foreground'>{row.original.code}</span>
        </div>
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
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      const typeColors: Record<string, string> = {
        standard: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        combo: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        digital: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        service: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      }
      return (
        <Badge variant='outline' className={cn('capitalize', typeColors[type] || '')}>
          {type}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-32'>
        {row.original.category?.name || '-'}
      </LongText>
    ),
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'brand',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Brand' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-32'>
        {row.original.brand?.title || '-'}
      </LongText>
    ),
    meta: { className: 'w-32' },
  },
  {
    accessorKey: 'qty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Stock' />
    ),
    cell: ({ row }) => {
      const qty = row.getValue('qty') as number | null
      const alertQty = row.original.alert_quantity
      const isLowStock = alertQty !== null && qty !== null && qty <= alertQty
      
      return (
        <div className='flex flex-col'>
          <span className={cn(
            'font-medium',
            isLowStock && 'text-orange-600 dark:text-orange-400'
          )}>
            {qty !== null ? qty.toFixed(2) : '-'}
          </span>
          {isLowStock && (
            <span className='text-xs text-orange-600 dark:text-orange-400'>
              Low stock
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'unit',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Unit' />
    ),
    cell: ({ row }) => (
      <span className='text-sm'>
        {row.original.unit?.unit_name || '-'}
      </span>
    ),
    meta: { className: 'w-24' },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      const promoPrice = row.original.promotion_price
      const onPromotion = row.original.promotion && promoPrice
      
      return (
        <div className='flex flex-col'>
          {onPromotion ? (
            <>
              <span className='text-sm font-medium text-muted-foreground line-through'>
                ${price.toFixed(2)}
              </span>
              <span className='text-sm font-semibold text-green-600 dark:text-green-400'>
                ${promoPrice?.toFixed(2)}
              </span>
            </>
          ) : (
            <span className='text-sm font-medium'>${price.toFixed(2)}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'cost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cost' />
    ),
    cell: ({ row }) => {
      const cost = row.getValue('cost') as number
      return <span className='text-sm'>${cost.toFixed(2)}</span>
    },
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.original.is_active
      return (
        <Badge
          variant='outline'
          className={cn(
            'gap-1.5 border',
            isActive
              ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
              : 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800'
          )}
        >
          {isActive ? 'Active' : 'Inactive'}
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

