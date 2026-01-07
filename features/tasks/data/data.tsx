import {
  CircleIcon,
  CheckmarkCircle01Icon,
  HelpCircleIcon,
  Clock01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  AlertCircleIcon,
  ArrowDown01Icon,
  CancelCircleHalfDotIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from "@hugeicons/react"

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: 'Feature',
  },
  {
    value: 'documentation',
    label: 'Documentation',
  },
]

export const statuses = [
  {
    label: 'Backlog',
    value: 'backlog' as const,
    icon: HelpCircleIcon,
  },
  {
    label: 'Todo',
    value: 'todo' as const,
    icon: CircleIcon,
  },
  {
    label: 'In Progress',
    value: 'in progress' as const,
    icon: Clock01Icon,
  },
  {
    label: 'Done',
    value: 'done' as const,
    icon: CheckmarkCircle01Icon,
  },
  {
    label: 'Canceled',
    value: 'canceled' as const,
    icon: CancelCircleHalfDotIcon,
  },
]

export const priorities = [
  {
    label: 'Low',
    value: 'low' as const,
    icon: ArrowDown01Icon,
  },
  {
    label: 'Medium',
    value: 'medium' as const,
    icon: ArrowRight01Icon,
  },
  {
    label: 'High',
    value: 'high' as const,
    icon: ArrowUp01Icon,
  },
  {
    label: 'Critical',
    value: 'critical' as const,
    icon: AlertCircleIcon,
  },
]

