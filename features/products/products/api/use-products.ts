"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { type ApiResponse } from '@/lib/api-client'
import { productSchema, productListSchema, type Product } from '../data/schema'

type ProductsResponse = ApiResponse<Product[]>

type ProductsParams = {
  page?: number
  per_page?: number
  search?: string
  warehouse_id?: number
  product_type?: 'standard' | 'combo' | 'digital' | 'service' | 'all'
  brand_id?: number
  category_id?: number
  unit_id?: number
  tax_id?: number
  imeiorvariant?: 'imei' | 'variant' | '0'
  stock_filter?: 'all' | 'with' | 'without'
  is_recipe?: boolean
}

export function useProducts(params?: ProductsParams) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await get<Product[]>('/products', {
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        search: params?.search || undefined,
        warehouse_id: params?.warehouse_id || undefined,
        product_type: params?.product_type || 'all',
        brand_id: params?.brand_id || undefined,
        category_id: params?.category_id || undefined,
        unit_id: params?.unit_id || undefined,
        tax_id: params?.tax_id || undefined,
        imeiorvariant: params?.imeiorvariant || '0',
        stock_filter: params?.stock_filter || 'all',
        is_recipe: params?.is_recipe !== undefined ? params.is_recipe : undefined,
      })

      if (response.data) {
        const validated = productListSchema.parse(response.data)
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

export function useProduct(id: number) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()
  
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const response = await get<Product>(`/products/${id}`)
      if (response.data) {
        return productSchema.parse(response.data)
      }
      throw new Error('Product not found')
    },
    enabled: !!id && isAuthenticated && !isSessionLoading,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await postFormData<Product>('/products', data)
      if (response.data) {
        return {
          data: productSchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to create product')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      // Use PUT with FormData for updates - Laravel expects _method=PUT in FormData
      data.append('_method', 'PUT')
      const response = await postFormData<Product>(`/products/${id}`, data)
      if (response.data) {
        return {
          data: productSchema.parse(response.data),
          message: response.message,
        }
      }
      throw new Error(response.message || 'Failed to update product')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteRequest(`/products/${id}`)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient()
  const { delete: deleteRequest } = useApiClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await deleteRequest('/products/bulk-destroy', {
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
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useProductsWithoutVariant() {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()

  return useQuery({
    queryKey: ['products', 'without-variant'],
    queryFn: async () => {
      const response = await get<Product[]>('/products/without-variant')
      if (response.data) {
        return productListSchema.parse(response.data)
      }
      return []
    },
    enabled: isAuthenticated && !isSessionLoading,
  })
}

export function useProductsWithVariant() {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()

  return useQuery({
    queryKey: ['products', 'with-variant'],
    queryFn: async () => {
      const response = await get<Product[]>('/products/with-variant')
      if (response.data) {
        return productListSchema.parse(response.data)
      }
      return []
    },
    enabled: isAuthenticated && !isSessionLoading,
  })
}

export function useGenerateProductCode() {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()

  return useQuery({
    queryKey: ['products', 'generate-code'],
    queryFn: async () => {
      const response = await get<{ code: string }>('/products/generate-code')
      if (response.data) {
        return response.data.code
      }
      throw new Error('Failed to generate product code')
    },
    enabled: isAuthenticated && !isSessionLoading,
    staleTime: 0, // Always fetch fresh code
    gcTime: 0, // Don't cache generated codes
  })
}

export function useImportProducts() {
  const queryClient = useQueryClient()
  const { postFormData } = useApiClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await postFormData('/products/import', formData)
      return {
        ...response,
        message: response.message,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useReorderProductImages() {
  const queryClient = useQueryClient()
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async ({ id, imageUrls }: { id: number; imageUrls: string[] }) => {
      const response = await post<Product>(`/products/${id}/reorder-images`, {
        image_urls: imageUrls,
      }, { responseType: 'json' })
      
      // Handle both ApiResponse and Blob types
      if (response && typeof response === 'object' && 'data' in response) {
        const apiResponse = response as ApiResponse<Product>
        if (apiResponse.data) {
          return {
            data: productSchema.parse(apiResponse.data),
            message: apiResponse.message,
          }
        }
        throw new Error(apiResponse.message || 'Failed to reorder product images')
      }
      throw new Error('Failed to reorder product images')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['products', variables.id] })
    },
  })
}

export type ComboSearchResponse = {
  name: string
  code: string
  price: number
  promotion_price: number
  qty: number
  id: number
  variant_id: number | null
  cost: number
  brand: string | null
  unit_id: number | null
  units: Array<{
    id: number
    name: string
    operation_value: number
    operator: string
    selected: boolean
  }>
  additional_price: number
}

export function useComboProductSearch() {
  const { get } = useApiClient()

  return useMutation({
    mutationFn: async (searchCode: string) => {
      const response = await get<ComboSearchResponse[]>('/products/combo-search', {
        data: searchCode,
      })
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0]
      }
      throw new Error('Product not found')
    },
  })
}

export function useSaleUnits(unitId?: number) {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()

  return useQuery({
    queryKey: ['products', 'sale-units', unitId],
    queryFn: async () => {
      if (!unitId) return {}
      const response = await get<Record<string, string>>(`/products/sale-unit/${unitId}`)
      if (response.data) {
        return response.data
      }
      return {}
    },
    enabled: !!unitId && isAuthenticated && !isSessionLoading,
  })
}