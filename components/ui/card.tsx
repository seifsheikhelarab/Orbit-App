import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native'
import { Colors, Typography } from '@/constants/theme'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'elevated' | 'outline'
  size?: 'default' | 'sm'
  style?: ViewStyle
}

function Card({ children, variant = 'default', size = 'default', style }: CardProps) {
  return (
    <View style={[
      styles.base,
      variant === 'elevated' && styles.elevated,
      variant === 'outline' && styles.outline,
      variant === 'glass' && styles.glass,
      size === 'sm' && styles.sm,
      style,
    ]}>
      {children}
    </View>
  )
}

function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.header, style]}>{children}</View>
}

function CardTitle({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children}</Text>
}

function CardDescription({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.description, style]}>{children}</Text>
}

function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>
}

function CardFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.footer, style]}>{children}</View>
}

function CardAction({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.action, style]}>{children}</View>
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
    gap: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.5)',
    backgroundColor: 'rgba(248, 249, 250, 0.5)',
    padding: 32,
  },
  elevated: {
    borderWidth: 0,
    backgroundColor: Colors.light.surface,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.outline,
    padding: 24,
    shadowOpacity: 0,
    elevation: 0,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderColor: 'rgba(17, 24, 39, 0.2)',
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  sm: {
    gap: 16,
    padding: 20,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: Typography.headline.sm,
    fontWeight: '700',
    color: Colors.light.onSurface,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: Typography.body.sm,
    fontWeight: '500',
    color: Colors.light.onSurfaceVariant,
  },
  action: {
    alignSelf: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
})

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction }
