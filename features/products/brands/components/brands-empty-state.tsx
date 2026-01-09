"use client"

import { EmptyState } from '@/components/empty-state'
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Download01Icon } from "@hugeicons/core-free-icons"
import { useBrands } from './brands-provider'

export function BrandsEmptyState() {
  const { setOpen } = useBrands()

  return (
    <EmptyState
      title="No brands yet"
      description="You haven't created any brands yet. Get started by creating your first brand."
      primaryAction={{
        label: "Add Brand",
        onClick: () => setOpen('add'),
        icon: <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />,
      }}
      secondaryAction={{
        label: "Import Brands",
        onClick: () => setOpen('import'),
        icon: <HugeiconsIcon icon={Download01Icon} className="size-4 mr-2" />,
      }}
      learnMoreLink={{
        href: "#",
        label: "Learn more",
      }}
    />
  )
}

