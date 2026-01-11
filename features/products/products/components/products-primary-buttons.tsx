"use client"

import { Download01Icon, PlusSignIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Button } from '@/components/ui/button'
import { useProducts as useProductsQuery } from '../api/use-products'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

export function ProductsPrimaryButtons() {
  const router = useRouter()
  const { data } = useProductsQuery({ page: 1, per_page: 10 })
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
        onClick={() => router.push('/products/import')}
      >
        <span>Import</span> <HugeiconsIcon icon={Download01Icon} size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => router.push('/products/create')}>
        <span>Add Product</span> <HugeiconsIcon icon={PlusSignIcon} size={18} />
      </Button>
    </div>
  )
}

