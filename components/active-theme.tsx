"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { getCookie, setCookie, removeCookie } from "@/lib/cookies"

const DEFAULT_THEME = "neutral"
const THEME_COOKIE_NAME = 'active-theme'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

type ThemeContextType = {
  activeTheme: string
  setActiveTheme: (theme: string) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ActiveThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = THEME_COOKIE_NAME,
}: {
  children: ReactNode
  defaultTheme?: string
  storageKey?: string
}) {
  const [activeTheme, setActiveThemeState] = useState<string>(
    () => (getCookie(storageKey) as string) || defaultTheme
  )

  useEffect(() => {
    const applyTheme = (theme: string) => {
      const body = document.body
      // Remove all theme classes
      Array.from(body.classList)
        .filter((className) => className.startsWith("theme-"))
        .forEach((className) => {
          body.classList.remove(className)
        })
      // Add the active theme class
      body.classList.add(`theme-${theme}`)
      // Handle scaled themes
      if (theme.endsWith("-scaled")) {
        body.classList.add("theme-scaled")
      }
    }

    applyTheme(activeTheme)
  }, [activeTheme])

  const setActiveTheme = (theme: string) => {
    setCookie(storageKey, theme, THEME_COOKIE_MAX_AGE)
    setActiveThemeState(theme)
  }

  const resetTheme = () => {
    removeCookie(storageKey)
    setActiveThemeState(defaultTheme)
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeConfig() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useThemeConfig must be used within an ActiveThemeProvider")
  }
  return context
}

