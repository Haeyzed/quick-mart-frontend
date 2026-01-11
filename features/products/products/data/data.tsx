import {
  CheckmarkCircle02Icon,
  MultiplicationSignIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export const activeStatuses = [
  {
    value: 'active',
    label: 'Active',
    icon: CheckmarkCircle02Icon,
  },
  {
    value: 'inactive',
    label: 'Inactive',
    icon: MultiplicationSignIcon,
  },
] as const

export const productTypes = [
  { value: 'standard', label: 'Standard' },
  { value: 'combo', label: 'Combo' },
  { value: 'digital', label: 'Digital' },
  { value: 'service', label: 'Service' },
] as const

export const stockFilters = [
  { value: 'all', label: 'All' },
  { value: 'with', label: 'With Stock' },
  { value: 'without', label: 'Without Stock' },
] as const

export const activeStatusMap = new Map([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

