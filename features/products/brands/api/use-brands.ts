"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { type ApiResponse } from '@/lib/api-client'
import { brandSchema, brandListSchema, type Brand } from '../data/schema'

type BrandsResponse = ApiResponse<Brand[]>

type BrandsParams = {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
}

export function useBrands(params?: BrandsParams) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['brands', params],
    queryFn: async () => {
      const response = await get<Brand[]>('/brands', {
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        search: params?.search || undefined,
        is_active: params?.is_active !== undefined ? params.is_active : undefined,
      })

      if (response.data) {
        const validated = brandListSchema.parse(response.data)
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

export function useBrand(id: number) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['brands', id],
    queryFn: async () => {
      const response = await get<Brand>(`/brands/${id}`)
      if (response.data) {
        return brandSchema.parse(response.data)
      }
      throw new Error('Brand not found')
    },
    enabled: !!id && isAuthenticated && !isSessionLoading,
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await postFormData<Brand>('/brands', data)
      if (response.data) {
        return {
          data: brandSchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to create brand')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      // Use PUT with FormData for updates - Laravel expects _method=PUT in FormData
      data.append('_method', 'PUT')
      const response = await postFormData<Brand>(`/brands/${id}`, data)
      if (response.data) {
        return {
          data: brandSchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to update brand')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      queryClient.invalidateQueries({ queryKey: ['brands', variables.id] })
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteRequest(`/brands/${id}`)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useBulkDeleteBrands() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Laravel expects DELETE method for bulk-destroy
      const response = await deleteRequest('/brands/bulk-destroy', {
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
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useImportBrands() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await postFormData('/brands/import', formData)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useBulkActivateBrands() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/brands/bulk-activate', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useBulkDeactivateBrands() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/brands/bulk-deactivate', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
    },
  })
}

export function useExportBrands() {
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (data: {
      ids?: number[]
      format: 'excel' | 'pdf'
      method: 'download' | 'email'
      user_id?: number
    }) => {
      if (data.method === 'download') {
        const blob = await post('/brands/export', data, {
          responseType: 'blob',
        }) as Blob
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const fileName = `brands-export-${Date.now()}.${data.format === 'pdf' ? 'pdf' : 'xlsx'}`
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        return { message: 'Export downloaded successfully' }
      } else {
        const response = await post('/brands/export', data, {
          responseType: 'json',
        })
        return response
      }
    },
  })
}

