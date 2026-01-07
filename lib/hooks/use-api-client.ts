"use client"

import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api-client'

/**
 * Hook to get an API client instance with authentication token from NextAuth session
 * Automatically includes the token from the session in all requests
 */
export function useApiClient() {
  const { data: session, status } = useSession()
  const token = (session as any)?.accessToken as string | undefined
  const isAuthenticated = status === 'authenticated' && !!token

  return {
    apiClient,
    token,
    isAuthenticated,
    isLoading: status === 'loading',
    // Helper methods that automatically include the token
    get: <T = unknown>(
      endpoint: string,
      params?: Record<string, string | number | boolean | null | undefined>,
      config?: Parameters<typeof apiClient.get>[2]
    ) => {
      if (!token) {
        throw new Error('Authentication token is not available')
      }
      return apiClient.get<T>(endpoint, params, { ...config, token })
    },
    
    post: <T = unknown>(
      endpoint: string,
      body?: unknown,
      config?: Parameters<typeof apiClient.post>[2]
    ) => {
      if (!token) {
        throw new Error('Authentication token is not available')
      }
      return apiClient.post<T>(endpoint, body, { ...config, token })
    },
    
    put: <T = unknown>(
      endpoint: string,
      body?: unknown,
      config?: Parameters<typeof apiClient.put>[2]
    ) => {
      if (!token) {
        throw new Error('Authentication token is not available')
      }
      return apiClient.put<T>(endpoint, body, { ...config, token })
    },
    
    patch: <T = unknown>(
      endpoint: string,
      body?: unknown,
      config?: Parameters<typeof apiClient.patch>[2]
    ) => {
      if (!token) {
        throw new Error('Authentication token is not available')
      }
      return apiClient.patch<T>(endpoint, body, { ...config, token })
    },
    
    delete: <T = unknown>(
      endpoint: string,
      config?: Parameters<typeof apiClient.delete>[1]
    ) => {
      if (!token) {
        throw new Error('Authentication token is not available')
      }
      return apiClient.delete<T>(endpoint, { ...config, token })
    },
    
    postFormData: <T = unknown>(
      endpoint: string,
      formData: FormData,
      config?: Parameters<typeof apiClient.postFormData>[2]
    ) => {
      if (!token) {
        throw new Error('Authentication token is not available')
      }
      return apiClient.postFormData<T>(endpoint, formData, { ...config, token })
    },
  }
}
