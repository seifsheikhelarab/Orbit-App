import { Switch as RNSwitch, StyleSheet, type ViewStyle } from 'react-native'
import { useColors } from '@/hooks/useColors'
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
  const colors = useColors()
  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      trackColor={{
        false: colors.surfaceContainerHigh,
        true: colors.primary,
      }}
      thumbColor={colors.surface}
      style={style}
    />
  )
}

export { Switch }
