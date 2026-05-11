import { View, Text, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: 'default' | 'search' | 'inbox' | 'applications'
  action?: { label: string; onPress: () => void }
}

const iconMap: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  default: { name: 'document-outline', color: Colors.light.onSurfaceVariant },
  search: { name: 'search-outline', color: Colors.light.primary },
  inbox: { name: 'mail-outline', color: Colors.light.accent },
  applications: { name: 'briefcase-outline', color: Colors.light.secondary },
}

const defaultContent: Record<string, { title: string; description: string }> = {
  applications: {
    title: 'No applications yet',
    description: 'Start tracking your job search. Add positions you\'re interested in and we\'ll help you stay organized.',
  },
  search: {
    title: 'No results found',
    description: 'Try adjusting your search terms or clearing some filters to see more options.',
  },
  inbox: {
    title: 'All caught up',
    description: 'Nothing new here right now. We\'ll let you know when something changes.',
  },
  default: {
    title: 'Nothing here yet',
    description: 'Get started by adding your first item.',
  },
}

function EmptyState({ title, description, icon = 'default', action }: EmptyStateProps) {
  const ico = iconMap[icon]
  const content = defaultContent[icon] || defaultContent.default
  const floatAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconContainer, {
        transform: [{
          translateY: floatAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -6],
          }),
        }],
      }]}>
        <Ionicons name={ico.name as any} size={32} color={ico.color} />
      </Animated.View>
      <Text style={styles.title}>{title || content.title}</Text>
      <Text style={styles.description}>{description || content.description}</Text>
      {action && (
        <Button onPress={action.onPress} style={styles.button}>
          {action.label}
        </Button>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
    minHeight: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.headline.sm,
    fontFamily: Fonts.headline,
    fontWeight: '700',
    color: Colors.light.onSurface,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 340,
  },
  button: {
    marginTop: 8,
  },
})

export { EmptyState }
