"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { type ApiResponse } from '@/lib/api-client'
import { unitSchema, unitListSchema, type Unit } from '../data/schema'

type UnitsResponse = ApiResponse<Unit[]>

type UnitsParams = {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
}

export function useUnits(params?: UnitsParams) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['units', params],
    queryFn: async () => {
      const response = await get<Unit[]>('/units', {
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        search: params?.search || undefined,
        is_active: params?.is_active !== undefined ? params.is_active : undefined,
      })

      if (response.data) {
        const validated = unitListSchema.parse(response.data)
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
    enabled: isAuthenticated && !isSessionLoading, // Only run query when session is loaded and authenticated
  })
}

export function useUnit(id: number) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['units', id],
    queryFn: async () => {
      const response = await get<Unit>(`/units/${id}`)
      if (response.data) {
        return unitSchema.parse(response.data)
      }
      throw new Error('Unit not found')
    },
    enabled: !!id && isAuthenticated && !isSessionLoading,
  })
}

export function useBaseUnits() {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['units', 'base-units'],
    queryFn: async () => {
      const response = await get<Unit[]>('/units/base-units')
      if (response.data) {
        const validated = unitListSchema.parse(response.data)
        return validated
      }
      return []
    },
    enabled: isAuthenticated && !isSessionLoading,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await post<Unit>('/units', data)
      if (response.data) {
        return {
          data: unitSchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to create unit')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()
  const { put } = useApiClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const response = await put<Unit>(`/units/${id}`, data)
      if (response.data) {
        return {
          data: unitSchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to update unit')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      queryClient.invalidateQueries({ queryKey: ['units', variables.id] })
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteRequest(`/units/${id}`)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useBulkDeleteUnits() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Laravel expects DELETE method for bulk-destroy
      const response = await deleteRequest('/units/bulk-destroy', {
        body: JSON.stringify({ ids }),
        headers: {
          'Content-Type': 'application/json',
        },
      } as any)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useImportUnits() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await postFormData('/units/import', formData)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useBulkActivateUnits() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/units/bulk-activate', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useBulkDeactivateUnits() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/units/bulk-deactivate', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useExportUnits() {
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (data: {
      ids?: number[]
      format: 'excel' | 'pdf'
      method: 'download' | 'email'
      user_id?: number
    }) => {
      if (data.method === 'download') {
        const blob = await post('/units/export', data, {
          responseType: 'blob',
        }) as Blob
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const fileName = `units-export-${Date.now()}.${data.format === 'pdf' ? 'pdf' : 'xlsx'}`
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        return { message: 'Export downloaded successfully' }
      } else {
        const response = await post('/units/export', data, {
          responseType: 'json',
        })
        return response
      }
    },
  })
}

