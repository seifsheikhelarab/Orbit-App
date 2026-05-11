import { forwardRef } from 'react'
import { Pressable, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { Colors, Typography, Fonts } from '@/constants/theme'

const buttonVariants = cva('', {
  variants: {
    variant: {
      default: {},
      secondary: {},
      accent: {},
      outline: {},
      ghost: {},
      destructive: {},
      link: {},
    },
    size: {
      default: {},
      xs: {},
      sm: {},
      lg: {},
      xl: {},
      icon: {},
      'icon-xs': {},
      'icon-sm': {},
      'icon-lg': {},
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

const buttonBase: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
}

const sizeStyles: Record<string, ViewStyle> = {
  default: { height: 40, paddingHorizontal: 20, borderRadius: 12 },
  xs: { height: 28, paddingHorizontal: 10, borderRadius: 8 },
  sm: { height: 32, paddingHorizontal: 14, borderRadius: 8 },
  lg: { height: 48, paddingHorizontal: 28, borderRadius: 16 },
  xl: { height: 56, paddingHorizontal: 36, borderRadius: 16 },
  icon: { height: 40, width: 40, borderRadius: 12 },
  'icon-xs': { height: 24, width: 24, borderRadius: 8 },
  'icon-sm': { height: 32, width: 32, borderRadius: 8 },
  'icon-lg': { height: 48, width: 48, borderRadius: 16 },
}

const sizeTextStyles: Record<string, TextStyle> = {
  default: { fontSize: Typography.body.sm, fontWeight: '600' as const },
  xs: { fontSize: Typography.label.sm, fontWeight: '600' as const, fontFamily: Fonts.body },
  sm: { fontSize: Typography.label.sm, fontWeight: '600' as const, fontFamily: Fonts.body },
  lg: { fontSize: Typography.body.md, fontWeight: '600' as const },
  xl: { fontSize: Typography.body.md, fontWeight: '600' as const },
  icon: {},
  'icon-xs': {},
  'icon-sm': {},
  'icon-lg': {},
}

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  onPress?: () => void
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  children?: React.ReactNode
  accessibilityLabel?: string
}

const Button = forwardRef<any, ButtonProps>(
  ({ variant = 'default', size = 'default', disabled, loading, style, textStyle, onPress, children, accessibilityLabel }, ref) => {
    const variantBg = getVariantBg(variant)
    const variantText = getVariantText(variant)
    const variantBorder = getVariantBorder(variant)

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? (typeof children === 'string' ? children : undefined)}
        style={({ pressed }) => [
          buttonBase,
          sizeStyles[size!],
          variantBg,
          variantBorder,
          variant === 'default' && {
            shadowColor: Colors.light.primary,
            shadowOffset: { width: 0, height: pressed ? 2 : 4 },
            shadowOpacity: pressed ? 0.15 : 0.2,
            shadowRadius: pressed ? 8 : 12,
            elevation: pressed ? 2 : 4,
          },
          variant === 'destructive' && {
            shadowColor: Colors.light.error,
            shadowOffset: { width: 0, height: pressed ? 2 : 4 },
            shadowOpacity: pressed ? 0.15 : 0.2,
            shadowRadius: pressed ? 8 : 12,
            elevation: pressed ? 2 : 4,
          },
          {
            opacity: pressed ? 0.75 : 1,
            transform: pressed ? [{ scale: 0.97 }] : [],
          },
          (disabled || loading) && { opacity: 0.5 },
          style,
        ]}
      >
        {loading ? (
          <Text style={[{ fontSize: Typography.body.sm, fontFamily: Fonts.body }, variantText]}>...</Text>
        ) : typeof children === 'string' ? (
          <Text style={[sizeTextStyles[size!], variantText, textStyle]}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    )
  }
)
Button.displayName = 'Button'

function getVariantBg(variant: string | null | undefined): ViewStyle {
  switch (variant) {
    case 'secondary': return { backgroundColor: Colors.light.secondaryContainer }
    case 'accent': return { backgroundColor: Colors.light.accent }
    case 'outline': return { backgroundColor: 'transparent' }
    case 'ghost': return { backgroundColor: 'transparent' }
    case 'destructive': return { backgroundColor: Colors.light.error }
    case 'link': return { backgroundColor: 'transparent' }
    default: return { backgroundColor: Colors.light.primary }
  }
}

function getVariantText(variant: string | null | undefined): TextStyle {
  switch (variant) {
    case 'secondary': return { color: Colors.light.onSecondaryContainer }
    case 'accent': return { color: Colors.light.onAccent }
    case 'outline': return { color: Colors.light.onSurface }
    case 'ghost': return { color: Colors.light.onSurfaceVariant }
    case 'destructive': return { color: Colors.light.onError }
    case 'link': return { color: Colors.light.primary }
    default: return { color: Colors.light.onPrimary }
  }
}

function getVariantBorder(variant: string | null | undefined): ViewStyle {
  switch (variant) {
    case 'outline': return { borderWidth: 1, borderColor: Colors.light.outline }
    default: return {}
  }
}

const styles = StyleSheet.create({
  base: buttonBase,
})

export { Button, buttonVariants }
