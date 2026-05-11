import { forwardRef, useState } from 'react'
import { View, TextInput, Text, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native'
import { Colors, Typography, Fonts } from '@/constants/theme'

interface InputProps extends Omit<TextInputProps, 'style'> {
  error?: string
  hint?: string
  containerStyle?: ViewStyle
  left?: React.ReactNode
  right?: React.ReactNode
}

const Input = forwardRef<TextInput, InputProps>(
  ({ error, hint, left, right, containerStyle, ...props }, ref) => {
    const [focused, setFocused] = useState(false)

    return (
      <View style={[styles.wrapper, containerStyle]}>
        <View style={[
          styles.container,
          focused && styles.focused,
          error ? styles.errorBorder : null,
        ]}>
          {left && <View style={styles.side}>{left}</View>}
          <TextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor={Colors.light.onSurfaceVariant}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...({ accessibilityInvalid: !!error } as any)}
            {...props}
          />
          {right && <View style={styles.side}>{right}</View>}
        </View>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : hint ? (
          <Text style={styles.hintText}>{hint}</Text>
        ) : null}
      </View>
    )
  }
)
Input.displayName = 'Input'

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    backgroundColor: Colors.light.input,
    paddingHorizontal: 16,
  },
  focused: {
    borderColor: Colors.light.primary,
  },
  errorBorder: {
    borderColor: Colors.light.error,
  },
  input: {
    flex: 1,
    fontSize: Typography.body.sm,
    color: Colors.light.onSurface,
    paddingVertical: 0,
  },
  side: {
    marginHorizontal: 4,
  },
  errorText: {
    fontSize: Typography.label.md,
    color: Colors.light.error,
    fontFamily: Fonts.body,
  },
  hintText: {
    fontSize: Typography.label.md,
    color: Colors.light.onSurfaceVariant,
    fontFamily: Fonts.body,
  },
})

export { Input }
