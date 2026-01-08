"use client"

import { EmptyState } from '@/components/empty-state'
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Download01Icon } from "@hugeicons/core-free-icons"
import { useCategories } from './categories-provider'

export function CategoriesEmptyState() {
  const { setOpen } = useCategories()

  return (
    <EmptyState
      title="No categories yet"
      description="You haven't created any categories yet. Get started by creating your first category."
      primaryAction={{
        label: "Add Category",
        onClick: () => setOpen('add'),
        icon: <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />,
      }}
      secondaryAction={{
        label: "Import Categories",
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

