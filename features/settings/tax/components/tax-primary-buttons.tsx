"use client"

import { Download01Icon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { useTaxes } from './tax-provider'
import { useTaxes as useTaxesQuery } from '../api/use-taxes'
import { useMemo } from 'react'
import { PermissionGuard } from '@/lib/hooks/use-permissions'

export function TaxesPrimaryButtons() {
  const { setOpen } = useTaxes()
  const { data } = useTaxesQuery({ page: 1, per_page: 10 })
  const hasData = useMemo(() => {
    return data?.pagination?.total && data.pagination.total > 0
  }, [data?.pagination?.total])

  // Hide buttons when there's no data (empty state will show them)
  if (!hasData) return null

  return (
    <div className='flex gap-2'>
      <PermissionGuard permission={['tax', 'taxes-import']} fallback={null}>
        <Button
          variant='outline'
          className='space-x-1'
          onClick={() => setOpen('import')}
        >
          <span>Import</span> <HugeiconsIcon icon={Download01Icon} size={18} />
        </Button>
      </PermissionGuard>
      <PermissionGuard permission={['tax', 'taxes-add']} fallback={null}>
        <Button className='space-x-1' onClick={() => setOpen('add')}>
          <span>Add Tax</span> <HugeiconsIcon icon={PlusSignIcon} size={18} />
        </Button>
      </PermissionGuard>
    </div>
  )
}

