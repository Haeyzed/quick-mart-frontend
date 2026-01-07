"use client"

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description: string
  primaryAction: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  learnMoreLink?: {
    href: string
    label: string
  }
}

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  learnMoreLink,
}: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={primaryAction.onClick}>
            {primaryAction.icon}
            <span>{primaryAction.label}</span>
          </Button>
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </Button>
          )}
        </div>
        {learnMoreLink && (
          <Button variant="link" asChild className="text-muted-foreground">
            <a href={learnMoreLink.href}>
              {learnMoreLink.label}{" "}
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
            </a>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  )
}

