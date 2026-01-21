"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Spinner } from '@/components/ui/spinner'

export default function GithubCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the query parameters from the OAuth callback
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code) {
          throw new Error('No authorization code received')
        }

        // Call backend callback endpoint with the code
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        
        // Build query string with all params
        const params = new URLSearchParams()
        if (code) params.append('code', code)
        if (state) params.append('state', state)
        
        const response = await fetch(`${baseUrl}/api/auth/github/callback?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Authentication failed')
        }

        // Save to NextAuth using credentials provider
        const result = await signIn('credentials', {
          identifier: data.user.email || data.user.username || String(data.user.id),
          password: '',
          token: data.access_token,
          redirect: false,
        })

        if (result?.error) {
          throw new Error(result.error)
        }

        if (result?.ok) {
          router.push('/')
          router.refresh()
        }
      } catch (err: any) {
        console.error('GitHub callback error:', err)
        setError(err.message || 'Failed to authenticate with GitHub')
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <Spinner className='size-8' />
          <p className='text-muted-foreground'>Completing GitHub sign in...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <p className='text-destructive'>{error}</p>
          <button
            onClick={() => router.push('/sign-in')}
            className='text-primary hover:underline'
          >
            Return to sign in
          </button>
        </div>
      </div>
    )
  }

  return null
}
