import { View, Text, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts, Shadows } from '@/constants/theme'
import { useEffect, useRef, useMemo } from 'react'
import { useColors } from '@/hooks/useColors'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: 'default' | 'search' | 'inbox' | 'applications'
  action?: { label: string; onPress: () => void }
}

const defaultContent: Record<string, { title: string; description: string }> = {
  applications: {
    title: 'No applications yet',
    description: 'Start tracking your job search. Tap "Add Application" to log your first position.',
  },
  search: {
    title: 'No results found',
    description: 'Try adjusting your search terms or clearing filters to find what you\'re looking for.',
  },
  inbox: {
    title: 'All caught up',
    description: 'Nothing new right now. Notifications will appear here when something changes.',
  },
  default: {
    title: 'Nothing here yet',
    description: 'Get started by adding your first item using the button below.',
  },
}

function EmptyState({ title, description, icon = 'default', action }: EmptyStateProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])

  const iconMap = {
    default: { name: 'document-outline' as const, color: colors.onSurfaceVariant },
    search: { name: 'search-outline' as const, color: colors.primary },
    inbox: { name: 'mail-outline' as const, color: colors.accent },
    applications: { name: 'briefcase-outline' as const, color: colors.secondary },
  }

  const ico = iconMap[icon]
  const content = defaultContent[icon] || defaultContent.default
  const floatAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    )
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    )
    float.start()
    pulse.start()
    return () => { float.stop(); pulse.stop() }
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, {
        transform: [
          { translateY: floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
          { scale: pulseAnim },
        ],
      }]}>
        <Ionicons name={ico.name as any} size={40} color={ico.color} />
      </Animated.View>
      <Text style={styles.title}>{title || content.title}</Text>
      <Text style={styles.description}>{description || content.description}</Text>
      {action && (
        <Button onPress={action.onPress} variant="accent" style={styles.button}>
          {action.label}
        </Button>
      )}
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
      gap: 12,
      minHeight: 300,
    },
    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 24,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.md,
    },
    title: {
      fontSize: Typography.headline.lg,
      fontFamily: Fonts.headline,
      fontWeight: '800',
      color: c.onSurface,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    description: {
      fontSize: Typography.body.sm,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      maxWidth: 340,
      lineHeight: 22,
    },
    button: {
      marginTop: 12,
    },
  })
}

export { EmptyState }
