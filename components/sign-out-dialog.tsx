"use client"

import { useState } from 'react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAuth } from '@/lib/hooks/use-auth'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allDevices?: boolean
}

export function SignOutDialog({ 
  open, 
  onOpenChange,
  allDevices = false 
}: SignOutDialogProps) {
  const { signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut(allDevices)
      onOpenChange(false)
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={allDevices ? 'Sign out from all devices' : 'Sign out'}
      desc={
        allDevices
          ? 'Are you sure you want to sign out from all devices? You will need to sign in again on all devices to access your account.'
          : 'Are you sure you want to sign out? You will need to sign in again to access your account.'
      }
      confirmText='Sign out'
      destructive
      handleConfirm={handleSignOut}
      isLoading={isLoading}
      className='sm:max-w-sm'
    />
  )
}

