"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

const STORAGE_KEY = "theme"
const THEMES: Theme[] = ["light", "dark", "system"]

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "system"
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === "light" || saved === "dark" || saved === "system") {
    return saved
  }
  return "system"
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const resolved = theme === "system" ? getSystemTheme() : theme
  if (resolved === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

interface ThemeContextType {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  cycleTheme: () => {},
})

function useSystemTheme() {
  return React.useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia("(prefers-color-scheme: dark)")
      mql.addEventListener("change", cb)
      return () => mql.removeEventListener("change", cb)
    },
    () => getSystemTheme(),
    () => "light" as const,
  )
}

export function useTheme() {
  return React.useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(getInitialTheme)
  const systemTheme = useSystemTheme()
  const resolvedTheme = theme === "system" ? systemTheme : theme

  React.useEffect(() => {
    applyTheme(theme)
  }, [theme, systemTheme])

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }, [])

  const cycleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const nextIndex = (THEMES.indexOf(prev) + 1) % THEMES.length
      const next = THEMES[nextIndex]
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
