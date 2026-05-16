import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { useMemo } from 'react'
import { hexa } from '@/lib/opacity'

interface ApiErrorProps {
  message?: string
  onRetry?: () => void
  retryLabel?: string
  fullScreen?: boolean
}

function ApiError({ message, onRetry, retryLabel = 'Try Again', fullScreen }: ApiErrorProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={[styles.iconWrap, { backgroundColor: hexa(colors.error, 0.10) }]}>
        <Ionicons name="cloud-offline-outline" size={36} color={colors.error} />
      </View>
      <Text style={styles.title}>Failed to load data</Text>
      <Text style={styles.description}>
        {message || 'Something went wrong while fetching data. Please check your connection and try again.'}
      </Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && { opacity: 0.8 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.onPrimary} />
          <Text style={styles.retryText}>{retryLabel}</Text>
        </Pressable>
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
      minHeight: 200,
    },
    fullScreen: {
      flex: 1,
      minHeight: 400,
    },
    iconWrap: {
      width: 80,
      height: 80,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: Typography.headline.sm,
      fontFamily: Fonts.headline,
      fontWeight: '700',
      color: c.onSurface,
      textAlign: 'center',
    },
    description: {
      fontSize: Typography.body.sm,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      maxWidth: 340,
      lineHeight: 20,
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: c.primary,
      marginTop: 8,
    },
    retryText: {
      fontSize: Typography.body.sm,
      fontWeight: '600',
      color: c.onPrimary,
      fontFamily: Fonts.body,
    },
  })
}

export { ApiError }
