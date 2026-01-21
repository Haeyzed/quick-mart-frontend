"use client"

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Spinner } from '@/components/ui/spinner'
import { Login01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toast } from 'sonner'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { cn } from '@/lib/utils'
import { handleApiError } from '@/lib/handle-api-error'
import { useLogin } from '@/features/auth/api/use-auth'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import Link from 'next/link'

const formSchema = z.object({
  identifier: z.string().min(1, 'Please enter your email or username'),
  password: z.string().min(1, 'Please enter your password'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = redirectTo || searchParams.get('redirect') || '/'
  const loginMutation = useLogin()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      // First, call the API to check for errors (email not verified, account deactivated, etc.)
      try {
        await loginMutation.mutateAsync({
          identifier: data.identifier,
          password: data.password,
        })
        // If API call succeeds, proceed with NextAuth
      } catch (apiError: any) {
        // API error occurred - show error and stop
        handleApiError(apiError, form.setError)
        return
      }

      // API call succeeded, now proceed with NextAuth authentication
      const result = await signIn('credentials', {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        // Handle next-auth errors (shouldn't happen if API succeeded, but just in case)
        const errorMessage = result.error || 'Invalid credentials'
        toast.error(errorMessage)
        if (result.error.includes('email') || result.error.includes('password')) {
          form.setError('identifier', { type: 'server', message: errorMessage })
        }
        return
      }

      if (result?.ok) {
        toast.success('Welcome back!')
        router.push(redirect)
        router.refresh()
      }
    } catch (error: any) {
      handleApiError(error, form.setError)
    }
  }

  const isLoading = loginMutation.isPending

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn('grid gap-3', className)}
      {...props}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name='identifier'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='signin-identifier'>Email or Username</FieldLabel>
              <Input
                id='signin-identifier'
                placeholder='name@example.com or username'
                {...field}
                data-invalid={!!fieldState.error}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='password'
          render={({ field, fieldState }) => (
            <Field className='relative'>
            <div className="flex items-center">
              <FieldLabel htmlFor='signin-password'>Password</FieldLabel>
                <Link
                  href='/forgot-password'
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id='signin-password'
                placeholder='********'
                {...field}
                data-invalid={!!fieldState.error}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
      </FieldGroup>
      <Button className='mt-2' disabled={isLoading}>
        {isLoading ? (
          <Spinner className='size-4' />
        ) : (
          <HugeiconsIcon icon={Login01Icon} className='size-4' />
        )}
        Sign in
      </Button>

      <div className='relative my-2'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            Or continue with
          </span>
        </div>
      </div>

      <div className='grid grid-cols-3 gap-2'>
        <Button 
          variant='outline' 
          type='button' 
          disabled={isLoading}
          onClick={async () => {
            try {
              const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
              const response = await fetch(`${baseUrl}/api/auth/google`, {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
              })
              const data = await response.json()
              if (data.url) {
                window.location.href = data.url
              }
            } catch (error) {
              console.error('Failed to get Google OAuth URL:', error)
            }
          }}
        >
          <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4'/>
            <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853'/>
            <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05'/>
            <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335'/>
          </svg>
          Google
        </Button>
        <Button 
          variant='outline' 
          type='button' 
          disabled={isLoading}
          onClick={async () => {
            try {
              const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
              const response = await fetch(`${baseUrl}/api/auth/facebook`, {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
              })
              const data = await response.json()
              if (data.url) {
                window.location.href = data.url
              }
            } catch (error) {
              console.error('Failed to get Facebook OAuth URL:', error)
            }
          }}
        >
          <IconFacebook className='h-4 w-4' /> Facebook
        </Button>
        <Button 
          variant='outline' 
          type='button' 
          disabled={isLoading}
          onClick={async () => {
            try {
              const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
              const response = await fetch(`${baseUrl}/api/auth/github`, {
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                },
              })
              const data = await response.json()
              if (data.url) {
                window.location.href = data.url
              }
            } catch (error) {
              console.error('Failed to get GitHub OAuth URL:', error)
            }
          }}
        >
          <IconGithub className='h-4 w-4' /> GitHub
        </Button>
      </div>
    </form>
  )
}

