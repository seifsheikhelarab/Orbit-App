import { forwardRef, useMemo } from 'react'
import { TextInput, StyleSheet, type TextInputProps } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { Colors, Typography } from '@/constants/theme'

const Textarea = forwardRef<TextInput, TextInputProps>((props, ref) => {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <TextInput
      ref={ref}
      multiline
      textAlignVertical="top"
      style={styles.textarea}
      placeholderTextColor={colors.onSurfaceVariant}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
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
  })
}

export { Textarea }
