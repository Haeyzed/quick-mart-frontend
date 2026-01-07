"use client"

import { useState } from 'react'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/auth'
import { cn } from '@/lib/utils'
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
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
    email: z.string().email('Please enter a valid email address.').optional().nullable(),
    password: z
      .string()
      .min(1, 'Please enter your password')
      .min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role_id: z.number().min(1, 'Role is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role_id: 1, // Default role
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await authApi.register({
        name: data.name,
        email: data.email || null,
        password: data.password,
        password_confirmation: data.confirmPassword,
        role_id: data.role_id,
      })
      toast.success('Registration successful! Please verify your email.')
      router.push('/sign-in')
    } catch (error: any) {
      toast.error(error.message || 'Registration failed')
    } finally {
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
              <FieldLabel htmlFor='signup-name'>Name *</FieldLabel>
              <Input
                id='signup-name'
                placeholder='John Doe'
                {...field}
                data-invalid={!!fieldState.error}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name='email'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='signup-email'>Email (optional)</FieldLabel>
              <Input
                id='signup-email'
                placeholder='name@example.com'
                {...field}
                value={field.value || ''}
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
            <Field>
              <FieldLabel htmlFor='signup-password'>Password</FieldLabel>
              <PasswordInput
                id='signup-password'
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
          name='confirmPassword'
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='signup-confirm-password'>Confirm Password</FieldLabel>
              <PasswordInput
                id='signup-confirm-password'
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
        Create Account
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
        <Button
          variant='outline'
          className='w-full'
          type='button'
          disabled={isLoading}
        >
          <IconGithub className='h-4 w-4' /> GitHub
        </Button>
        <Button
          variant='outline'
          className='w-full'
          type='button'
          disabled={isLoading}
        >
          <IconFacebook className='h-4 w-4' /> Facebook
        </Button>
      </div>
    </form>
  )
}

