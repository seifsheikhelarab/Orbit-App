import { forwardRef } from 'react'
import { Pressable, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native'
import { cva, type VariantProps } from 'class-variance-authority'
import { useColors } from '@/hooks/useColors'
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
  default: { height: 44, paddingHorizontal: 24, borderRadius: 12 },
  xs: { height: 44, paddingHorizontal: 16, borderRadius: 8 },
  sm: { height: 34, paddingHorizontal: 16, borderRadius: 8 },
  lg: { height: 52, paddingHorizontal: 32, borderRadius: 12 },
  xl: { height: 60, paddingHorizontal: 40, borderRadius: 14 },
  icon: { height: 44, width: 44, borderRadius: 12 },
  'icon-xs': { height: 44, width: 44, borderRadius: 8 },
  'icon-sm': { height: 44, width: 44, borderRadius: 8 },
  'icon-lg': { height: 52, width: 52, borderRadius: 12 },
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
    const colors = useColors()

    const getVariantBg = (v: string | null | undefined): ViewStyle => {
      switch (v) {
        case 'secondary': return { backgroundColor: colors.secondaryContainer }
        case 'accent': return { backgroundColor: colors.accent }
        case 'outline': return { backgroundColor: 'transparent' }
        case 'ghost': return { backgroundColor: 'transparent' }
        case 'destructive': return { backgroundColor: colors.error }
        case 'link': return { backgroundColor: 'transparent' }
        default: return { backgroundColor: colors.primary }
      }
    }

    const getVariantText = (v: string | null | undefined): TextStyle => {
      switch (v) {
        case 'secondary': return { color: colors.onSecondaryContainer }
        case 'accent': return { color: colors.onAccent }
        case 'outline': return { color: colors.onSurface }
        case 'ghost': return { color: colors.onSurfaceVariant }
        case 'destructive': return { color: colors.onError }
        case 'link': return { color: colors.primary }
        default: return { color: colors.onPrimary }
      }
    }

    const getVariantBorder = (v: string | null | undefined): ViewStyle => {
      switch (v) {
        case 'outline': return { borderWidth: 1, borderColor: colors.outline }
        default: return {}
      }
    }

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
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: pressed ? 2 : 6 },
            shadowOpacity: pressed ? 0.2 : 0.3,
            shadowRadius: pressed ? 10 : 20,
            elevation: pressed ? 3 : 6,
          },
          variant === 'accent' && {
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: pressed ? 2 : 6 },
            shadowOpacity: pressed ? 0.2 : 0.3,
            shadowRadius: pressed ? 10 : 20,
            elevation: pressed ? 3 : 6,
          },
          variant === 'destructive' && {
            shadowColor: colors.error,
            shadowOffset: { width: 0, height: pressed ? 2 : 6 },
            shadowOpacity: pressed ? 0.2 : 0.3,
            shadowRadius: pressed ? 10 : 20,
            elevation: pressed ? 3 : 6,
          },
          {
            opacity: pressed ? 0.85 : 1,
            transform: pressed ? [{ scale: 0.96 }] : [],
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


const styles = StyleSheet.create({
  base: buttonBase,
})

export { Button, buttonVariants }
