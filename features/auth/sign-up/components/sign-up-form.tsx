"use client"

import { useState } from 'react'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { toast } from 'sonner'
import { useRegister } from '@/features/auth/api/use-auth'
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
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  type StepperProps,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'

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

const steps = [
  {
    value: 'personal',
    title: 'Personal Information',
    description: 'Enter your basic details',
    fields: ['name', 'email'] as const,
  },
  {
    value: 'password',
    title: 'Password',
    description: 'Create a secure password',
    fields: ['password', 'confirmPassword'] as const,
  },
]

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [step, setStep] = useState('personal')
  const router = useRouter()
  const registerMutation = useRegister()

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

  const stepIndex = steps.findIndex((s) => s.value === step)

  const onValidate: NonNullable<StepperProps['onValidate']> = async (_value, direction) => {
    if (direction === 'prev') return true

    const stepData = steps.find((s) => s.value === step)
    if (!stepData) return true

    const isValid = await form.trigger(stepData.fields)

    if (!isValid) {
      toast.info('Please complete all required fields to continue')
    }

    return isValid
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email || null,
        password: data.password,
        password_confirmation: data.confirmPassword,
        role_id: data.role_id,
      })
      toast.success('Registration successful! Please verify your email.')
      router.push('/sign-in')
    } catch (error: any) {
      handleApiError(error, form.setError)
    }
  }

  const isLoading = registerMutation.isPending

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn('grid gap-3', className)}
      {...props}
    >
      <Stepper value={step} onValueChange={setStep} onValidate={onValidate}>
        <StepperList>
          {steps.map((stepItem) => (
            <StepperItem key={stepItem.value} value={stepItem.value}>
              <StepperTrigger>
                <StepperIndicator />
                <div className="flex flex-col gap-px">
                  <StepperTitle>{stepItem.title}</StepperTitle>
                  <StepperDescription>{stepItem.description}</StepperDescription>
                </div>
              </StepperTrigger>
              <StepperSeparator className="mx-4" />
            </StepperItem>
          ))}
        </StepperList>
        
        <StepperContent value="personal">
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
          </FieldGroup>
        </StepperContent>
        
        <StepperContent value="password">
          <FieldGroup>
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
        </StepperContent>
        
        <div className="mt-4 flex justify-between">
          <StepperPrev asChild>
            <Button variant="outline" type="button">Previous</Button>
          </StepperPrev>
          <div className="text-muted-foreground text-sm">
            Step {stepIndex + 1} of {steps.length}
          </div>
          {stepIndex === steps.length - 1 ? (
            <Button type="submit" disabled={isLoading}>
              Create Account
            </Button>
          ) : (
            <StepperNext asChild>
              <Button type="button">Next</Button>
            </StepperNext>
          )}
        </div>
      </Stepper>

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

