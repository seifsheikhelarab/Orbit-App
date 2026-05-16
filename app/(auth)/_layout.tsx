import { Stack } from 'expo-router'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function AuthLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </ErrorBoundary>
  )
}
