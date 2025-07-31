'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'weirdo'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({
  theme: 'dark',
  toggleTheme: () => {}
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('rusty-theme') as Theme | null
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'weirdo')) {
      setTheme(savedTheme)
      if (savedTheme === 'weirdo') {
        document.documentElement.classList.add('weirdo')
      }
    } else {
      // Default to dark theme
      localStorage.setItem('rusty-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'weirdo' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('rusty-theme', newTheme)
    
    if (newTheme === 'weirdo') {
      document.documentElement.classList.add('weirdo')
    } else {
      document.documentElement.classList.remove('weirdo')
    }
  }

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}