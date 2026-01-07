"use client"

import { Download01Icon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { useUnits } from './units-provider'
import { useUnits as useUnitsQuery } from '../api/use-units'
import { useMemo } from 'react'

export function UnitsPrimaryButtons() {
  const { setOpen } = useUnits()
  const { data } = useUnitsQuery({ page: 1, per_page: 10 })
  const hasData = useMemo(() => {
    return data?.pagination?.total && data.pagination.total > 0
  }, [data?.pagination?.total])

  // Hide buttons when there's no data (empty state will show them)
  if (!hasData) return null

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import</span> <HugeiconsIcon icon={Download01Icon} size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Unit</span> <HugeiconsIcon icon={PlusSignIcon} size={18} />
      </Button>
    </div>
  )
}

