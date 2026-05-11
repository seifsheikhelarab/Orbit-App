import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Colors, Typography, Fonts } from '@/constants/theme'

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

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.light.primary + '99',
    fontFamily: Fonts.body,
  },
  description: {
    fontSize: Typography.label.md,
    lineHeight: 16,
    color: Colors.light.onSurfaceVariant + 'B3',
    fontStyle: 'italic',
    fontFamily: Fonts.body,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surfaceContainerHigh + '80',
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
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: Typography.label.md,
    fontWeight: '700',
    color: Colors.light.onSurfaceVariant + '80',
    textTransform: 'capitalize',
    fontFamily: Fonts.body,
  },
  optionTextActive: {
    color: Colors.light.primary,
  },
})
