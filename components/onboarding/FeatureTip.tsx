import { useEffect, useRef, useMemo } from 'react'
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts, Shadows } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'

interface FeatureTipProps {
  visible: boolean
  onDismiss: () => void
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  description: string
}

export function FeatureTip({ visible, onDismiss, icon = 'bulb-outline', title, description }: FeatureTipProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const slideAnim = useRef(new Animated.Value(-80)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 80, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start()

      const timer = setTimeout(onDismiss, 8000)
      return () => clearTimeout(timer)
    }
  }, [visible])

  if (!visible) return null

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Pressable onPress={onDismiss} style={styles.dismiss} hitSlop={8} accessibilityRole="button">
        <Ionicons name="close" size={16} color={colors.onSurfaceVariant} />
      </Pressable>
    </Animated.View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 14,
      gap: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.accent + '25',
      ...Shadows.md,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.accentContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      gap: 2,
    },
    title: {
      fontSize: Typography.body.sm,
      fontFamily: Fonts.headline,
      fontWeight: '700',
      color: c.onSurface,
    },
    description: {
      fontSize: Typography.label.md,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
      lineHeight: 16,
    },
    dismiss: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
}
