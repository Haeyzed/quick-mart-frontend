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

export const activeStatusMap = new Map([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

