import { useMemo } from 'react'
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native'
import { useColors } from '@/hooks/useColors'
import { Colors, Typography, Fonts, Shadows } from '@/constants/theme'
import { hexa } from '@/lib/opacity'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'elevated' | 'outline' | 'telemetry'
  size?: 'default' | 'sm'
  accentColor?: string
  accentPosition?: 'left' | 'top' | 'none'
  dossier?: boolean
  notification?: boolean
  notificationUnread?: boolean
  notificationOverdue?: boolean
  style?: ViewStyle
}

function TelemetryDots({ accent }: { accent: string }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <View style={styles.telemetryDots}>
      <View style={[styles.telemetryDot, { backgroundColor: accent }]} />
      <View style={[styles.telemetryDot, { backgroundColor: accent, opacity: 0.4, top: 3, right: 18 }]} />
      <View style={[styles.telemetryDot, { backgroundColor: accent, opacity: 0.4, top: 18, right: 3 }]} />
      <View style={[styles.telemetryDot, { backgroundColor: accent, opacity: 0.2, top: 8, right: 24 }]} />
    </View>
  )
}

function DossierLabel({ label, dotColor, textColor }: { label: string; dotColor: string; textColor: string }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <View style={styles.dossierRow}>
      <View style={[styles.dossierDot, { backgroundColor: dotColor }]} />
      <Text style={[styles.dossierLabel, { color: textColor }]}>{label}</Text>
      <View style={[styles.statusLine, { backgroundColor: hexa(dotColor, 0.13) }]} />
    </View>
  )
}

function Card({ children, variant = 'default', size = 'default', accentColor, accentPosition = 'none', dossier, notification, notificationUnread, notificationOverdue, style }: CardProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const accent = accentColor || colors.accent

  return (
    <View style={[
      styles.base,
      variant === 'elevated' && styles.elevated,
      variant === 'outline' && styles.outline,
      variant === 'glass' && styles.glass,
      variant === 'telemetry' && styles.telemetry,
      variant === 'telemetry' && accentColor && { borderLeftColor: accentColor } as ViewStyle,
      size === 'sm' && styles.sm,
      accentPosition === 'left' && { borderLeftWidth: 4, borderLeftColor: accent },
      accentPosition === 'top' && { borderTopWidth: 4, borderTopColor: accent },
      notification && styles.notification,
      notificationUnread && styles.notificationUnread,
      notificationOverdue && styles.notificationOverdue,
      style,
    ]}>
      {dossier && <TelemetryDots accent={accent} />}
      {children}
    </View>
  )
}

function CardHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return <View style={[styles.header, style]}>{children}</View>
}

function CardTitle({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return <Text style={[styles.title, style]}>{children}</Text>
}

function CardDescription({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return <Text style={[styles.description, style]}>{children}</Text>
}

function CardContent({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={style}>{children}</View>
}

function CardFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return <View style={[styles.footer, style]}>{children}</View>
}

function CardAction({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return <View style={[styles.action, style]}>{children}</View>
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    base: {
      flexDirection: 'column',
      gap: 24,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surface,
      padding: 20,
      shadowColor: c.onSurface,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 4,
      overflow: 'hidden',
    },
    elevated: {
      borderWidth: 0,
      ...Shadows.lg,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: c.outline,
      padding: 24,
    },
    glass: {
      backgroundColor: c.surfaceContainerLow,
      borderColor: c.outlineVariant,
      ...Shadows.md,
    },
    telemetry: {
      borderRadius: 32,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderLeftWidth: 5,
      padding: 22,
      ...Shadows.md,
    },
    sm: {
      gap: 16,
      padding: 16,
      borderRadius: 20,
    },
    notification: {
      padding: 16,
      gap: 4,
    },
    notificationUnread: {
      backgroundColor: c.surfaceContainerLow,
      borderColor: hexa(c.primary, 0.19),
    },
    notificationOverdue: {
      borderLeftWidth: 4,
      borderLeftColor: c.error,
    },
    telemetryDots: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 30,
      height: 30,
      opacity: 0.2,
    },
    telemetryDot: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    dossierRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dossierDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    dossierLabel: {
      fontSize: Typography.label.sm,
      fontFamily: Fonts.body,
      fontWeight: '800',
      letterSpacing: 2,
    },
    statusLine: {
      flex: 1,
      height: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    title: {
      fontSize: Typography.headline.sm,
      fontWeight: '700',
      color: c.onSurface,
      letterSpacing: -0.3,
    },
    description: {
      fontSize: Typography.body.sm,
      fontWeight: '500',
      color: c.onSurfaceVariant,
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
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction, TelemetryDots, DossierLabel }
