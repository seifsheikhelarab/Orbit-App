import { createContext, useContext, useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import { useColorScheme } from '@/hooks/use-color-scheme'

type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  setMode: (mode: ThemeMode) => Promise<void>
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolvedMode: 'light',
  setMode: async () => {},
  isDark: false,
})

const STORAGE_KEY = 'orbitapp_theme_mode'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored)
      }
      setLoaded(true)
    })
  }, [])

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode)
    await SecureStore.setItemAsync(STORAGE_KEY, newMode)
  }

  const resolvedMode = mode === 'system' ? (systemScheme ?? 'light') : mode

  if (!loaded) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, setMode, isDark: resolvedMode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeMode() {
  return useContext(ThemeContext)
}
