import { Text, StyleSheet, type TextStyle } from 'react-native'
import { Colors, Typography } from '@/constants/theme'

interface LabelProps {
  children: React.ReactNode
  required?: boolean
  style?: TextStyle
}

function Label({ children, required, style }: LabelProps) {
  return (
    <Text style={[styles.label, style]}>
      {children}
      {required && <Text style={styles.required}> *</Text>}
    </Text>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: Typography.label.lg,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  required: {
    color: Colors.light.primary,
  },
})

export { Label }
