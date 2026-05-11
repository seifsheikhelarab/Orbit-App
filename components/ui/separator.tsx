import { View, StyleSheet, type ViewStyle } from 'react-native'
import { Colors } from '@/constants/theme'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  style?: ViewStyle
}

function Separator({ orientation = 'horizontal', style }: SeparatorProps) {
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

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: Colors.light.outline,
    width: '100%',
  },
  vertical: {
    width: 1,
    backgroundColor: Colors.light.outline,
    height: '100%',
  },
})

export { Separator }
