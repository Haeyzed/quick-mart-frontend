"use client"

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api/auth'
import { toast } from 'sonner'

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const user = session?.user as any
  const token = (session as any)?.accessToken as string | undefined

  const signOut = async (allDevices = false) => {
    try {
      // Call API logout before signing out
      if (token) {
        if (allDevices) {
          await authApi.logoutAll(token)
        } else {
          await authApi.logout(token)
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

  const updateProfile = async (data: Parameters<typeof authApi.updateProfile>[0]) => {
    try {
      const updatedUser = await authApi.updateProfile(data, token)
      // Update NextAuth session with new user data
      await update({ ...updatedUser })
      toast.success('Profile updated successfully')
      return updatedUser
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
      throw error
    }
  }

  const changePassword = async (data: Parameters<typeof authApi.changePassword>[0]) => {
    try {
      await authApi.changePassword(data, token)
      toast.success('Password changed successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
      throw error
    }
  }

  const refreshToken = async (revokeOldToken = false) => {
    try {
      const result = await authApi.refreshToken({ revoke_old_token: revokeOldToken }, token)
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
      await authApi.resendVerificationEmail(token)
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

