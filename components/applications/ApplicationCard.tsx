import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { useMemo } from 'react'
import { Card, DossierLabel } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { type Application } from '@/features/applications/api/useApplications'
import { statusColors } from '@/lib/status'

interface ApplicationCardProps {
  application: Application
  onPress: () => void
}

function ApplicationCard({ application, onPress }: ApplicationCardProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const sc = statusColors[application.applicationStatus]

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        pressed && { opacity: 0.95 },
      ]}
      accessibilityRole="button"
    >
      <Card variant="telemetry" accentColor={sc.border} dossier>
        <DossierLabel
          label={`DOSSIER #${application.id.slice(0, 6).toUpperCase()}`}
          dotColor={sc.dot}
          textColor={sc.text}
        />
        <View style={styles.top}>
          <View style={styles.header}>
            <View style={[styles.avatar, { backgroundColor: sc.bg }]}>
              <Text style={[styles.avatarText, { color: sc.text }]}>{application.company.charAt(0)}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.company} numberOfLines={1}>{application.company}</Text>
              <Text style={styles.jobTitle} numberOfLines={1}>{application.jobTitle}</Text>
            </View>
          </View>
          <StatusBadge status={application.applicationStatus} size="sm" />
        </View>
        <View style={styles.meta}>
          {application.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{application.location}</Text>
            </View>
          )}
          {application.salaryMin && (
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={12} color={colors.onSurfaceVariant} />
              <Text style={styles.metaText}>${application.salaryMin.toLocaleString()}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{new Date(application.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  )
}

export { ApplicationCard }

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    top: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
    },
    header: {
      flexDirection: 'row',
      gap: 14,
      flex: 1,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: Typography.title.lg,
      fontFamily: Fonts.headline,
      fontWeight: '800',
    },
    info: {
      flex: 1,
      gap: 3,
    },
    company: {
      fontSize: Typography.title.lg,
      fontFamily: Fonts.headline,
      fontWeight: '800',
      color: c.onSurface,
      letterSpacing: -0.3,
    },
    jobTitle: {
      fontSize: Typography.body.sm,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
      fontWeight: '500',
    },
    meta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metaText: {
      fontSize: Typography.label.md,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
      fontWeight: '500',
    },
  })
}
