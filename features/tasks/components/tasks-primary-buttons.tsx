"use client"

import { Download01Icon, DownloadIcon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from '@/components/ui/button'
import { useTasks } from './tasks-provider'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import</span> <HugeiconsIcon icon={Download01Icon} size={18} />
    
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create</span> <HugeiconsIcon icon={PlusSignIcon} size={18} />
      </Button>
    </div>
  )
}

