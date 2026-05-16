import { View, StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { Colors } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { ViewStyle } from 'react-native'

interface FormFieldProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'email-address' | 'phone-pad'
  secureTextEntry?: boolean
  error?: string
  hint?: string
  containerStyle?: ViewStyle
  inputContainerStyle?: ViewStyle
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry,
  error,
  hint,
  containerStyle,
  inputContainerStyle,
}: FormFieldProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])

  return (
    <View style={[styles.container, containerStyle]}>
      <Label>{label}</Label>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        error={error}
        hint={hint}
        containerStyle={inputContainerStyle}
        accessibilityLabel={label}
      />
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      gap: 6,
    },
  })
}

export { FormField }
export type { FormFieldProps }
