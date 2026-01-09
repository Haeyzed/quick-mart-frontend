"use client"

import type React from "react"

import { THEMES } from "@/lib/themes"
import { themeColors } from "@/lib/theme-colors"
import { cn } from "@/lib/utils"
import { useThemeConfig } from "@/components/active-theme"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ThemeSelector({ className }: React.ComponentProps<"div">) {
  const { activeTheme, setActiveTheme } = useThemeConfig()

  const value = activeTheme || "neutral"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Label htmlFor="theme-selector" className="sr-only">
        Color Theme
      </Label>
      <Select value={value} onValueChange={setActiveTheme}>
        <SelectTrigger
          id="theme-selector"
          className="bg-secondary text-secondary-foreground border-secondary justify-start shadow-none w-full flex-1"
        >
          <span className="font-medium">Theme:</span>
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent align="end" className="w-[200px]">
          {THEMES.map((theme) => {
            const themeColor = themeColors[theme.name]
            const isSelected = activeTheme === theme.name
            return (
              <SelectItem key={theme.name} value={theme.name} className="cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <div
                    className="size-4 rounded-full border border-border"
                    style={{ backgroundColor: themeColor?.color }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{theme.label}</div>
                  </div>
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
