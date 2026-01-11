"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'
import { activeStatuses, productTypes } from '../data/data'
import { useProducts } from '../api/use-products'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { productsColumns as columns } from './products-columns'
import { ProductsEmptyState } from './products-empty-state'
import { toast } from 'sonner'

export function ProductsTable() {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Synced with URL states
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'name', searchKey: 'search', type: 'string' },
      { columnId: 'type', searchKey: 'product_type', type: 'array' },
      { columnId: 'is_active', searchKey: 'is_active', type: 'array' },
      { columnId: 'stock_filter', searchKey: 'stock_filter', type: 'array' },
    ],
  })

  // Extract API params from URL and column filters
  const apiParams = useMemo(() => {
    const page = pagination.pageIndex + 1
    const perPage = pagination.pageSize
    const nameFilter = columnFilters.find((f) => f.id === 'name')
    const typeFilter = columnFilters.find((f) => f.id === 'type')
    const isActiveFilter = columnFilters.find((f) => f.id === 'is_active')
    const stockFilter = columnFilters.find((f) => f.id === 'stock_filter')
    
    // Map is_active filter: convert 'active'/'inactive' to boolean
    let isActive: boolean | undefined = undefined
    if (isActiveFilter?.value && Array.isArray(isActiveFilter.value)) {
      if (isActiveFilter.value.length === 1) {
        if (isActiveFilter.value[0] === 'active') {
          isActive = true
        } else if (isActiveFilter.value[0] === 'inactive') {
          isActive = false
        }
      }
    }

    // Map type filter
    let productType: 'standard' | 'combo' | 'digital' | 'service' | 'all' = 'all'
    if (typeFilter?.value && Array.isArray(typeFilter.value) && typeFilter.value.length === 1) {
      productType = typeFilter.value[0] as any
    }

    // Map stock filter
    let stockFilterValue: 'all' | 'with' | 'without' = 'all'
    if (stockFilter?.value && Array.isArray(stockFilter.value) && stockFilter.value.length === 1) {
      stockFilterValue = stockFilter.value[0] as any
    }
    
    return {
      page,
      per_page: perPage,
      search: nameFilter?.value as string | undefined,
      product_type: productType,
      is_active: isActive,
      stock_filter: stockFilterValue,
    }
  }, [pagination, columnFilters])

  // Fetch data from API
  const { data, isLoading, error } = useProducts(apiParams)

  // Calculate pagination info from API response
  const pageCount = useMemo(() => {
    if (!data?.pagination) return 0
    return Math.ceil((data.pagination.total || 0) / (data.pagination.per_page || 10))
  }, [data?.pagination])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data?.data || [],
    columns,
    pageCount,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    manualPagination: true, // Server-side pagination
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    if (pageCount > 0) {
      ensurePageInRange(pageCount)
    }
  }, [pageCount, ensurePageInRange])

  if (error) {
    console.log(error.message)
    toast.error(error.message || 'Failed to load products')
    return null
  }

  // Show empty state if no data (check total from pagination)
  const hasData = data?.pagination?.total && data.pagination.total > 0
  if (!isLoading && !hasData) {
    return <ProductsEmptyState />
  }

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter products by name, code...'
        searchKey='name'
        filters={[
          {
            columnId: 'type',
            title: 'Product Type',
            options: productTypes.map((type) => ({
              label: type.label,
              value: type.value,
            })),
          },
          {
            columnId: 'is_active',
            title: 'Status',
            options: activeStatuses.map((status) => ({
              label: status.label,
              value: status.value,
            })),
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        (header.column.columnDef.meta as any)?.className,
                        (header.column.columnDef.meta as any)?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          {isLoading ? (
            <DataTableSkeleton columnCount={columns.length} />
          ) : (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='group/row'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                          (cell.column.columnDef.meta as any)?.className,
                          (cell.column.columnDef.meta as any)?.tdClassName
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          )}
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}

