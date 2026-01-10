"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { type ApiResponse } from '@/lib/api-client'
import { categorySchema, categoryListSchema, type Category } from '../data/schema'

type CategoriesResponse = ApiResponse<Category[]>

type CategoriesParams = {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
  featured?: boolean
  is_sync_disable?: boolean
  parent_id?: number | null
}

export function useCategories(params?: CategoriesParams) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['categories', params],
    queryFn: async () => {
      const response = await get<Category[]>('/categories', {
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        search: params?.search || undefined,
        is_active: params?.is_active !== undefined ? params.is_active : undefined,
        featured: params?.featured !== undefined ? params.featured : undefined,
        is_sync_disable: params?.is_sync_disable !== undefined ? params.is_sync_disable : undefined,
        parent_id: params?.parent_id !== undefined ? params.parent_id : undefined,
      })

      if (response.data) {
        const validated = categoryListSchema.parse(response.data)
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

export function useCategory(id: number) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const response = await get<Category>(`/categories/${id}`)
      if (response.data) {
        return categorySchema.parse(response.data)
      }
      throw new Error('Category not found')
    },
    enabled: !!id && isAuthenticated && !isSessionLoading,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await postFormData<Category>('/categories', data)
      if (response.data) {
        return {
          data: categorySchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to create category')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      // Use PUT with FormData for updates - Laravel expects _method=PUT in FormData
      data.append('_method', 'PUT')
      const response = await postFormData<Category>(`/categories/${id}`, data)
      if (response.data) {
        return {
          data: categorySchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to update category')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['categories', variables.id] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteRequest(`/categories/${id}`)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useBulkDeleteCategories() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      // Laravel expects DELETE method for bulk-destroy
      const response = await deleteRequest('/categories/bulk-destroy', {
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
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useImportCategories() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await postFormData('/categories/import', formData)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useBulkActivateCategories() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/categories/bulk-activate', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useBulkDeactivateCategories() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/categories/bulk-deactivate', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useRootCategories() {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()

  return useQuery({
    queryKey: ['categories', 'root'],
    queryFn: async () => {
      const response = await get<Category[]>('/categories', {
        is_active: true,
        per_page: 100,
      })
      if (response.data) {
        // Filter root categories (parent_id is null)
        const allCategories = categoryListSchema.parse(response.data)
        return allCategories.filter(cat => cat.is_root || !cat.parent_id)
      }
      return []
    },
    enabled: isAuthenticated && !isSessionLoading,
  })
}

export function useBulkEnableFeatured() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/categories/bulk-enable-featured', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useBulkDisableFeatured() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/categories/bulk-disable-featured', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useBulkEnableSync() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/categories/bulk-enable-sync', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useBulkDisableSync() {
  const queryClient = useQueryClient()
  const { patch } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await patch('/categories/bulk-disable-sync', { ids })
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useExportCategories() {
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
        // For download, get blob and trigger download
        const blob = await post('/categories/export', data, {
          responseType: 'blob',
        }) as Blob
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const fileName = `categories-export-${Date.now()}.${data.format === 'pdf' ? 'pdf' : 'xlsx'}`
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        return { message: 'Export downloaded successfully' }
      } else {
        // For email, get JSON response
        const response = await post('/categories/export', data, {
          responseType: 'json',
        })
        return response
      }
    },
  })
}

