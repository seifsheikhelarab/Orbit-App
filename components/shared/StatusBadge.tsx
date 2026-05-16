import { View, Text, StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { type ApplicationStatus, APPLICATION_STATUS_CONFIG, APPLICATION_STATUSES } from '@/lib/status'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'

const UNKNOWN_STATUS = 'CLOSED' as ApplicationStatus

interface StatusBadgeProps {
  status: ApplicationStatus
  size?: 'sm' | 'default' | 'lg'
}

const sizeStyles: Record<string, { height: number; px: number; fontSize: number }> = {
  sm: { height: 22, px: 10, fontSize: Typography.label.sm },
  default: { height: 28, px: 14, fontSize: Typography.label.md },
  lg: { height: 34, px: 16, fontSize: Typography.title.sm },
}

function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])

  const variantBg: Record<string, string> = {
    saved: colors.statusBgSaved,
    applied: colors.statusBgApplied,
    phone_screen: colors.statusBgPhoneScreen,
    interview: colors.statusBgInterview,
    offer: colors.statusBgOffer,
    closed: colors.statusBgClosed,
  }

  const variantText: Record<string, string> = {
    saved: colors.statusTextSaved,
    applied: colors.statusTextApplied,
    phone_screen: colors.statusTextPhoneScreen,
    interview: colors.statusTextInterview,
    offer: colors.statusTextOffer,
    closed: colors.statusTextClosed,
  }

  const isValid = APPLICATION_STATUSES.includes(status)
  const config = isValid ? APPLICATION_STATUS_CONFIG[status] : APPLICATION_STATUS_CONFIG[UNKNOWN_STATUS]
  const sz = sizeStyles[size]
  const bg = variantBg[config.variant] || colors.primary
  const textColor = variantText[config.variant] || colors.onPrimary

  return (
    <View style={[styles.badge, { height: sz.height, paddingHorizontal: sz.px, backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize: sz.fontSize, color: textColor }]}>{config.label}</Text>
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
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
}

export { StatusBadge }
