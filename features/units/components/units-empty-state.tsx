"use client"

import { EmptyState } from '@/components/empty-state'
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Download01Icon } from "@hugeicons/core-free-icons"
import { useUnits } from './units-provider'

export function UnitsEmptyState() {
  const { setOpen } = useUnits()

  return (
    <EmptyState
      title="No units yet"
      description="You haven't created any units yet. Get started by creating your first unit."
      primaryAction={{
        label: "Add Unit",
        onClick: () => setOpen('add'),
        icon: <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />,
      }}
      secondaryAction={{
        label: "Import Units",
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

