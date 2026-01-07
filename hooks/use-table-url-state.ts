"use client"

import { useMemo, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
} from '@tanstack/react-table'

type UseTableUrlStateParams = {
  pagination?: {
    pageKey?: string
    pageSizeKey?: string
    defaultPage?: number
    defaultPageSize?: number
  }
  globalFilter?: {
    enabled?: boolean
    key?: string
    trim?: boolean
  }
  columnFilters?: Array<
    | {
        columnId: string
        searchKey: string
        type?: 'string'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
    | {
        columnId: string
        searchKey: string
        type: 'array'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
  >
}

type UseTableUrlStateReturn = {
  // Global filter
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  // Column filters
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  // Pagination
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  // Helpers
  ensurePageInRange: (
    pageCount: number,
    opts?: { resetTo?: 'first' | 'last' }
  ) => void
}

export function useTableUrlState(
  params: UseTableUrlStateParams
): UseTableUrlStateReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    pagination: paginationCfg,
    globalFilter: globalFilterCfg,
    columnFilters: columnFiltersCfg = [],
  } = params

  const pageKey = paginationCfg?.pageKey ?? 'page'
  const pageSizeKey = paginationCfg?.pageSizeKey ?? 'pageSize'
  const defaultPage = paginationCfg?.defaultPage ?? 1
  const defaultPageSize = paginationCfg?.defaultPageSize ?? 10

  const globalFilterKey = globalFilterCfg?.key ?? 'filter'
  const globalFilterEnabled = globalFilterCfg?.enabled ?? true
  const trimGlobal = globalFilterCfg?.trim ?? true

  // Helper to update URL search params
  const updateSearchParams = useCallback(
    (updater: (prev: URLSearchParams) => URLSearchParams) => {
      const params = new URLSearchParams(searchParams.toString())
      const updated = updater(params)
      const newUrl = `${window.location.pathname}?${updated.toString()}`
      router.push(newUrl, { scroll: false })
    },
    [router, searchParams]
  )

  // Build initial column filters from the current search params
  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    const collected: ColumnFiltersState = []
    for (const cfg of columnFiltersCfg) {
      const raw = searchParams.get(cfg.searchKey)
      const deserialize = cfg.deserialize ?? ((v: unknown) => v)
      if (cfg.type === 'string') {
        const value = raw ? (deserialize(raw) as string) : ''
        if (typeof value === 'string' && value.trim() !== '') {
          collected.push({ id: cfg.columnId, value })
        }
      } else {
        // default to array type
        const value = raw
          ? (deserialize(JSON.parse(raw)) as unknown[])
          : []
        if (Array.isArray(value) && value.length > 0) {
          collected.push({ id: cfg.columnId, value })
        }
      }
    }
    return collected
  }, [columnFiltersCfg, searchParams])

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters)

  const pagination: PaginationState = useMemo(() => {
    const rawPage = searchParams.get(pageKey)
    const rawPageSize = searchParams.get(pageSizeKey)
    const pageNum = rawPage ? Number(rawPage) : defaultPage
    const pageSizeNum = rawPageSize ? Number(rawPageSize) : defaultPageSize
    return { pageIndex: Math.max(0, pageNum - 1), pageSize: pageSizeNum }
  }, [searchParams, pageKey, pageSizeKey, defaultPage, defaultPageSize])

  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater
      const nextPage = next.pageIndex + 1
      const nextPageSize = next.pageSize

      updateSearchParams((params) => {
        if (nextPage <= defaultPage) {
          params.delete(pageKey)
        } else {
          params.set(pageKey, String(nextPage))
        }
        if (nextPageSize === defaultPageSize) {
          params.delete(pageSizeKey)
        } else {
          params.set(pageSizeKey, String(nextPageSize))
        }
        return params
      })
    },
    [pagination, updateSearchParams, pageKey, pageSizeKey, defaultPage, defaultPageSize]
  )

  const [globalFilter, setGlobalFilter] = useState<string | undefined>(() => {
    if (!globalFilterEnabled) return undefined
    const raw = searchParams.get(globalFilterKey)
    return typeof raw === 'string' ? raw : ''
  })

  const onGlobalFilterChange: OnChangeFn<string> | undefined =
    globalFilterEnabled
      ? useCallback(
          (updater) => {
            const next =
              typeof updater === 'function'
                ? updater(globalFilter ?? '')
                : updater
            const value = trimGlobal ? next.trim() : next
            setGlobalFilter(value)

            updateSearchParams((params) => {
              params.delete(pageKey) // Reset to first page
              if (value) {
                params.set(globalFilterKey, value)
              } else {
                params.delete(globalFilterKey)
              }
              return params
            })
          },
          [globalFilter, trimGlobal, updateSearchParams, pageKey, globalFilterKey]
        )
      : undefined

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = useCallback(
    (updater) => {
      const next =
        typeof updater === 'function' ? updater(columnFilters) : updater
      setColumnFilters(next)

      updateSearchParams((params) => {
        params.delete(pageKey) // Reset to first page

        for (const cfg of columnFiltersCfg) {
          const found = next.find((f) => f.id === cfg.columnId)
          const serialize = cfg.serialize ?? ((v: unknown) => v)
          if (cfg.type === 'string') {
            const value =
              typeof found?.value === 'string' ? (found.value as string) : ''
            if (value.trim() !== '') {
              params.set(cfg.searchKey, serialize(value) as string)
            } else {
              params.delete(cfg.searchKey)
            }
          } else {
            const value = Array.isArray(found?.value)
              ? (found!.value as unknown[])
              : []
            if (value.length > 0) {
              params.set(cfg.searchKey, JSON.stringify(serialize(value)))
            } else {
              params.delete(cfg.searchKey)
            }
          }
        }
        return params
      })
    },
    [columnFilters, columnFiltersCfg, updateSearchParams, pageKey]
  )

  const ensurePageInRange = useCallback(
    (
      pageCount: number,
      opts: { resetTo?: 'first' | 'last' } = { resetTo: 'first' }
    ) => {
      const currentPage = searchParams.get(pageKey)
      const pageNum = currentPage ? Number(currentPage) : defaultPage
      if (pageCount > 0 && pageNum > pageCount) {
        updateSearchParams((params) => {
          if (opts.resetTo === 'last') {
            params.set(pageKey, String(pageCount))
          } else {
            params.delete(pageKey)
          }
          return params
        })
      }
    },
    [searchParams, pageKey, defaultPage, updateSearchParams]
  )

  return {
    globalFilter: globalFilterEnabled ? (globalFilter ?? '') : undefined,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  }
}

