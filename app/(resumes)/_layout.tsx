import { Stack } from 'expo-router'
import { ErrorBoundary } from '@/components/ui/error-boundary'

export default function ResumesLayout() {
  return (
    <ErrorBoundary>
      <Stack screenOptions={{ headerShown: false }} />
    </ErrorBoundary>
  )
}
