import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { Spinner } from '@/components/ui/spinner'

const STATUS_LABELS: Record<string, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone Screen',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  CLOSED: 'Closed',
}

interface StatusHistoryItem {
  id: string
  fromStatus: string | null
  toStatus: string
  note: string | null
  changedAt: string
}

interface StatusHistoryTimelineProps {
  items: StatusHistoryItem[]
  isLoading?: boolean
}

function StatusHistoryTimeline({ items, isLoading }: StatusHistoryTimelineProps) {
  if (isLoading) return <Spinner />

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={16} color={Colors.light.primary} />
        <Text style={styles.title}>Status History</Text>
      </View>

      {items.length > 0 ? (
        <View>
          {items.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.line}>
                <View style={[styles.dot, index === 0 && styles.dotActive]} />
                {index < items.length - 1 && <View style={styles.connector} />}
              </View>
              <View style={styles.card}>
                <View style={styles.changeRow}>
                  {item.fromStatus ? (
                    <>
                      <Text style={styles.statusText}>{STATUS_LABELS[item.fromStatus] || item.fromStatus}</Text>
                      <Text style={styles.arrow}>→</Text>
                    </>
                  ) : (
                    <Text style={styles.statusLabel}>Initial: </Text>
                  )}
                  <Text style={styles.statusText}>{STATUS_LABELS[item.toStatus] || item.toStatus}</Text>
                </View>
                <Text style={styles.date}>{new Date(item.changedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</Text>
                {item.note && <Text style={styles.note}>{item.note}</Text>}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={32} color={Colors.light.onSurfaceVariant} />
          <Text style={styles.emptyText}>No status history yet</Text>
          <Text style={styles.emptySubtext}>Status changes will appear here as they happen</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: Colors.light.outline, paddingBottom: 12 },
  title: { fontSize: Typography.label.lg, fontFamily: Fonts.headline, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.light.onSurface },
  timelineItem: { flexDirection: 'row', gap: 12 },
  line: { alignItems: 'center', width: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.light.outline, borderWidth: 2, borderColor: Colors.light.surface, marginTop: 4 },
  dotActive: { backgroundColor: Colors.light.primary },
  connector: { width: 2, flex: 1, backgroundColor: Colors.light.outline, marginVertical: 2 },
  card: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.outline, backgroundColor: Colors.light.surface, marginBottom: 8 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: Typography.body.sm, fontFamily: Fonts.body, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.light.onSurface },
  statusLabel: { fontSize: Typography.body.sm, fontFamily: Fonts.body, color: Colors.light.onSurfaceVariant },
  arrow: { fontSize: Typography.body.sm, fontFamily: Fonts.body, color: Colors.light.onSurfaceVariant },
  date: { fontSize: Typography.label.sm, fontFamily: Fonts.body, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.light.onSurfaceVariant, marginTop: 4 },
  note: { fontSize: Typography.body.sm, fontFamily: Fonts.body, color: Colors.light.onSurfaceVariant, marginTop: 4 },
  empty: { alignItems: 'center', padding: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.light.outline, borderRadius: 12, gap: 4 },
  emptyText: { fontSize: Typography.body.sm, fontFamily: Fonts.body, color: Colors.light.onSurfaceVariant },
  emptySubtext: { fontSize: Typography.label.md, fontFamily: Fonts.body, color: Colors.light.onSurfaceVariant },
})

export { StatusHistoryTimeline }
