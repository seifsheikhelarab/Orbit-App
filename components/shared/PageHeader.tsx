import { View, Text, StyleSheet, type ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '@/hooks/useColors'
import { useMemo } from 'react'
import { Colors, Typography, Fonts } from '@/constants/theme'

interface PageHeaderProps {
  icon?: keyof typeof Ionicons.glyphMap
  iconVariant?: 'primary' | 'accent' | 'surface'
  title: string
  subtitle?: string
  badge?: string | number
  badgeVariant?: 'count' | 'pill'
  right?: React.ReactNode
  style?: ViewStyle
}

function PageHeader({ icon, iconVariant = 'primary', title, subtitle, badge, badgeVariant = 'pill', right, style }: PageHeaderProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])

  const iconBgMap = {
    primary: colors.primary,
    accent: colors.accentContainer,
    surface: colors.surfaceContainer,
  }

  const iconColorMap = {
    primary: colors.onPrimary,
    accent: colors.accent,
    surface: colors.onSurfaceVariant,
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: iconBgMap[iconVariant] }]}>
            <Ionicons name={icon} size={20} color={iconColorMap[iconVariant]} />
          </View>
        )}
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {badge !== undefined && badgeVariant === 'pill' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
            {badge !== undefined && badgeVariant === 'count' && (
              <Text style={styles.countBadge}>{badge}</Text>
            )}
          </View>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: c.surface,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: Typography.headline.sm,
      fontWeight: '700',
      fontFamily: Fonts.headline,
      color: c.onSurface,
      letterSpacing: -0.3,
    },
    badge: {
      backgroundColor: c.accentContainer,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 100,
    },
    badgeText: {
      fontSize: Typography.label.sm,
      fontWeight: '700',
      color: c.accent,
      fontFamily: Fonts.body,
    },
    countBadge: {
      fontSize: Typography.label.md,
      fontFamily: Fonts.body,
      fontWeight: '700',
      color: c.accent,
    },
    subtitle: {
      fontSize: Typography.label.lg,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
      marginTop: 1,
    },
    right: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
  })
}

export { PageHeader }
