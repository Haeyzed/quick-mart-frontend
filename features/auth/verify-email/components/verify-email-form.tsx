"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import Link from 'next/link'
import { useVerifyEmail } from '@/features/auth/api/use-auth'
import { handleApiError } from '@/lib/handle-api-error'

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verifyEmailMutation = useVerifyEmail()

  const id = searchParams.get('id')
  const hash = searchParams.get('hash')
  const signature = searchParams.get('signature')
  const expires = searchParams.get('expires')

  useEffect(() => {
    // Auto-verify when component mounts if all params are present
    // Only verify once when component mounts
    if (id && hash && !isVerifying && !isVerified && !error) {
      verifyEmail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, hash])

  const verifyEmail = async () => {
    if (!id || !hash) {
      return
    }

    try {
      await verifyEmailMutation.mutateAsync({
        id: parseInt(id, 10),
        hash,
        signature: signature || undefined,
        expires: expires || undefined,
      })
      toast.success('Email verified successfully!')
      setTimeout(() => {
        router.push('/sign-in')
      }, 2000)
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to verify email. The link may have expired.'
      toast.error(errorMessage)
    }
  }

  const isVerifying = verifyEmailMutation.isPending
  const isVerified = verifyEmailMutation.isSuccess
  const error = verifyEmailMutation.isError ? (verifyEmailMutation.error as Error)?.message || 'Failed to verify email' : null

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
