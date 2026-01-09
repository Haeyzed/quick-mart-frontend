"use client"

import { useEffect, useCallback } from 'react'
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Checkmark,
  Moon01Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeSwitch() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    const themeColor = resolvedTheme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [resolvedTheme])

  const handleThemeChange = useCallback(
    (newTheme: 'light' | 'dark' | 'system', e?: React.MouseEvent) => {
      const root = document.documentElement

      if (!document.startViewTransition) {
        setTheme(newTheme)
        return
      }

      // Set coordinates from the click event
      if (e) {
        root.style.setProperty('--x', `${e.clientX}px`)
        root.style.setProperty('--y', `${e.clientY}px`)
      }

      document.startViewTransition(() => {
        setTheme(newTheme)
      })
    },
    [setTheme]
  )

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <HugeiconsIcon icon={Sun01Icon} className='size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <HugeiconsIcon icon={Moon01Icon} className='absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={(e) => handleThemeChange('light', e)}>
          Light{' '}
          <HugeiconsIcon
            icon={Checkmark}
            className={cn('ms-auto size-3.5', theme !== 'light' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleThemeChange('dark', e)}>
          Dark
          <HugeiconsIcon
            icon={Checkmark}
            className={cn('ms-auto size-3.5', theme !== 'dark' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleThemeChange('system', e)}>
          System
          <HugeiconsIcon
            icon={Checkmark}
            className={cn('ms-auto size-3.5', theme !== 'system' && 'hidden')}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

