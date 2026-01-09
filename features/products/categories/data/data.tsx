import {
  CheckmarkCircle02Icon,
  MultiplicationSignIcon,
  StarIcon,
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

export const featuredStatuses = [
  {
    value: 'featured',
    label: 'Featured',
    icon: StarIcon,
  },
  {
    value: 'not_featured',
    label: 'Not Featured',
    icon: CheckmarkCircle02Icon,
  },
] as const

export const syncStatuses = [
  {
    value: 'enabled',
    label: 'Sync Enabled',
    icon: CheckmarkCircle02Icon,
  },
  {
    value: 'disabled',
    label: 'Sync Disabled',
    icon: MultiplicationSignIcon,
  },
] as const

export const activeStatusMap = new Map([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
])

export const featuredStatusMap = new Map([
  ['featured', 'bg-amber-100/30 text-amber-900 dark:text-amber-200 border-amber-200'],
  ['not_featured', 'bg-neutral-300/40 border-neutral-300'],
])

export const syncStatusMap = new Map([
  ['enabled', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['disabled', 'bg-neutral-300/40 border-neutral-300'],
])

