import { useState, useMemo } from 'react'
import { View, Text, Pressable, Modal, ScrollView, StyleSheet, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '@/hooks/useColors'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { hexa } from '@/lib/opacity'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  options: SelectOption[]
  error?: string
  style?: ViewStyle
}

function Select({ value, onValueChange, placeholder = 'Select...', options, error, style }: SelectProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)

  return (
    <View style={style}>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={selected?.label || placeholder}
        style={({ pressed }) => [
          styles.trigger,
          error ? styles.triggerError : null,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {selected?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.onSurfaceVariant} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()} style={styles.dropdown}>
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onValueChange?.(option.value)
                    setOpen(false)
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: option.value === value }}
                  style={({ pressed }) => [
                    styles.item,
                    option.value === value && styles.itemSelected,
                    pressed && { backgroundColor: colors.primaryFixed },
                  ]}
                >
                  <Text style={[
                    styles.itemText,
                    option.value === value && styles.itemTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                  {option.value === value && (
                    <Ionicons name="checkmark" size={16} color={colors.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.outline,
      backgroundColor: c.input,
      paddingHorizontal: 16,
      gap: 8,
    },
    triggerError: {
      borderColor: c.error,
    },
    triggerText: {
      fontSize: Typography.body.sm,
      color: c.onSurface,
      flex: 1,
    },
    placeholder: {
      color: c.onSurfaceVariant,
    },
    errorText: {
      fontSize: Typography.label.md,
      color: c.error,
      marginTop: 4,
      fontFamily: Fonts.body,
    },
    overlay: {
      flex: 1,
      backgroundColor: hexa(c.onSurface, 0.30),
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    dropdown: {
      width: '100%',
      maxWidth: 360,
      maxHeight: 300,
      backgroundColor: c.surface,
      borderRadius: 12,
      shadowColor: c.onSurface,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
      padding: 4,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    itemSelected: {
      backgroundColor: c.primaryFixed,
    },
    itemText: {
      fontSize: Typography.body.sm,
      fontWeight: '500',
      color: c.onSurface,
    },
    itemTextSelected: {
      color: c.primary,
      fontWeight: '600',
    },
  })
}

export { Select }
