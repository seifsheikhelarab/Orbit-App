import { Switch as RNSwitch, StyleSheet, type ViewStyle } from 'react-native'
import { Colors } from '@/constants/theme'

interface SwitchProps {
  value?: boolean
  onValueChange?: (value: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'default'
  style?: ViewStyle
  accessibilityLabel?: string
}

function Switch({ value = false, onValueChange, disabled, style, accessibilityLabel }: SwitchProps) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{
        false: Colors.light.surfaceContainerHigh,
        true: Colors.light.primary,
      }}
      thumbColor={Colors.light.surface}
      style={style}
    />
  )
}

export { Switch }
