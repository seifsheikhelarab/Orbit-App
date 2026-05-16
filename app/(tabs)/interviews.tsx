import { useState, useCallback, useMemo, useRef } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { format, parseISO } from 'date-fns'
import { Colors, Typography, Fonts, getShadows } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { StaggeredList } from '@/components/shared/StaggeredList'
import { ApiError } from '@/components/shared/ApiError'
import { useUpcomingInterviews } from '@/features/applications/api/useApplicationDetails'
import { FeatureTip } from '@/components/onboarding/FeatureTip'
import { useFeatureTip } from '@/hooks/useOnboarding'
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
  PHONE_SCREEN: 'PHONE SCREEN',
  TECHNICAL: 'TECHNICAL',
  SYSTEM_DESIGN: 'SYSTEM DESIGN',
  BEHAVIORAL: 'BEHAVIORAL',
  FINAL: 'FINAL',
  OTHER: 'OTHER',
}

export default function InterviewsScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { data: interviews, isLoading, isError, error, refetch, isRefetching } = useUpcomingInterviews()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const interviewTip = useFeatureTip('interviews')

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

  const styles = useMemo(() => getStyles(colors), [colors])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PageHeader
        icon="calendar-outline"
        iconVariant="accent"
        title="Interviews"
        subtitle={`${sorted.length} upcoming round${sorted.length !== 1 ? 's' : ''}`}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {!isLoading && sorted.length > 0 && interviewTip.visible && (
          <FeatureTip
            visible={interviewTip.visible}
            onDismiss={interviewTip.dismiss}
            icon="calendar-outline"
            title="Interview log"
            description="Tap any upcoming round to see details — interviewer, notes, and add to calendar."
          />
        )}
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <ApiError message={(error as any)?.userMessage || (error as any)?.message} onRetry={() => refetch()} fullScreen />
        ) : sorted.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="calendar-outline" size={36} color={colors.onSurfaceVariant} />
            </View>
            <Text style={styles.emptyTitle}>No upcoming interviews</Text>
            <Text style={styles.emptyDesc}>
              Schedule interviews within your applications to see them here.
            </Text>
            <Button variant="outline" onPress={() => router.push('/(tabs)/applications' as const)}>
              View Applications
            </Button>
          </View>
        ) : (
          <StaggeredList staggerDelay={70} initialDelay={100} direction="up" style={{ gap: 12 }}>
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
  const colors = useColors()
  const router = useRouter()
  const date = parseISO(interview.scheduledAt)
  const isExpanded = expandedId === interview.id
  const styles = useMemo(() => getStyles(colors), [colors])

  return (
    <Pressable
      onPress={() => onToggle(interview.id)}
      style={({ pressed }) => [pressed && { opacity: 0.95 }]}
      accessibilityRole="button">
      <Card variant="telemetry" accentColor={colors.accent} dossier accentPosition="none">
        <View style={styles.cardInner}>
          <View style={styles.dateSection}>
            <Text style={styles.dateDay}>{format(date, 'EEE')}</Text>
            <Text style={styles.dateNum}>{format(date, 'dd')}</Text>
            <Text style={styles.dateMonth}>{format(date, 'MMM')}</Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.companySection}>
              <View style={styles.companyIcon}>
                <Ionicons name="briefcase-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>{interview.company}</Text>
                <Text style={styles.jobTitle}>{interview.jobTitle}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.accent} />
                <Text style={styles.metaText}>{format(date, 'h:mm a')}</Text>
              </View>
              <Badge variant="accent" textStyle={{ fontSize: 9, letterSpacing: 1.5 }}>
                {ROUND_TYPE_LABELS[interview.roundType] || interview.roundType}
              </Badge>
            </View>

            {isExpanded && (
              <View style={styles.expandedSection}>
                {interview.interviewerName && (
                  <View style={styles.expandedRow}>
                    <Ionicons name="person-outline" size={14} color={colors.onSurfaceVariant} />
                    <Text style={styles.expandedText}>{interview.interviewerName}</Text>
                  </View>
                )}
                {interview.notes && (
                  <View style={styles.expandedRow}>
                    <Ionicons name="document-text-outline" size={14} color={colors.onSurfaceVariant} />
                    <Text style={styles.expandedText}>{interview.notes}</Text>
                  </View>
                )}
                <View style={styles.expandedActions}>
                  <Button size="sm" onPress={() => onAddToCalendar(interview)}>Add to Calendar</Button>
                  <Button size="sm" variant="outline" onPress={() => router.push(`/(tabs)/applications/${interview.applicationId}` as const)}>
                    View App
                  </Button>
                </View>
              </View>
            )}
          </View>
        </View>
      </Card>
    </Pressable>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, gap: 16, paddingBottom: 100 },
    loadingWrap: { padding: 48, alignItems: 'center' },
    emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: 48, gap: 12, minHeight: 300 },
    emptyIconWrap: {
      width: 88, height: 88, borderRadius: 20,
      backgroundColor: c.surfaceContainerHigh,
      alignItems: 'center', justifyContent: 'center',
    },
    emptyTitle: {
      fontSize: Typography.headline.sm, fontWeight: '700',
      fontFamily: Fonts.headline, color: c.onSurface,
      textAlign: 'center',
    },
    emptyDesc: {
      fontSize: Typography.body.sm, fontFamily: Fonts.body,
      color: c.onSurfaceVariant, textAlign: 'center', maxWidth: 300,
    },
    cardInner: {
      flexDirection: 'row',
    },
    dateSection: {
      width: 80,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 2,
    },
    dateDay: {
      fontSize: Typography.label.sm, fontWeight: '700',
      fontFamily: Fonts.body, textTransform: 'uppercase',
      letterSpacing: 1.2, color: c.onSurfaceVariant,
    },
    dateNum: {
      fontSize: Typography.headline.md, fontWeight: '800',
      fontFamily: Fonts.headline, color: c.onSurface,
      lineHeight: 30,
    },
    dateMonth: {
      fontSize: Typography.label.sm, fontWeight: '700',
      fontFamily: Fonts.body, textTransform: 'uppercase',
      letterSpacing: 1.2, color: c.accent,
    },
    cardBody: { flex: 1, padding: 14, gap: 10, marginLeft: 0 },
    companySection: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    companyIcon: {
      width: 38, height: 38, borderRadius: 10,
      backgroundColor: c.accentContainer,
      alignItems: 'center', justifyContent: 'center',
    },
    companyName: {
      fontSize: Typography.title.sm, fontWeight: '700',
      fontFamily: Fonts.headline, color: c.onSurface,
    },
    jobTitle: {
      fontSize: Typography.label.md, fontFamily: Fonts.body,
      color: c.onSurfaceVariant, fontWeight: '500', marginTop: 1,
    },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: {
      fontSize: Typography.label.sm, fontFamily: Fonts.body,
      color: c.onSurfaceVariant, fontWeight: '600',
    },
    expandedSection: {
      gap: 8, paddingTop: 10,
      borderTopWidth: 1, borderTopColor: c.outlineVariant,
    },
    expandedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    expandedText: {
      fontSize: Typography.label.md, fontFamily: Fonts.body,
      color: c.onSurfaceVariant, flex: 1,
    },
    expandedActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  })
}
