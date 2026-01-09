"use client"

import { EmptyState } from '@/components/empty-state'
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Download01Icon } from "@hugeicons/core-free-icons"
import { useTaxes } from './tax-provider'

export function TaxesEmptyState() {
  const { setOpen } = useTaxes()

  return (
    <EmptyState
      title="No taxes yet"
      description="You haven't created any taxes yet. Get started by creating your first tax."
      primaryAction={{
        label: "Add Tax",
        onClick: () => setOpen('add'),
        icon: <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />,
      }}
      secondaryAction={{
        label: "Import Taxes",
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

