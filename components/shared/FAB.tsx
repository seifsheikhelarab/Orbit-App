import { useRef, useEffect, useMemo } from 'react'
import { Pressable, Animated, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '@/hooks/useColors'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import { Shadows } from '@/constants/theme'
import { AnimationTiming } from '@/constants/animations'

interface FABProps {
  icon?: keyof typeof Ionicons.glyphMap
  onPress: () => void
  visible?: boolean
  accessibilityLabel?: string
}

function FAB({ icon = 'add', onPress, visible = true, accessibilityLabel }: FABProps) {
  const colors = useColors()
  const reduceMotion = useReduceMotion()
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (reduceMotion) {
      scaleAnim.setValue(visible ? 1 : 0)
      return
    }
    Animated.timing(scaleAnim, {
      toValue: visible ? 1 : 0,
      ...AnimationTiming.easeOutQuart(300),
    }).start()
  }, [visible, reduceMotion])

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!reduceMotion) {
            Animated.timing(rotateAnim, {
              toValue: 1,
              ...AnimationTiming.micro(),
            }).start()
          }
        }}
        onPressOut={() => {
          if (!reduceMotion) {
            Animated.timing(rotateAnim, {
              toValue: 0,
              ...AnimationTiming.micro(),
            }).start()
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? 'Add'}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: pressed ? 4 : 8 },
            shadowOpacity: pressed ? 0.3 : 0.4,
            shadowRadius: pressed ? 12 : 24,
            elevation: pressed ? 6 : 10,
            opacity: pressed ? 0.9 : 1,
            transform: pressed ? [{ scale: 0.94 }] : [],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name={icon} size={24} color={colors.onAccent} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
})

export { FAB }
