"use client"

import { EmptyState } from '@/components/empty-state'
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Download01Icon } from "@hugeicons/core-free-icons"
import { useRouter } from 'next/navigation'

export function ProductsEmptyState() {
  const router = useRouter()

  return (
    <EmptyState
      title="No products yet"
      description="You haven't created any products yet. Get started by creating your first product."
      primaryAction={{
        label: "Add Product",
        onClick: () => router.push('/products/create'),
        icon: <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />,
      }}
      secondaryAction={{
        label: "Import Products",
        onClick: () => router.push('/products/import'),
        icon: <HugeiconsIcon icon={Download01Icon} className="size-4 mr-2" />,
      }}
      learnMoreLink={{
        href: "#",
        label: "Learn more",
      }}
    />
  )
}

