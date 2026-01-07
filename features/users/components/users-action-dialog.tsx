"use client"

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { roles } from '../data/data'
import { type User } from '../data/schema'

const formSchema = z
  .object({
    firstName: z.string().min(1, 'First Name is required.'),
    lastName: z.string().min(1, 'Last Name is required.'),
    username: z.string().min(1, 'Username is required.'),
    phoneNumber: z.string().min(1, 'Phone number is required.'),
    email: z.string().email({
      message: 'Please enter a valid email address.',
    }),
    password: z.string().transform((pwd) => pwd.trim()),
    role: z.string().min(1, 'Role is required.'),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
    isEdit: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isEdit && !data.password) return true
      return data.password.length > 0
    },
    {
      message: 'Password is required.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return password.length >= 8
    },
    {
      message: 'Password must be at least 8 characters long.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /[a-z]/.test(password)
    },
    {
      message: 'Password must contain at least one lowercase letter.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password }) => {
      if (isEdit && !password) return true
      return /\d/.test(password)
    },
    {
      message: 'Password must contain at least one number.',
      path: ['password'],
    }
  )
  .refine(
    ({ isEdit, password, confirmPassword }) => {
      if (isEdit && !password) return true
      return password === confirmPassword
    },
    {
      message: "Passwords don't match.",
      path: ['confirmPassword'],
    }
  )
type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          password: '',
          confirmPassword: '',
          isEdit,
        }
      : {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          role: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          isEdit,
        },
  })

  const onSubmit = (values: UserForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <form
            id='user-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 px-0.5'
          >
            <FieldGroup>
              <Controller
                control={form.control}
                name='firstName'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='user-firstname' className='col-span-2'>
                      First Name
                    </FieldLabel>
                    <div className='flex-1'>
                      <Input
                        id='user-firstname'
                        placeholder='John'
                        autoComplete='off'
                        {...field}
                        data-invalid={!!fieldState.error}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </div>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='lastName'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='user-lastname' className='col-span-2'>
                      Last Name
                    </FieldLabel>
                    <div className='flex-1'>
                      <Input
                        id='user-lastname'
                        placeholder='Doe'
                        autoComplete='off'
                        {...field}
                        data-invalid={!!fieldState.error}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </div>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='username'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='user-username' className='col-span-2'>
                      Username
                    </FieldLabel>
                    <div className='flex-1'>
                      <Input
                        id='user-username'
                        placeholder='john_doe'
                        {...field}
                        data-invalid={!!fieldState.error}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </div>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='email'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='user-email' className='col-span-2'>
                      Email
                    </FieldLabel>
                    <div className='flex-1'>
                      <Input
                        id='user-email'
                        placeholder='john.doe@gmail.com'
                        {...field}
                        data-invalid={!!fieldState.error}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </div>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='phoneNumber'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='user-phone' className='col-span-2'>
                      Phone Number
                    </FieldLabel>
                    <div className='flex-1'>
                      <Input
                        id='user-phone'
                        placeholder='+123456789'
                        {...field}
                        data-invalid={!!fieldState.error}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </div>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='role'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='user-role' className='col-span-2'>
                      Role
                    </FieldLabel>
                    <div className='flex-1'>
                      <SelectDropdown
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                        placeholder='Select a role'
                        items={roles.map(({ label, value }) => ({
                          label,
                          value,
                        }))}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </div>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='password'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='user-password' className='col-span-2'>
                      Password
                    </FieldLabel>
                    <div className='flex-1'>
                      <PasswordInput
                        id='user-password'
                        placeholder='e.g., S3cur3P@ssw0rd'
                        {...field}
                        data-invalid={!!fieldState.error}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </div>
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name='confirmPassword'
                render={({ field, fieldState }) => (
                  <Field orientation='horizontal'>
                    <FieldLabel htmlFor='user-confirm-password' className='col-span-2'>
                      Confirm Password
                    </FieldLabel>
                    <div className='flex-1'>
                      <PasswordInput
                        id='user-confirm-password'
                        disabled={!isPasswordTouched}
                        placeholder='e.g., S3cur3P@ssw0rd'
                        {...field}
                        data-invalid={!!fieldState.error}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </div>
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

