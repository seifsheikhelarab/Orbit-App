import { View, Text, StyleSheet } from 'react-native'
import { Colors, Typography, Fonts } from '@/constants/theme'
import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  help?: string
  children: ReactNode
}

export function Field({ label, help, children }: FieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {help && <Text style={styles.help}>{help}</Text>}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.light.primary + '99',
    fontFamily: Fonts.body,
  },
  help: {
    fontSize: Typography.label.sm,
    lineHeight: 15,
    color: Colors.light.onSurfaceVariant + '80',
    fontStyle: 'italic',
    fontFamily: Fonts.body,
  },
})
