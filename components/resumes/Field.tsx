import { View, Text, StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { hexa } from '@/lib/opacity'
import { useColors } from '@/hooks/useColors'
import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  help?: string
  children: ReactNode
}

export function Field({ label, help, children }: FieldProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {help && <Text style={styles.help}>{help}</Text>}
      {children}
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      gap: 6,
    },
    label: {
      fontSize: Typography.label.sm,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: hexa(c.primary, 0.60),
      fontFamily: Fonts.body,
    },
    help: {
      fontSize: Typography.label.sm,
      lineHeight: 15,
      color: hexa(c.onSurfaceVariant, 0.50),
      fontStyle: 'italic',
      fontFamily: Fonts.body,
    },
  })
}
