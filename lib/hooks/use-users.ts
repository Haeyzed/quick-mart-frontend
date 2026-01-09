"use client"

import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '@/lib/hooks/use-api-client'
import type { ApiResponse } from '@/lib/api-client'

export type User = {
  id: number
  name: string
  email: string
}

export function useUsers() {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await get<User[]>('/users')
      if (response.data) {
        return { data: response.data }
      }
      return { data: [] }
    },
    enabled: isAuthenticated && !isSessionLoading,
    select: (data) => data.data || [],
  })
}

