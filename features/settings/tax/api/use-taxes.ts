"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { type ApiResponse } from '@/lib/api-client'
import { taxSchema, taxListSchema, type Tax } from '../data/schema'

type TaxesResponse = ApiResponse<Tax[]>

type TaxesParams = {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
}

export function useTaxes(params?: TaxesParams) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['taxes', params],
    queryFn: async () => {
      const response = await get<Tax[]>('/taxes', {
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        search: params?.search || undefined,
        is_active: params?.is_active !== undefined ? params.is_active : undefined,
      })

      if (response.data) {
        const validated = taxListSchema.parse(response.data)
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

export function useTax(id: number) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['taxes', id],
    queryFn: async () => {
      const response = await get<Tax>(`/taxes/${id}`)
      if (response.data) {
        return taxSchema.parse(response.data)
      }
      throw new Error('Tax not found')
    },
    enabled: !!id && isAuthenticated && !isSessionLoading,
  })
}

export function useCreateTax() {
  const queryClient = useQueryClient()
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await post<Tax>('/taxes', data)
      if (response.data) {
        return {
          data: taxSchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to create tax')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
    },
  })
}

export function useUpdateTax() {
  const queryClient = useQueryClient()
  const { put } = useApiClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const response = await put<Tax>(`/taxes/${id}`, data)
      if (response.data) {
        return {
          data: taxSchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to update tax')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
      queryClient.invalidateQueries({ queryKey: ['taxes', variables.id] })
    },
  })
}

export function useDeleteTax() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteRequest(`/taxes/${id}`)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
    },
  })
}

export function useBulkDeleteTaxes() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await deleteRequest('/taxes/bulk-destroy', {
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
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
    },
  })
}

export function useImportTaxes() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await postFormData('/taxes/import', formData)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
    },
  })
}

export function useBulkActivateTaxes() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/taxes/bulk-activate', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
    },
  })
}

export function useBulkDeactivateTaxes() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/taxes/bulk-deactivate', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
    },
  })
}

export function useExportTaxes() {
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (data: {
      ids?: number[]
      format: 'excel' | 'pdf'
      method: 'download' | 'email'
      columns: string[]
      user_id?: number
    }) => {
      if (data.method === 'download') {
        const blob = await post('/taxes/export', data, {
          responseType: 'blob',
        }) as Blob
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const fileName = `taxes-export-${Date.now()}.${data.format === 'pdf' ? 'pdf' : 'xlsx'}`
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        return { message: 'Export downloaded successfully' }
      } else {
        const response = await post('/taxes/export', data, {
          responseType: 'json',
        })
        return response
      }
    },
  })
}

