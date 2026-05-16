import { Component, type ErrorInfo, type ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { hexa } from '@/lib/opacity'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error.message)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons name="warning-outline" size={40} color={Colors.light.error} />
          </View>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.description}>
            {this.state.error?.message || 'An unexpected error occurred rendering this section.'}
          </Text>
          <Pressable
            onPress={this.handleRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Ionicons name="refresh-outline" size={16} color={Colors.light.onPrimary} />
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 200,
    backgroundColor: Colors.light.background,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: hexa(Colors.light.error, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.title.md,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: Colors.light.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
  },
  retryText: {
    fontSize: Typography.label.md,
    fontWeight: '600',
    fontFamily: Fonts.body,
    color: Colors.light.onPrimary,
  },
})
