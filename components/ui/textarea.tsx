import { forwardRef, useState, useMemo } from 'react'
import { View, TextInput, Text, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { Colors, Typography, Fonts } from '@/constants/theme'

interface TextareaProps extends Omit<TextInputProps, 'style'> {
  error?: string
  hint?: string
  containerStyle?: ViewStyle
  style?: TextInputProps['style']
}

const Textarea = forwardRef<TextInput, TextareaProps>(({ error, hint, containerStyle, style, ...props }, ref) => {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const [focused, setFocused] = useState(false)

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <TextInput
        ref={ref}
        multiline
        textAlignVertical="top"
        style={[
          styles.textarea,
          focused && styles.focused,
          error ? styles.errorBorder : null,
        ]}
        placeholderTextColor={colors.onSurfaceVariant}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...({ accessibilityInvalid: !!error } as any)}
        {...props}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  )
})
Textarea.displayName = 'Textarea'

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    wrapper: {
      gap: 4,
    },
    textarea: {
      minHeight: 80,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.outline,
      backgroundColor: c.input,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: Typography.body.sm,
      color: c.onSurface,
      lineHeight: 20,
    },
    focused: {
      borderColor: c.primary,
    },
    errorBorder: {
      borderColor: c.error,
    },
    errorText: {
      fontSize: Typography.label.md,
      color: c.error,
      fontFamily: Fonts.body,
      lineHeight: 18,
    },
    hintText: {
      fontSize: Typography.label.md,
      color: c.onSurfaceVariant,
      fontFamily: Fonts.body,
      lineHeight: 18,
    },
  })
}

export { Textarea }
