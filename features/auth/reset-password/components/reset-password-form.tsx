"use client"

import { useState } from 'react'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { authApi } from '@/lib/api/auth'
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

const formSchema = z
  .object({
    email: z.string().email('Please enter a valid email address.'),
    token: z.string().min(1, 'Token is required'),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(8, 'Password must be at least 8 characters long'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match.",
    path: ['password_confirmation'],
  })

export function ResetPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
      token: token,
      password: '',
      password_confirmation: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await authApi.resetPassword({
        email: data.email,
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      toast.success('Password reset successfully!')
      router.push('/sign-in')
    } catch (error: any) {
      handleApiError(error, form.setError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn('grid gap-2', className)}
      {...props}
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name='email'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='reset-email'>Email</FieldLabel>
              <Input
                id='reset-email'
                placeholder='name@example.com'
                {...field}
                data-invalid={!!fieldState.error}
                disabled={!!email}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='token'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='reset-token'>Reset Token</FieldLabel>
              <Input
                id='reset-token'
                placeholder='Enter reset token from email'
                {...field}
                data-invalid={!!fieldState.error}
                disabled={!!token}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='password'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='reset-password'>New Password</FieldLabel>
              <PasswordInput
                id='reset-password'
                placeholder='********'
                {...field}
                data-invalid={!!fieldState.error}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='password_confirmation'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='reset-password-confirm'>Confirm Password</FieldLabel>
              <PasswordInput
                id='reset-password-confirm'
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
        Reset Password
        {isLoading ? (
          <Spinner className='size-4' />
        ) : (
          <HugeiconsIcon icon={ArrowRight01Icon} className='size-4' />
        )}
      </Button>
    </form>
  )
}

