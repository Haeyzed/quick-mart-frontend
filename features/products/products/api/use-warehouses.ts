"use client"

import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { type ApiResponse } from '@/lib/api-client'
import { z } from 'zod'

// Simple warehouse schema for the list
const warehouseSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
})

const warehouseListSchema = z.array(warehouseSchema)

export type Warehouse = z.infer<typeof warehouseSchema>

type WarehousesResponse = ApiResponse<Warehouse[]>

/**
 * Hook to fetch all active warehouses
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

