import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { hexa } from '@/lib/opacity'
import { useColors } from '@/hooks/useColors'

interface SegmentedControlProps {
  label: string
  description?: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}

export function SegmentedControl({
  label,
  description,
  value,
  options,
  onChange,
}: SegmentedControlProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      <View style={styles.track}>
        {options.map((option) => {
          const active = value === option
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.option, active && styles.optionActive]}
              accessibilityRole="button"
            >
              {active && <View style={styles.activeBg} />}
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {option}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      gap: 8,
    },
    label: {
      fontSize: Typography.label.sm,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: hexa(c.primary, 0.60),
      fontFamily: Fonts.body,
    },
    description: {
      fontSize: Typography.label.md,
      lineHeight: 16,
      color: hexa(c.onSurfaceVariant, 0.70),
      fontStyle: 'italic',
      fontFamily: Fonts.body,
    },
    track: {
      flexDirection: 'row',
      backgroundColor: hexa(c.surfaceContainerHigh, 0.50),
      borderRadius: 16,
      padding: 6,
      gap: 4,
    },
    option: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionActive: {},
    activeBg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: c.surface,
      borderRadius: 12,
      shadowColor: c.onSurface,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    optionText: {
      fontSize: Typography.label.md,
      fontWeight: '700',
      color: hexa(c.onSurfaceVariant, 0.50),
      textTransform: 'capitalize',
      fontFamily: Fonts.body,
    },
    optionTextActive: {
      color: c.primary,
    },
  })
}
