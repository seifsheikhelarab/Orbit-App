import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { type Application } from '@/features/applications/api/useApplications'
import { statusColors } from '@/lib/status'

interface ApplicationCardProps {
  application: Application
  onPress: () => void
}

function TelemetryDots() {
  return (
    <View style={styles.telemetryDots}>
      <View style={styles.telemetryDot} />
      <View style={[styles.telemetryDot, { opacity: 0.5, top: 2, right: 14 }]} />
      <View style={[styles.telemetryDot, { opacity: 0.5, top: 14, right: 2 }]} />
    </View>
  )
}

function ApplicationCard({ application, onPress }: ApplicationCardProps) {
  const sc = statusColors[application.applicationStatus]

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { borderLeftColor: sc.border, borderLeftWidth: 4 },
        pressed && {
          opacity: 0.85,
          transform: [{ scale: 0.98 }],
        },
      ]}
    >
      <TelemetryDots />
      <View style={styles.dossierRow}>
        <View style={[styles.dossierDot, { backgroundColor: sc.dot }]} />
        <Text style={[styles.dossierLabel, { color: sc.text }]}>
          DOSSIER #{application.id.slice(0, 4).toUpperCase()}
        </Text>
      </View>
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
            <Ionicons name="location-outline" size={12} color={Colors.light.onSurfaceVariant} />
            <Text style={styles.metaText}>{application.location}</Text>
          </View>
        )}
        {application.salaryMin && (
          <View style={styles.metaItem}>
            <Ionicons name="cash-outline" size={12} color={Colors.light.onSurfaceVariant} />
            <Text style={styles.metaText}>${application.salaryMin.toLocaleString()}</Text>
          </View>
        )}
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={12} color={Colors.light.onSurfaceVariant} />
          <Text style={styles.metaText}>{new Date(application.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
    </Pressable>
  )
}

export { ApplicationCard }

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderLeftWidth: 4,
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  telemetryDots: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    opacity: 0.15,
  },
  telemetryDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
  },
  dossierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dossierDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dossierLabel: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.title.md,
    fontFamily: Fonts.headline,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  company: {
    fontSize: Typography.title.md,
    fontFamily: Fonts.headline,
    fontWeight: '700',
    color: Colors.light.onSurface,
  },
  jobTitle: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.label.md,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
  },
})
