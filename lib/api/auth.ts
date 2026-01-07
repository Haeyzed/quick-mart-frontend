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
  name: string // email or username
  password: string
}

export type RegisterData = {
  name: string
  email?: string | null
  phone_number?: string | null
  company_name?: string | null
  password: string
  password_confirmation: string
  role_id: number
  biller_id?: number | null
  warehouse_id?: number | null
  customer_group_id?: number | null
  customer_name?: string | null
}

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

// Auth API functions - these work with NextAuth session tokens automatically
export const authApi = {
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', data)

    if (response.status && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Registration failed')
  },

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await apiClient.post('/auth/forgot-password', {
      email: data.email,
    })

    if (!response.status) {
      throw new Error(response.message || 'Failed to send password reset email')
    }
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
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

  async getUser(token?: string | null): Promise<User> {
    const response = await apiClient.get<User>('/auth/user', undefined, { token })

    if (response.status && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Failed to get user')
  },

  async updateProfile(data: UpdateProfileData, token?: string | null): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile', data, { token })

    if (response.status && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Failed to update profile')
  },

  async changePassword(data: ChangePasswordData, token?: string | null): Promise<void> {
    const response = await apiClient.post('/auth/change-password', {
      current_password: data.current_password,
      password: data.password,
      password_confirmation: data.password_confirmation,
    }, { token })

    if (!response.status) {
      throw new Error(response.message || 'Failed to change password')
    }
  },

  async refreshToken(data?: RefreshTokenData, token?: string | null): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh-token', {
      revoke_old_token: data?.revoke_old_token || false,
    }, { token })

    if (response.status && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Failed to refresh token')
  },

  async logout(token?: string | null): Promise<void> {
    const response = await apiClient.post('/auth/logout', undefined, { token })

    if (!response.status) {
      throw new Error(response.message || 'Failed to logout')
    }
  },

  async logoutAll(token?: string | null): Promise<void> {
    const response = await apiClient.post('/auth/logout-all', undefined, { token })

    if (!response.status) {
      throw new Error(response.message || 'Failed to logout from all devices')
    }
  },

  async resendVerificationEmail(token?: string | null): Promise<void> {
    const response = await apiClient.post('/auth/resend-verification-email', undefined, { token })

    if (!response.status) {
      throw new Error(response.message || 'Failed to resend verification email')
    }
  },

  async verifyEmail(id: number, hash: string): Promise<User> {
    const response = await apiClient.get<User>(`/auth/verify-email/${id}/${hash}`)

    if (response.status && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Failed to verify email')
  },
}
