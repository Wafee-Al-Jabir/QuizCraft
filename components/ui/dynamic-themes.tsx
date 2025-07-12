"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Palette, Sparkles, Sun, Moon, Zap, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Theme {
  id: string
  name: string
  icon: React.ReactNode
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
  gradient: string
}

const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Ocean Blue',
    icon: <Sun className="h-4 w-4" />,
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b'
    },
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    icon: <Heart className="h-4 w-4" />,
    colors: {
      primary: '#f59e0b',
      secondary: '#ef4444',
      accent: '#f97316',
      background: '#fef7ed',
      surface: '#fff7ed',
      text: '#9a3412'
    },
    gradient: 'from-orange-400 to-red-500'
  },
  {
    id: 'forest',
    name: 'Forest Green',
    icon: <Sparkles className="h-4 w-4" />,
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#f0fdf4',
      surface: '#ecfdf5',
      text: '#064e3b'
    },
    gradient: 'from-green-400 to-emerald-600'
  },
  {
    id: 'cosmic',
    name: 'Cosmic Purple',
    icon: <Zap className="h-4 w-4" />,
    colors: {
      primary: '#8b5cf6',
      secondary: '#a855f7',
      accent: '#c084fc',
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#581c87'
    },
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    icon: <Moon className="h-4 w-4" />,
    colors: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      accent: '#34d399',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9'
    },
    gradient: 'from-slate-800 to-slate-900'
  }
]

interface ThemeContextType {
  currentTheme: Theme
  setTheme: (themeId: string) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0])

  const setTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
    setCurrentTheme(theme)
    
    // Apply theme to CSS variables
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value)
    })
    
    // Store in localStorage
    localStorage.setItem('quiz-craft-theme', themeId)
  }

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('quiz-craft-theme')
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeSelector() {
  const { currentTheme, setTheme, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative overflow-hidden"
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradient} opacity-20`}
          animate={{ scale: isOpen ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        />
        <div className="relative flex items-center space-x-2">
          {currentTheme.icon}
          <Palette className="h-4 w-4" />
        </div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 z-50"
          >
            <Card className="p-2 shadow-xl border-2 backdrop-blur-md bg-white/95 dark:bg-gray-900/95">
              <div className="grid grid-cols-1 gap-2 min-w-[200px]">
                {themes.map((theme) => (
                  <motion.button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id)
                      setIsOpen(false)
                    }}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                      currentTheme.id === theme.id
                        ? 'ring-2 ring-offset-2 ring-blue-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-full bg-gradient-to-r ${theme.gradient}`}>
                      <div className="text-white">
                        {theme.icon}
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{theme.name}</div>
                      <div className="flex space-x-1 mt-1">
                        {Object.values(theme.colors).slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export function ThemePreview({ themeId }: { themeId: string }) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
  
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`h-24 bg-gradient-to-r ${theme.gradient} p-4 flex items-center justify-between`}
      >
        <div className="text-white">
          <div className="text-sm font-medium">{theme.name}</div>
          <div className="text-xs opacity-80">Theme Preview</div>
        </div>
        <div className="text-white">
          {theme.icon}
        </div>
      </div>
      <div className="p-3" style={{ backgroundColor: theme.colors.background }}>
        <div className="flex space-x-2 mb-2">
          {Object.values(theme.colors).slice(0, 4).map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="text-xs" style={{ color: theme.colors.text }}>
          Color Palette
        </div>
      </div>
    </motion.div>
  )
}

// Hook for theme-aware animations
export function useThemeAnimation() {
  const { currentTheme } = useTheme()
  
  return {
    primaryGlow: {
      boxShadow: `0 0 20px ${currentTheme.colors.primary}40`,
      transition: { duration: 0.3 }
    },
    accentPulse: {
      backgroundColor: [currentTheme.colors.accent, currentTheme.colors.primary, currentTheme.colors.accent],
      transition: { duration: 2, repeat: Infinity }
    },
    gradientShift: {
      background: `linear-gradient(45deg, ${currentTheme.colors.primary}, ${currentTheme.colors.secondary})`,
      transition: { duration: 0.5 }
    }
  }
}