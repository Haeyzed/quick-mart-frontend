"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const id = searchParams.get('id')
  const hash = searchParams.get('hash')
  const signature = searchParams.get('signature')
  const expires = searchParams.get('expires')

  useEffect(() => {
    // Auto-verify when component mounts if all params are present
    if (id && hash && signature && expires) {
      verifyEmail()
    } else if (id && hash) {
      // Try without signature (for backward compatibility)
      verifyEmail()
    } else {
      setError('Invalid verification link. Please check your email for a valid verification link.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const verifyEmail = async () => {
    if (!id || !hash) {
      setError('Missing verification parameters')
      return
    }

    setIsVerifying(true)
    setError(null)

    try {
      // Construct the API URL with signed route parameters
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/verify-email/${id}/${hash}`
      const queryParams = new URLSearchParams()
      if (signature) queryParams.append('signature', signature)
      if (expires) queryParams.append('expires', expires)
      
      const fullUrl = queryParams.toString() 
        ? `${apiUrl}?${queryParams.toString()}`
        : apiUrl

      // Call the API directly since we need to pass the signed route
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.status) {
        setIsVerified(true)
        toast.success('Email verified successfully!')
        setTimeout(() => {
          router.push('/sign-in')
        }, 2000)
      } else {
        throw new Error(data.message || 'Failed to verify email')
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to verify email. The link may have expired.'
      setError(errorMessage)
      // Show error toast
      if (errorMessage) {
        toast.error(errorMessage)
      }
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerified) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <svg
            className="size-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Email Verified!</h2>
        <p className="text-muted-foreground">
          Your email has been successfully verified. Redirecting to sign in...
        </p>
        <Button asChild>
          <Link href="/sign-in">Go to Sign In</Link>
        </Button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <svg
            className="size-8 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">Verification Failed</h2>
        <p className="text-muted-foreground">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" asChild>
            <Link href="/sign-in">Go to Sign In</Link>
          </Button>
          <Button onClick={verifyEmail} disabled={isVerifying}>
            {isVerifying ? (
              <>
                <Spinner className="size-4 mr-2" />
                Verifying...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-center">
      <Spinner className="mx-auto size-8" />
      <p className="text-muted-foreground">Verifying your email address...</p>
    </div>
  )
}
