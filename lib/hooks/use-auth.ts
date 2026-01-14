"use client"

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  useLogout, 
  useLogoutAll, 
  useUpdateProfile, 
  useChangePassword, 
  useRefreshToken,
  useResendVerificationEmail,
  type UpdateProfileData,
  type ChangePasswordData,
  type RefreshTokenData
} from '@/features/auth/api/use-auth'
import { toast } from 'sonner'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const logoutMutation = useLogout()
  const logoutAllMutation = useLogoutAll()
  const updateProfileMutation = useUpdateProfile()
  const changePasswordMutation = useChangePassword()
  const refreshTokenMutation = useRefreshToken()
  const resendVerificationEmailMutation = useResendVerificationEmail()

  const user = session?.user as any
  const token = (session as any)?.accessToken as string | undefined

  const signOut = async (allDevices = false) => {
    try {
      // Call API logout before signing out
      if (token) {
        if (allDevices) {
          await logoutAllMutation.mutateAsync()
        } else {
          await logoutMutation.mutateAsync()
        }
      }
    } catch (error) {
      // Ignore API errors - still sign out locally
      console.error('Logout API error:', error)
    } finally {
      // Always sign out locally
      await nextAuthSignOut({ redirect: false })
      router.push('/sign-in')
      router.refresh()
    }
  }

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const updatedUser = await updateProfileMutation.mutateAsync(data)
      // Update NextAuth session with new user data
      await update({ ...updatedUser })
      toast.success('Profile updated successfully')
      return updatedUser
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
      throw error
    }
  }

  const changePassword = async (data: ChangePasswordData) => {
    try {
      await changePasswordMutation.mutateAsync(data)
      toast.success('Password changed successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
      throw error
    }
  }

  const refreshToken = async (revokeOldToken = false) => {
    try {
      const result = await refreshTokenMutation.mutateAsync({ revoke_old_token: revokeOldToken })
      // Update session with new token and user data
      await update({ 
        ...result.user, 
        accessToken: result.token 
      })
      return result
    } catch (error: any) {
      toast.error(error.message || 'Failed to refresh token')
      throw error
    }
  }

  const resendVerificationEmail = async () => {
    try {
      await resendVerificationEmailMutation.mutateAsync()
      toast.success('Verification email sent successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email')
      throw error
    }
  }

  return {
    user,
    session,
    token,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signOut,
    updateProfile,
    changePassword,
    refreshToken,
    resendVerificationEmail,
  }
}

