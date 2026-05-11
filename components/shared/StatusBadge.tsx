import { View, Text, StyleSheet } from 'react-native'
import { type ApplicationStatus, APPLICATION_STATUS_CONFIG, APPLICATION_STATUSES } from '@/lib/status'
import { Colors, Typography, Fonts } from '@/constants/theme'

const UNKNOWN_STATUS = 'CLOSED' as ApplicationStatus

interface StatusBadgeProps {
  status: ApplicationStatus
  size?: 'sm' | 'default' | 'lg'
}

const sizeStyles: Record<string, { height: number; px: number; fontSize: number }> = {
  sm: { height: 20, px: 8, fontSize: Typography.label.sm },
  default: { height: 24, px: 10, fontSize: Typography.label.sm },
  lg: { height: 32, px: 12, fontSize: Typography.label.md },
}

const variantBg: Record<string, string> = {
  saved: Colors.light.statusBgSaved,
  applied: Colors.light.statusBgApplied,
  phone_screen: Colors.light.statusBgPhoneScreen,
  interview: Colors.light.statusBgInterview,
  offer: Colors.light.statusBgOffer,
  closed: Colors.light.statusBgClosed,
}

const variantText: Record<string, string> = {
  saved: Colors.light.statusTextSaved,
  applied: Colors.light.statusTextApplied,
  phone_screen: Colors.light.statusTextPhoneScreen,
  interview: Colors.light.statusTextInterview,
  offer: Colors.light.statusTextOffer,
  closed: Colors.light.statusTextClosed,
}

function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const isValid = APPLICATION_STATUSES.includes(status)
  const config = isValid ? APPLICATION_STATUS_CONFIG[status] : APPLICATION_STATUS_CONFIG[UNKNOWN_STATUS]
  const sz = sizeStyles[size]
  const bg = variantBg[config.variant] || Colors.light.primary
  const text = variantText[config.variant] || Colors.light.onPrimary

  return (
    <View style={[styles.badge, { height: sz.height, paddingHorizontal: sz.px, backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize: sz.fontSize, color: text }]}>{config.label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
})

export { StatusBadge }
