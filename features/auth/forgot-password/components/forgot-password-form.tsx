"use client"

import { useState } from 'react'
import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
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

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
})

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      await authApi.forgotPassword({ email: data.email })
      toast.success(`Email sent to ${data.email}`)
      form.reset()
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
              <FieldLabel htmlFor='forgot-email'>Email</FieldLabel>
              <Input
                id='forgot-email'
                placeholder='name@example.com'
                {...field}
                data-invalid={!!fieldState.error}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
      </FieldGroup>
      <Button className='mt-2' disabled={isLoading}>
        Continue
        {isLoading ? (
          <Spinner className='size-4' />
        ) : (
          <HugeiconsIcon icon={ArrowRight01Icon} className='size-4' />
        )}
      </Button>
    </form>
  )
}

