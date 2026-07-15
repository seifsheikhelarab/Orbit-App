import { forwardRef, useState, useMemo, useCallback } from 'react'
import { View, TextInput, Text, Pressable, StyleSheet, type TextInputProps, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '@/hooks/useColors'
import { Colors, Typography, Fonts } from '@/constants/theme'

interface InputProps extends Omit<TextInputProps, 'style'> {
  error?: string
  hint?: string
  containerStyle?: ViewStyle | ViewStyle[]
  left?: React.ReactNode
  right?: React.ReactNode
  clearable?: boolean
  accessibilityLabel?: string
}

const Input = forwardRef<TextInput, InputProps>(
  ({ error, hint, left, right, clearable, containerStyle, onChangeText, value, accessibilityLabel, ...props }, ref) => {
    const colors = useColors()
    const styles = useMemo(() => getStyles(colors), [colors])
    const [focused, setFocused] = useState(false)

    const handleClear = useCallback(() => {
      onChangeText?.('')
    }, [onChangeText])

    const showClear = clearable && value && value.length > 0 && focused

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
            value={value}
            onChangeText={onChangeText}
            style={styles.input}
            placeholderTextColor={colors.onSurfaceVariant}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            accessibilityLabel={accessibilityLabel}
            {...props}
          />
          {showClear && (
            <Pressable
              onPress={handleClear}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear input"
            >
              <Ionicons name="close-circle" size={16} color={colors.onSurfaceVariant} />
            </Pressable>
          )}
          {right && !showClear && <View style={styles.side}>{right}</View>}
        </View>
        {error ? (
          <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
        ) : hint ? (
          <Text style={styles.hintText} numberOfLines={2}>{hint}</Text>
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
    clearButton: {
      padding: 4,
      marginLeft: 4,
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

export { Input }
