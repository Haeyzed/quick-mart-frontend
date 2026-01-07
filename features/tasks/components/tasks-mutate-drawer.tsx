"use client"

import { z } from 'zod'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Task } from '../data/schema'

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  status: z.string().min(1, 'Please select a status.'),
  label: z.string().min(1, 'Please select a label.'),
  priority: z.string().min(1, 'Please choose a priority.'),
})
type TaskForm = z.infer<typeof formSchema>

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const isUpdate = !!currentRow

  const form = useForm<TaskForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? {
      title: '',
      status: '',
      label: '',
      priority: '',
    },
  })

  const onSubmit = (data: TaskForm) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Task</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the task by providing necessary info.'
              : 'Add a new task by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <form
          id='tasks-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex-1 space-y-6 overflow-y-auto px-4'
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name='title'
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='task-title'>Title</FieldLabel>
                  <Input
                    id='task-title'
                    {...field}
                    placeholder='Enter a title'
                    data-invalid={!!fieldState.error}
                  />
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name='status'
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='task-status'>Status</FieldLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select status'
                    items={[
                      { label: 'In Progress', value: 'in progress' },
                      { label: 'Backlog', value: 'backlog' },
                      { label: 'Todo', value: 'todo' },
                      { label: 'Canceled', value: 'canceled' },
                      { label: 'Done', value: 'done' },
                    ]}
                  />
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name='label'
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Label</FieldLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className='flex flex-col space-y-1'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='documentation' id='label-documentation' />
                      <label htmlFor='label-documentation' className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Documentation
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='feature' id='label-feature' />
                      <label htmlFor='label-feature' className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Feature
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='bug' id='label-bug' />
                      <label htmlFor='label-bug' className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Bug
                      </label>
                    </div>
                  </RadioGroup>
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name='priority'
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Priority</FieldLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className='flex flex-col space-y-1'
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='high' id='priority-high' />
                      <label htmlFor='priority-high' className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        High
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='medium' id='priority-medium' />
                      <label htmlFor='priority-medium' className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Medium
                      </label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='low' id='priority-low' />
                      <label htmlFor='priority-low' className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                        Low
                      </label>
                    </div>
                  </RadioGroup>
                  <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='tasks-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

