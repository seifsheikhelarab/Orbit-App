import { ActivityIndicator, View, Text, StyleSheet } from 'react-native'
import { Colors, Typography } from '@/constants/theme'

interface SpinnerProps {
  size?: 'small' | 'large'
  color?: 'primary' | 'secondary' | 'white' | 'muted'
}

const colorMap: Record<string, string> = {
  primary: Colors.light.primary,
  secondary: Colors.light.secondary,
  white: Colors.light.onPrimary,
  muted: Colors.light.mutedForeground,
}

function Spinner({ size = 'small', color = 'primary' }: SpinnerProps) {
  return (
    <ActivityIndicator
      size={size}
      color={colorMap[color]}
    />
  )
}

function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <View style={styles.loadingScreen}>
      <Spinner size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  message: {
    fontSize: Typography.body.sm,
    color: Colors.light.mutedForeground,
  },
})

export { Spinner, LoadingScreen }
