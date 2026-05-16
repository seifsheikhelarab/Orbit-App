import { forwardRef, useState, useMemo } from 'react'
import { View, TextInput, Text, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native'
import { useColors } from '@/hooks/useColors'
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
    const colors = useColors()
    const styles = useMemo(() => getStyles(colors), [colors])
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
            placeholderTextColor={colors.onSurfaceVariant}
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

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    wrapper: {
      gap: 4,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.outline,
      backgroundColor: c.input,
      paddingHorizontal: 16,
    },
    focused: {
      borderColor: c.primary,
    },
    errorBorder: {
      borderColor: c.error,
    },
    input: {
      flex: 1,
      fontSize: Typography.body.sm,
      color: c.onSurface,
      paddingVertical: 0,
    },
    side: {
      marginHorizontal: 4,
    },
    errorText: {
      fontSize: Typography.label.md,
      color: c.error,
      fontFamily: Fonts.body,
    },
    hintText: {
      fontSize: Typography.label.md,
      color: c.onSurfaceVariant,
      fontFamily: Fonts.body,
    },
  })
}

export { Input }
