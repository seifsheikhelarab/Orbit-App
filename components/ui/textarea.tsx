import { forwardRef } from 'react'
import { TextInput, StyleSheet, type TextInputProps } from 'react-native'
import { Colors, Typography } from '@/constants/theme'

const Textarea = forwardRef<TextInput, TextInputProps>((props, ref) => {
  return (
    <TextInput
      ref={ref}
      multiline
      textAlignVertical="top"
      style={styles.textarea}
      placeholderTextColor={Colors.light.onSurfaceVariant}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

const styles = StyleSheet.create({
  textarea: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    backgroundColor: Colors.light.input,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: Typography.body.sm,
    color: Colors.light.onSurface,
    lineHeight: 20,
  },
})

export { Textarea }
