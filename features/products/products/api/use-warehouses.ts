"use client"

import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { type ApiResponse } from '@/lib/api-client'
import { z } from 'zod'

const warehouseSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
})

const warehouseListSchema = z.array(warehouseSchema)

export type Warehouse = z.infer<typeof warehouseSchema>

type WarehousesResponse = ApiResponse<Warehouse[]>

type WarehousesParams = {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
}

export function useWarehouses(params?: WarehousesParams) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: async () => {
      const response = await get<Warehouse[]>('/warehouses', {
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        search: params?.search || undefined,
        is_active: params?.is_active !== undefined ? params.is_active : undefined,
      })

      if (response.data) {
        const validated = warehouseListSchema.parse(response.data)
        return {
          data: validated,
          pagination: response.pagination,
          links: response.links,
        }
      }

      return {
        data: [],
        pagination: response.pagination,
        links: response.links,
      }
    },
    enabled: isAuthenticated && !isSessionLoading,
  })
}

/**
 * Hook to fetch all active warehouses (simplified version)
 */
export function useActiveWarehouses() {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()

  return useQuery({
    queryKey: ['warehouses', 'active'],
    queryFn: async () => {
      const response = await get<Warehouse[]>('/warehouses/all/active')

      if (response.data) {
        const validated = warehouseListSchema.parse(response.data)
        return validated
      }

      return []
    },
    enabled: isAuthenticated && !isSessionLoading,
  })
}

