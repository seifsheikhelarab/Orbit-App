import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native'
import { Colors, Typography, Fonts } from '@/constants/theme'

type BadgeVariant = 'default' | 'secondary' | 'accent' | 'destructive' | 'outline' | 'ghost' | 'link'
  | 'saved' | 'applied' | 'phone' | 'interview' | 'offer' | 'closed'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  style?: ViewStyle
  textStyle?: TextStyle
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  default: { bg: Colors.light.primary, text: Colors.light.onPrimary },
  secondary: { bg: Colors.light.secondaryContainer, text: Colors.light.onSecondaryContainer },
  accent: { bg: Colors.light.accent, text: Colors.light.onAccent },
  destructive: { bg: Colors.light.error, text: Colors.light.onError },
  outline: { bg: 'transparent', text: Colors.light.onSurfaceVariant, border: Colors.light.outline },
  ghost: { bg: 'transparent', text: Colors.light.onSurfaceVariant },
  link: { bg: 'transparent', text: Colors.light.primary },
  saved: { bg: Colors.light.statusBgSaved, text: Colors.light.statusTextSaved, border: Colors.light.statusSaved + '33' },
  applied: { bg: Colors.light.statusBgApplied, text: Colors.light.statusTextApplied, border: Colors.light.statusApplied + '33' },
  phone: { bg: Colors.light.statusBgPhoneScreen, text: Colors.light.statusTextPhoneScreen, border: Colors.light.statusPhoneScreen + '33' },
  interview: { bg: Colors.light.statusBgInterview, text: Colors.light.statusTextInterview, border: Colors.light.statusInterview + '33' },
  offer: { bg: Colors.light.statusBgOffer, text: Colors.light.statusTextOffer, border: Colors.light.statusOffer + '33' },
  closed: { bg: Colors.light.statusBgClosed, text: Colors.light.statusTextClosed, border: Colors.light.statusClosed + '33' },
}

function Badge({ children, variant = 'default', style, textStyle }: BadgeProps) {
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
