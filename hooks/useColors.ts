import { useThemeMode } from '@/contexts/ThemeContext'
import { Colors } from '@/constants/theme'

export function useColors() {
  const { isDark } = useThemeMode()
  return isDark ? Colors.dark : Colors.light
}
