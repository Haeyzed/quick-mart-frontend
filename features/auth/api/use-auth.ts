"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '@/lib/hooks/use-api-client'
import { apiClient, type ApiResponse } from '@/lib/api-client'

export type User = {
  id: number
  name: string
  email: string | null
  phone: string | null
  company_name: string | null
  role_id: number | null
  biller_id: number | null
  warehouse_id: number | null
  is_active: boolean
  is_deleted: boolean
  email_verified_at: string | null
  created_at: string | null
  updated_at: string | null
  biller?: unknown
  warehouse?: unknown
  roles?: unknown
}

export type LoginResponse = {
  user: User
  token: string
}

export type LoginCredentials = {
  identifier: string // email or username
  password: string
}

export type RegisterData = {
  name: string
  username?: string | null
  email?: string | null
  avatar?: File | null
  phone_number?: string | null
  company_name?: string | null
  password: string
  password_confirmation: string
  role_id: number
  biller_id?: number | null
  warehouse_id?: number | null
  customer_group_id?: number | null
  customer_name?: string | null
} | FormData

export type ForgotPasswordData = {
  email: string
}

export type ResetPasswordData = {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export type UpdateProfileData = {
  name?: string
  email?: string | null
  phone?: string | null
  company_name?: string | null
}

export type ChangePasswordData = {
  current_password: string
  password: string
  password_confirmation: string
}

export type RefreshTokenData = {
  revoke_old_token?: boolean
}

export type VerifyEmailParams = {
  id: number
  hash: string
  signature?: string
  expires?: string
}

// Login mutation - doesn't require authentication
export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginCredentials): Promise<LoginResponse> => {
      // Use apiClient directly for login since we don't have a token yet
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        identifier: data.identifier,
        password: data.password,
      })

      if (response.status && response.data) {
        return response.data
      }

      const error = new Error(response.message || 'Login failed')
      ;(error as any).status = 400
      ;(error as any).errors = (response as any).errors
      throw error
    },
  })
}

// Register mutation - doesn't require authentication
export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterData): Promise<User> => {
      // Use apiClient directly for register since we don't have a token yet
      // Handle FormData for file uploads
      const isFormData = data instanceof FormData
      const response = isFormData
        ? await apiClient.postFormData<User>('/auth/register', data)
        : await apiClient.post<User>('/auth/register', data)

      if (response.status && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Registration failed')
    },
  })
}

// Forgot password mutation - doesn't require authentication
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordData): Promise<void> => {
      // Use apiClient directly for forgot password since we don't have a token yet
      const response = await apiClient.post('/auth/forgot-password', {
        email: data.email,
      })

      if (!response.status) {
        throw new Error(response.message || 'Failed to send password reset email')
      }
    },
  })
}

// Reset password mutation - doesn't require authentication
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordData): Promise<void> => {
      // Use apiClient directly for reset password since we don't have a token yet
      const response = await apiClient.post('/auth/reset-password', {
        email: data.email,
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })

      if (!response.status) {
        throw new Error(response.message || 'Failed to reset password')
      }
    },
  })
}

// Verify email mutation - doesn't require authentication
export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (params: VerifyEmailParams): Promise<User> => {
      // Construct the API URL with signed route parameters
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
      const apiUrl = `${cleanBaseUrl}/auth/verify-email/${params.id}/${params.hash}`
      
      const queryParams = new URLSearchParams()
      if (params.signature) queryParams.append('signature', params.signature)
      if (params.expires) queryParams.append('expires', params.expires)
      
      const fullUrl = queryParams.toString() 
        ? `${apiUrl}?${queryParams.toString()}`
        : apiUrl

      // Call the API directly with fetch to preserve signed route parameters
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      const data: ApiResponse<User> = await response.json()

      if (response.ok && data.status && data.data) {
        return data.data
      }

      const error = new Error(data.message || 'Failed to verify email')
      ;(error as any).status = response.status
      ;(error as any).errors = data.errors
      throw error
    },
  })
}

// Get current user query - requires authentication
export function useUser() {
  const { get, isAuthenticated, isLoading: isSessionLoading } = useApiClient()

  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await get<User>('/auth/user')
      if (response.data) {
        return response.data
      }
      throw new Error(response.message || 'Failed to get user')
    },
    enabled: isAuthenticated && !isSessionLoading,
  })
}

// Update profile mutation - requires authentication
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { put } = useApiClient()

  return useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<User> => {
      const response = await put<User>('/auth/profile', data)
      if (response.data) {
        return response.data
      }
      throw new Error(response.message || 'Failed to update profile')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    },
  })
}

// Change password mutation - requires authentication
export function useChangePassword() {
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (data: ChangePasswordData): Promise<void> => {
      const response = await post('/auth/change-password', {
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })

      if (!response.status) {
        throw new Error(response.message || 'Failed to change password')
      }
    },
  })
}

// Refresh token mutation - requires authentication
export function useRefreshToken() {
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (data?: RefreshTokenData): Promise<LoginResponse> => {
      const response = await post<LoginResponse>('/auth/refresh-token', {
        revoke_old_token: data?.revoke_old_token || false,
      })

      if (response.status && response.data) {
        return response.data
      }

      throw new Error(response.message || 'Failed to refresh token')
    },
  })
}

// Logout mutation - requires authentication
export function useLogout() {
  const queryClient = useQueryClient()
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await post('/auth/logout')

      if (!response.status) {
        throw new Error(response.message || 'Failed to logout')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

// Logout from all devices mutation - requires authentication
export function useLogoutAll() {
  const queryClient = useQueryClient()
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await post('/auth/logout-all')

      if (!response.status) {
        throw new Error(response.message || 'Failed to logout from all devices')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

// Resend verification email mutation - requires authentication
export function useResendVerificationEmail() {
  const { post } = useApiClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await post('/auth/resend-verification-email')

      if (!response.status) {
        throw new Error(response.message || 'Failed to resend verification email')
      }
    },
  })
}
