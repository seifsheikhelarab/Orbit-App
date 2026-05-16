import { useMemo } from 'react'
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { Colors, Typography } from '@/constants/theme'

interface SpinnerProps {
  size?: 'small' | 'large'
  color?: 'primary' | 'secondary' | 'white' | 'muted'
}

function getColorMap(c: typeof Colors.light): Record<string, string> {
  return {
    primary: c.primary,
    secondary: c.secondary,
    white: c.onPrimary,
    muted: c.mutedForeground,
  }
}

function Spinner({ size = 'small', color = 'primary' }: SpinnerProps) {
  const colors = useColors()
  const colorMap = useMemo(() => getColorMap(colors), [colors])
  return (
    <ActivityIndicator
      size={size}
      color={colorMap[color]}
    />
  )
}

function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <View style={styles.loadingScreen}>
      <Spinner size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    loadingScreen: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
      padding: 32,
    },
    message: {
      fontSize: Typography.body.sm,
      color: c.mutedForeground,
    },
  })
}

export { Spinner, LoadingScreen }
