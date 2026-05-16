import { useMemo } from 'react'
import { Text, StyleSheet, type TextStyle } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { Colors, Typography } from '@/constants/theme'

interface LabelProps {
  children: React.ReactNode
  required?: boolean
  style?: TextStyle
}

function Label({ children, required, style }: LabelProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <Text style={[styles.label, style]}>
      {children}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    label: {
      fontSize: Typography.label.lg,
      fontWeight: '600',
      color: c.onSurface,
    },
    required: {
      color: c.primary,
    },
  })
}

export { Label }
