import { useMemo } from 'react'
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { Colors, Typography, Fonts } from '@/constants/theme'

type BadgeVariant = 'default' | 'secondary' | 'accent' | 'destructive' | 'outline' | 'ghost' | 'link'
  | 'saved' | 'applied' | 'phone' | 'interview' | 'offer' | 'closed'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  style?: ViewStyle
  textStyle?: TextStyle
}

function getVariantStyles(c: typeof Colors.light): Record<BadgeVariant, { bg: string; text: string; border?: string }> {
  return {
    default: { bg: c.primary, text: c.onPrimary },
    secondary: { bg: c.secondaryContainer, text: c.onSecondaryContainer },
    accent: { bg: c.accent, text: c.onAccent },
    destructive: { bg: c.error, text: c.onError },
    outline: { bg: 'transparent', text: c.onSurfaceVariant, border: c.outline },
    ghost: { bg: 'transparent', text: c.onSurfaceVariant },
    link: { bg: 'transparent', text: c.primary },
    saved: { bg: c.statusBgSaved, text: c.statusTextSaved, border: c.statusSaved },
    applied: { bg: c.statusBgApplied, text: c.statusTextApplied, border: c.statusApplied },
    phone: { bg: c.statusBgPhoneScreen, text: c.statusTextPhoneScreen, border: c.statusPhoneScreen },
    interview: { bg: c.statusBgInterview, text: c.statusTextInterview, border: c.statusInterview },
    offer: { bg: c.statusBgOffer, text: c.statusTextOffer, border: c.statusOffer },
    closed: { bg: c.statusBgClosed, text: c.statusTextClosed, border: c.statusClosed },
  }
}

function Badge({ children, variant = 'default', style, textStyle }: BadgeProps) {
  const colors = useColors()
  const variantStyles = useMemo(() => getVariantStyles(colors), [colors])
  const v = variantStyles[variant]
  return (
    <View style={[
      styles.badge,
      { backgroundColor: v.bg },
      v.border && { borderWidth: 1, borderColor: v.border },
      style,
    ]}>
      <Text style={[styles.text, { color: v.text }, textStyle]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  text: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: Fonts.body,
  },
})

export { Badge }
