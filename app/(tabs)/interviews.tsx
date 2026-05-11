import { useState, useCallback, useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { format, parseISO } from 'date-fns'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { StaggeredList } from '@/components/shared/StaggeredList'
import { useUpcomingInterviews } from '@/features/applications/api/useApplicationDetails'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { openInGoogleCalendar } from '@/lib/calendar'

interface UpcomingInterview {
  id: string
  applicationId: string
  roundType: string
  scheduledAt: string
  interviewerName: string | null
  notes: string | null
  outcome: string | null
  company: string
  jobTitle: string
}

const ROUND_TYPE_LABELS: Record<string, string> = {
  PHONE_SCREEN: 'Phone Screen',
  TECHNICAL: 'Technical',
  SYSTEM_DESIGN: 'System Design',
  BEHAVIORAL: 'Behavioral',
  FINAL: 'Final',
  OTHER: 'Other',
}

export default function InterviewsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { data: interviews, isLoading, refetch, isRefetching } = useUpcomingInterviews()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sorted = useMemo(() =>
    [...(interviews || [])].sort(
      (a: UpcomingInterview, b: UpcomingInterview) =>
        parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime()
    ),
    [interviews]
  )

  const handleAddToCalendar = useCallback((interview: UpcomingInterview) => {
    openInGoogleCalendar({
      title: `${interview.roundType} - ${interview.company}`,
      date: interview.scheduledAt,
      description: interview.notes ?? undefined,
    })
  }, [])

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerDateBadge}>
            <Text style={styles.headerDateDay}>{new Date().getDate()}</Text>
            <Text style={styles.headerDateMonth}>{new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Interviews</Text>
            <Text style={styles.headerSub}>{sorted.length} upcoming round{sorted.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.light.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : sorted.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={32} color={Colors.light.onSurfaceVariant} />
            </View>
            <Text style={styles.emptyTitle}>No upcoming interviews</Text>
            <Text style={styles.emptyDesc}>
              Schedule interviews within your applications to see them here.
            </Text>
            <Button variant="outline" onPress={() => router.push('/(tabs)/applications' as any)}>
              View Applications
            </Button>
          </View>
        ) : (
          <StaggeredList staggerDelay={60} initialDelay={80} direction="up">
            {sorted.map((interview: UpcomingInterview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                expandedId={expandedId}
                onToggle={handleToggle}
                onAddToCalendar={handleAddToCalendar}
              />
            ))}
          </StaggeredList>
        )}
      </ScrollView>
    </View>
  )
}

function InterviewCard({
  interview,
  expandedId,
  onToggle,
  onAddToCalendar,
}: {
  interview: UpcomingInterview
  expandedId: string | null
  onToggle: (id: string) => void
  onAddToCalendar: (interview: UpcomingInterview) => void
}) {
  const router = useRouter()
  const date = parseISO(interview.scheduledAt)
  const isExpanded = expandedId === interview.id

  return (
    <View style={{ marginBottom: 12 }}>
      <Pressable
        onPress={() => onToggle(interview.id)}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
      >
        <View style={styles.dateSection}>
          <Text style={styles.dateDay}>{format(date, 'EEE')}</Text>
          <Text style={styles.dateNum}>{format(date, 'dd')}</Text>
          <Text style={styles.dateMonth}>{format(date, 'MMM')}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <View style={styles.companySection}>
              <View style={styles.companyIcon}>
                <Ionicons name="briefcase-outline" size={16} color={Colors.light.onSurfaceVariant} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>{interview.company}</Text>
                <Text style={styles.jobTitle}>{interview.jobTitle}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={Colors.light.accent} />
              <Text style={styles.metaText}>{format(date, 'h:mm a')}</Text>
            </View>
            <Badge variant="accent" textStyle={{ fontSize: 9, letterSpacing: 1 }}>
              {ROUND_TYPE_LABELS[interview.roundType] || interview.roundType}
            </Badge>
          </View>

          {isExpanded && (
            <View style={styles.expanded}>
              {interview.interviewerName && (
                <View style={styles.expandedRow}>
                  <Ionicons name="person-outline" size={14} color={Colors.light.onSurfaceVariant} />
                  <Text style={styles.expandedText}>{interview.interviewerName}</Text>
                </View>
              )}
              {interview.notes && (
                <View style={styles.expandedRow}>
                  <Ionicons name="document-text-outline" size={14} color={Colors.light.onSurfaceVariant} />
                  <Text style={styles.expandedText}>{interview.notes}</Text>
                </View>
              )}
              <View style={styles.expandedActions}>
                <Button size="sm" onPress={() => onAddToCalendar(interview)}>
                  Add to Calendar
                </Button>
                <Button size="sm" variant="outline" onPress={() => router.push(`/(tabs)/applications/${interview.applicationId}` as any)}>
                  View App
                </Button>
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerDateBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDateDay: {
    fontSize: Typography.title.lg,
    fontWeight: '800',
    fontFamily: Fonts.headline,
    color: Colors.light.onPrimary,
    lineHeight: 20,
    marginTop: -2,
  },
  headerDateMonth: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    fontFamily: Fonts.body,
    color: Colors.light.onPrimary,
    letterSpacing: 1.5,
    marginTop: -1,
  },
  headerTitle: {
    fontSize: Typography.headline.sm,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: Colors.light.onSurface,
  },
  headerSub: {
    fontSize: Typography.label.lg,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 100,
  },
  loadingWrap: {
    padding: 48,
    alignItems: 'center',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 12,
    minHeight: 300,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: Typography.headline.sm,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: Colors.light.onSurface,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    overflow: 'hidden',
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  dateSection: {
    width: 76,
    backgroundColor: Colors.light.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 2,
    borderRightWidth: 1,
    borderRightColor: Colors.light.outlineVariant,
  },
  dateDay: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    fontFamily: Fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.light.onSurfaceVariant,
  },
  dateNum: {
    fontSize: Typography.headline.md,
    fontWeight: '800',
    fontFamily: Fonts.headline,
    color: Colors.light.onSurface,
    lineHeight: 28,
  },
  dateMonth: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    fontFamily: Fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: Colors.light.accent,
  },
  cardBody: {
    flex: 1,
    padding: 14,
    gap: 10,
  },
  cardTop: {},
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  companyIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.light.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyName: {
    fontSize: Typography.title.sm,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: Colors.light.onSurface,
  },
  jobTitle: {
    fontSize: Typography.label.md,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    fontWeight: '500',
  },
  expanded: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.outlineVariant,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandedText: {
    fontSize: Typography.label.md,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    flex: 1,
  },
  expandedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
})
