import { useMemo } from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { Colors } from '@/constants/theme'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  style?: ViewStyle
}

function Separator({ orientation = 'horizontal', style }: SeparatorProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <View
      accessibilityElementsHidden
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        style,
      ]}
    />
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    horizontal: {
      height: 1,
      backgroundColor: c.outline,
      width: '100%',
    },
    vertical: {
      width: 1,
      backgroundColor: c.outline,
      height: '100%',
    },
  })
}

export { Separator }
