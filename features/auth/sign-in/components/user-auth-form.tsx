"use client"

import { useState } from 'react'
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
  name: z.string().min(1, 'Please enter your email or username'),
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
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = redirectTo || searchParams.get('redirect') || '/'

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        name: data.name,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        // Handle next-auth errors
        const errorMessage = result.error || 'Invalid credentials'
        toast.error(errorMessage)
        // Try to set form error if it's a validation error
        if (result.error.includes('email') || result.error.includes('password')) {
          form.setError('name', { type: 'server', message: errorMessage })
        }
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        toast.success('Welcome back!')
        router.push(redirect)
        router.refresh()
      }
    } catch (error: any) {
      handleApiError(error, form.setError)
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn('grid gap-3', className)}
      {...props}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name='name'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='signin-name'>Email or Username</FieldLabel>
              <Input
                id='signin-name'
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

      <div className='grid grid-cols-2 gap-2'>
        <Button variant='outline' type='button' disabled={isLoading}>
          <IconGithub className='h-4 w-4' /> GitHub
        </Button>
        <Button variant='outline' type='button' disabled={isLoading}>
          <IconFacebook className='h-4 w-4' /> Facebook
        </Button>
      </div>
    </form>
  )
}

