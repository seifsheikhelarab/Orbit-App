import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts, getShadows } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { useAnalyticsSummary, useApplicationsOverTime, usePipelineFunnel, useRecentActivity } from '@/features/dashboard/api/useAnalytics'
import { FeatureTip } from '@/components/onboarding/FeatureTip'
import { useFeatureTip } from '@/hooks/useOnboarding'
import { useAnimatedCounter, formatCounter } from '@/hooks/useAnimatedCounter'
import { STATUS_DASHBOARD_COLORS, type ApplicationStatus } from '@/lib/status'
import { EmptyState } from '@/components/shared/EmptyState'
import { ApiError } from '@/components/shared/ApiError'
import { FAB } from '@/components/shared/FAB'
import { CartesianChart, Bar } from 'victory-native'
import {
  createSectionRevealValues,
  animateSectionReveal,
  sectionRevealStyle,
  AnimationTiming,
} from '@/constants/animations'

type Period = '7d' | '30d' | '90d' | 'all'

const periods: { key: Period; label: string }[] = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: 'all', label: 'ALL' },
]

function HeroStat({ value, label, trend, direction, icon }: {
  value: number; label: string; trend?: number; direction?: 'up' | 'down'; icon: keyof typeof Ionicons.glyphMap
}) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const animated = useAnimatedCounter(value, { duration: 1200 })
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTop}>
        <View style={styles.heroLabelRow}>
          <View style={styles.heroIconWrap}>
            <Ionicons name={icon} size={22} color={colors.accent} />
          </View>
          <Text style={styles.heroLabel}>{label}</Text>
        </View>
        {trend !== undefined && direction && (
          <View style={[styles.heroTrend, { backgroundColor: direction === 'up' ? colors.successContainer : colors.errorContainer }]}>
            <Ionicons name={direction === 'up' ? 'arrow-up' : 'arrow-down'} size={12} color={direction === 'up' ? colors.success : colors.error} />
            <Text style={[styles.heroTrendText, { color: direction === 'up' ? colors.success : colors.error }]}>{trend}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.heroValue}>{formatCounter(animated)}</Text>
    </View>
  )
}

function CompactStat({ value, label, accent }: { value: number; label: string; accent: string }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const animated = useAnimatedCounter(value, { duration: 1000, decimals: 1 })
  return (
    <View style={[styles.compactCard, { borderLeftColor: accent }]}>
      <Text style={styles.compactValue}>{formatCounter(animated, { decimals: 1, suffix: '%' })}</Text>
      <Text style={styles.compactLabel}>{label}</Text>
    </View>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function statusLabel(s: string) {
  const labels: Record<string, string> = {
    SAVED: 'Saved', APPLIED: 'Applied', PHONE_SCREEN: 'Phone Screen',
    INTERVIEW: 'Interview', OFFER: 'Offer', CLOSED: 'Closed',
  }
  return labels[s] || s
}

const funnelOrder = ['APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER'] as const

function FunnelRow({ item, maxFunnel }: { item: { status: string; count: number; color: string }; maxFunnel: number }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const widthPercent = (item.count / maxFunnel) * 100
  return (
    <View style={styles.funnelRow}>
      <View style={styles.funnelLabelWrap}>
        <View style={[styles.funnelDot, { backgroundColor: item.color }]} />
        <Text style={styles.funnelLabel}>{item.status}</Text>
      </View>
      <View style={styles.funnelBarTrack}>
        <View style={[styles.funnelBar, { width: `${Math.max(widthPercent, 4)}%`, backgroundColor: item.color }]}>
          <Text style={styles.funnelBarText}>{Math.round(widthPercent)}%</Text>
        </View>
      </View>
      <Text style={styles.funnelCount}>{item.count}</Text>
    </View>
  )
}

const ActivityItem = React.memo(function ActivityItem({ item, showBorder }: { item: any; showBorder: boolean }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <View style={[styles.activityItem, showBorder && styles.activityItemBorder]}>
      <View style={[styles.activityDot, { backgroundColor: STATUS_DASHBOARD_COLORS[item.toStatus as ApplicationStatus] ?? colors.accent }]} />
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle} numberOfLines={1}>{item.company}</Text>
        <Text style={styles.activitySubtitle} numberOfLines={1}>
          {item.fromStatus ? `${statusLabel(item.fromStatus)} → ${statusLabel(item.toStatus)}` : statusLabel(item.toStatus)}
        </Text>
        <Text style={styles.activityDate}>{formatDate(item.changedAt)}</Text>
      </View>
    </View>
  )
})

function CollapsibleSection({ title, icon, defaultOpen, children }: {
  title: string; icon: keyof typeof Ionicons.glyphMap; defaultOpen?: boolean; children: React.ReactNode
}) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const [open, setOpen] = useState(defaultOpen ?? false)
  return (
    <View>
      <Pressable onPress={() => setOpen(!open)} style={styles.sectionHeader} accessibilityRole="button">
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
          <Ionicons name={icon} size={16} color={colors.accent} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.onSurfaceVariant} />
      </Pressable>
      {open && <View style={{ marginTop: 12 }}>{children}</View>}
    </View>
  )
}

export default function DashboardScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const [period, setPeriod] = useState<Period>('30d')
  const [refreshing, setRefreshing] = useState(false)
  const dashTip = useFeatureTip('dashboard')

  const summary = useAnalyticsSummary(period)
  const overTime = useApplicationsOverTime(period)
  const pipeline = usePipelineFunnel(period)
  const activity = useRecentActivity()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([summary.refetch(), overTime.refetch(), pipeline.refetch(), activity.refetch()])
    setRefreshing(false)
  }, [])

  const handlePeriodChange = useCallback((key: Period) => setPeriod(key), [])

  const isLoading = summary.isLoading || pipeline.isLoading || overTime.isLoading || activity.isLoading
  const hasError = (summary.isError || pipeline.isError || overTime.isError || activity.isError) && !isLoading

  const s = summary.data
  const funnelData = useMemo(() =>
    funnelOrder
      .map((status) => ({
        status: statusLabel(status),
        count: pipeline.data?.find((p: any) => p.status === status)?.count ?? 0,
        color: STATUS_DASHBOARD_COLORS[status as ApplicationStatus],
      }))
      .filter(d => d.count > 0),
    [pipeline.data]
  )
  const maxFunnel = useMemo(() => Math.max(...funnelData.map(d => d.count), 1), [funnelData])

  const chartData = useMemo(() =>
    (overTime.data ?? []).map((d: any) => ({ period: d.period?.slice(5) ?? '', count: d.count })) as any[],
    [overTime.data]
  )

  const reduceMotion = useReduceMotion()
  const reveal = useRef(createSectionRevealValues(6)).current

  useEffect(() => {
    animateSectionReveal(reveal.opacities, reveal.scales, reveal.translates, reduceMotion)
  }, [reduceMotion])

  function sectionStyle(index: number) {
    return sectionRevealStyle(reveal.opacities[index], reveal.scales[index], reveal.translates[index])
  }

  const styles = useMemo(() => getStyles(colors), [colors])

  const isEmpty = !isLoading && !hasError && summary.data?.totalApplications === 0

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <PageHeader icon="grid-outline" iconVariant="accent" title="Mission Dashboard" subtitle={`${period} outlook`} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={{ height: 160, borderRadius: 24, backgroundColor: colors.surfaceContainer, marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, height: 100, borderRadius: 20, backgroundColor: colors.surfaceContainer }} />
            <View style={{ flex: 1, height: 100, borderRadius: 20, backgroundColor: colors.surfaceContainer }} />
          </View>
        </ScrollView>
      </View>
    )
  }

  if (hasError) {
    // Find the first meaningful error message across all queries
    const allErrors = [summary.error, pipeline.error, overTime.error, activity.error]
      .filter(Boolean) as (Error & { userMessage?: string })[]
    const errorMessage = allErrors.find(e => e.userMessage)?.userMessage
      ?? allErrors.find(e => e.message)?.message
      ?? 'Something went wrong'
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <PageHeader icon="grid-outline" iconVariant="accent" title="Mission Dashboard" subtitle={`${period} outlook`} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <ApiError message={errorMessage} onRetry={onRefresh} fullScreen />
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PageHeader
        icon="grid-outline"
        iconVariant="accent"
        title="Mission Dashboard"
        subtitle={`${period} outlook`}
      />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.periodPillRow}>
          {periods.map(p => (
            <Pressable
              key={p.key}
              style={[styles.periodPill, period === p.key && styles.periodPillActive]}
              onPress={() => handlePeriodChange(p.key)}
              accessibilityRole="button"
            >
              <Text style={[styles.periodPillText, period === p.key && styles.periodPillTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {isEmpty ? (
          <EmptyState icon="applications" title="No data yet" description="Start adding job applications to see your dashboard come to life." />
        ) : (
          <>
            {dashTip.visible && (
              <FeatureTip visible={dashTip.visible} onDismiss={dashTip.dismiss} icon="speedometer-outline"
                title="Your mission dashboard" description="Pipeline stats, funnel, and activity — your job search at a glance." />
            )}

            <Animated.View style={sectionStyle(0)}>
              <HeroStat
                value={s?.activePipeline ?? 0}
                label="ACTIVE PIPELINE"
                trend={s?.activeTrend} direction={s?.activeTrendDirection as any}
                icon="funnel"
              />
            </Animated.View>

            <Animated.View style={[styles.statsRow, sectionStyle(1)]}>
              <CompactStat value={s?.responseRate ?? 0} label="RESPONSE RATE" accent={colors.statusPhoneScreen} />
              <CompactStat value={s?.offerRate ?? 0} label="OFFER RATE" accent={colors.statusOffer} />
              <View style={styles.miniStat}>
                <Text style={styles.miniStatValue}>{s?.totalApplications ?? 0}</Text>
                <Text style={styles.miniStatLabel}>APPLIED</Text>
              </View>
            </Animated.View>

            <Animated.View style={sectionStyle(2)}>
              <CollapsibleSection title="Pipeline Flow" icon="git-branch-outline" defaultOpen>
                <Card>
                  <CardContent>
                    {funnelData.length > 0 ? (
                      funnelData.map((item) => (
                        <FunnelRow key={item.status} item={item} maxFunnel={maxFunnel} />
                      ))
                    ) : (
                      <Text style={styles.emptySmall}>No pipeline data for this period</Text>
                    )}
                  </CardContent>
                </Card>
              </CollapsibleSection>
            </Animated.View>

            <Animated.View style={sectionStyle(3)}>
              <CollapsibleSection title="Trend" icon="trending-up-outline">
                {chartData.length > 0 ? (
                  <Card>
                    <CardContent>
                      <View style={{ height: 200 }}>
                        <CartesianChart data={chartData} xKey="period" yKeys={["count"]}
                          xAxis={{ labelColor: colors.onSurfaceVariant, lineColor: colors.outlineVariant, tickCount: Math.min(chartData.length, 6) }}
                          yAxis={[{ labelColor: colors.onSurfaceVariant, lineColor: colors.outlineVariant, tickCount: 5 }]}
                          frame={{ lineColor: colors.outlineVariant, lineWidth: 1 }}
                          domainPadding={{ left: 20, right: 20 }}
                        >
                          {({ points, chartBounds }: any) => (
                            <Bar points={points.count} chartBounds={chartBounds} color={colors.accent}
                              roundedCorners={{ topLeft: 4, topRight: 4 }} animate={{ type: "timing", duration: 300 }} />
                          )}
                        </CartesianChart>
                      </View>
                    </CardContent>
                  </Card>
                ) : null}
              </CollapsibleSection>
            </Animated.View>

            <Animated.View style={sectionStyle(4)}>
              <CollapsibleSection title="Recent Activity" icon="time-outline">
                <Card>
                  <CardContent>
                    {(!activity.data || activity.data.length === 0) ? (
                      <View style={styles.activityEmpty}>
                        <Ionicons name="time-outline" size={24} color={colors.onSurfaceVariant} />
                        <Text style={styles.activityEmptyText}>No recent activity</Text>
                      </View>
                    ) : (
                      activity.data.map((item: any, idx: number) => (
                        <ActivityItem key={item.id} item={item} showBorder={idx < activity.data.length - 1} />
                      ))
                    )}
                  </CardContent>
                </Card>
              </CollapsibleSection>
            </Animated.View>
          </>
        )}
      </ScrollView>

      <FAB onPress={() => router.push('/(tabs)/applications/new' as const)} accessibilityLabel="Add Application" />
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  const s = getShadows(c)
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 16, paddingBottom: 100 },
    emptyContainer: { flex: 1, backgroundColor: c.background, justifyContent: 'center' },
    emptySmall: { fontSize: Typography.body.sm, color: c.onSurfaceVariant, fontFamily: Fonts.body, textAlign: 'center', padding: 16 },

    periodPillRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
    periodPill: {
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100,
      backgroundColor: c.surfaceContainer,
      borderWidth: 1, borderColor: c.outlineVariant,
    },
    periodPillActive: { backgroundColor: c.primary, borderColor: c.primary, ...s.sm },
    periodPillText: { fontSize: Typography.label.sm, fontWeight: '700', color: c.onSurfaceVariant, fontFamily: Fonts.body, letterSpacing: 0.5 },
    periodPillTextActive: { color: c.onPrimary },

    sectionAccent: { width: 4, height: 20, borderRadius: 2 },
    sectionHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 4,
    },
    sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionTitle: { fontSize: Typography.title.sm, fontWeight: '700', color: c.onSurface, fontFamily: Fonts.headline },

    heroCard: {
      backgroundColor: c.surface,
      borderRadius: 32, padding: 24,
      borderLeftWidth: 4, borderLeftColor: c.accent,
      ...s.lg,
      gap: 8,
    },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    heroIconWrap: {
      width: 44, height: 44, borderRadius: 14,
      backgroundColor: c.accentContainer,
      alignItems: 'center', justifyContent: 'center',
    },

    heroTrend: {
      flexDirection: 'row', alignItems: 'center', gap: 3,
      paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    },
    heroTrendText: { fontSize: Typography.label.sm, fontWeight: '700', fontFamily: Fonts.body },
    heroValue: {
      fontSize: Typography.display.sm, fontWeight: '800',
      color: c.onSurface, fontFamily: Fonts.headline,
      letterSpacing: -2, lineHeight: 44,
    },
    heroLabel: {
      fontSize: Typography.label.md, fontWeight: '600',
      color: c.onSurfaceVariant, fontFamily: Fonts.body,
      letterSpacing: 1,
    },

    statsRow: { flexDirection: 'row', gap: 10 },
    compactCard: {
      flex: 1, backgroundColor: c.surface,
      borderRadius: 20, padding: 18,
      borderLeftWidth: 3,
      ...s.sm,
      gap: 4,
    },
    compactValue: {
      fontSize: Typography.headline.lg, fontWeight: '800',
      color: c.onSurface, fontFamily: Fonts.headline,
      letterSpacing: -1,
    },
    compactLabel: {
      fontSize: Typography.label.sm, fontWeight: '600',
      color: c.onSurfaceVariant, fontFamily: Fonts.body,
      letterSpacing: 0.5,
    },
    miniStat: {
      width: 72, justifyContent: 'center', alignItems: 'center',
      backgroundColor: c.surfaceContainer,
      borderRadius: 16, padding: 12,
      gap: 2,
    },
    miniStatValue: {
      fontSize: Typography.title.md, fontWeight: '800',
      color: c.onSurface, fontFamily: Fonts.headline,
    },
    miniStatLabel: {
      fontSize: 9, fontWeight: '700',
      color: c.onSurfaceVariant, fontFamily: Fonts.body,
      letterSpacing: 0.5,
    },

    funnelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    funnelLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 100 },
    funnelDot: { width: 8, height: 8, borderRadius: 4 },
    funnelLabel: {
      fontSize: Typography.label.md, fontWeight: '600',
      color: c.onSurface, fontFamily: Fonts.body,
    },
    funnelBarTrack: { flex: 1, height: 26, backgroundColor: c.surfaceContainer, borderRadius: 100, overflow: 'hidden' },
    funnelBar: { height: '100%', borderRadius: 100, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 8 },
    funnelBarText: { fontSize: 10, fontWeight: '700', color: c.onPrimary, fontFamily: Fonts.body },
    funnelCount: {
      width: 32, fontSize: Typography.title.sm, fontWeight: '800',
      color: c.onSurface, textAlign: 'right', fontFamily: Fonts.headline,
    },

    activityEmpty: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      gap: 8, padding: 20,
    },
    activityEmptyText: { fontSize: Typography.body.sm, color: c.onSurfaceVariant, fontFamily: Fonts.body },
    activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    activityItemBorder: { borderBottomWidth: 1, borderBottomColor: c.outlineVariant },
    activityDot: { width: 10, height: 10, borderRadius: 5 },
    activityContent: { flex: 1, gap: 2 },
    activityTitle: { fontSize: Typography.title.sm, fontWeight: '600', color: c.onSurface, fontFamily: Fonts.headline },
    activitySubtitle: { fontSize: Typography.label.md, color: c.onSurfaceVariant, fontFamily: Fonts.body },
    activityDate: { fontSize: Typography.label.sm, color: c.outline, marginTop: 1, fontFamily: Fonts.body },
  })
}
