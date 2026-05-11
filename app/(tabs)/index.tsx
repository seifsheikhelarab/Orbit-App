import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl, ActivityIndicator, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useAnalyticsSummary, useApplicationsOverTime, usePipelineFunnel, useRecentActivity } from '@/features/dashboard/api/useAnalytics'
import { useAnimatedCounter, formatCounter } from '@/hooks/useAnimatedCounter'
import { STATUS_DASHBOARD_COLORS, type ApplicationStatus } from '@/lib/status'
import { EmptyState } from '@/components/shared/EmptyState'
import { CartesianChart, Bar } from 'victory-native'

type Period = '7d' | '30d' | '90d'

const periods: { key: Period; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
]

function StatCard({
  title,
  value,
  valueStr,
  trend,
  direction,
  icon,
  accent,
}: {
  title: string
  value: number
  valueStr: string
  trend?: number
  direction?: 'up' | 'down' | 'neutral'
  icon: keyof typeof Ionicons.glyphMap
  accent: string
}) {
  const animatedValue = useAnimatedCounter(value, { duration: 1000, decimals: direction !== undefined ? 1 : 0 })

  return (
    <View style={[styles.statCard, { borderLeftColor: accent }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconWrap, { backgroundColor: accent + '15' }]}>
          <Ionicons name={icon} size={16} color={accent} />
        </View>
        {trend !== undefined && direction && direction !== 'neutral' && (
          <View style={[styles.trendBadge, { backgroundColor: direction === 'up' ? Colors.light.successContainer : Colors.light.errorContainer }]}>
            <Ionicons name={direction === 'up' ? 'arrow-up' : 'arrow-down'} size={10} color={direction === 'up' ? Colors.light.success : Colors.light.error} />
            <Text style={[styles.trendText, { color: direction === 'up' ? Colors.light.success : Colors.light.error }]}>
              {trend}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{direction !== undefined ? formatCounter(animatedValue, { decimals: 1, suffix: '%' }) : formatCounter(animatedValue)}</Text>
    </View>
  )
}

function PeriodPill({ period, active, onPress }: { period: Period; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={[styles.periodPill, active && styles.periodPillActive]}
      onPress={onPress}
    >
      <Text style={[styles.periodPillText, active && styles.periodPillTextActive]}>
        {periods.find(p => p.key === period)?.label}
      </Text>
    </Pressable>
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
  const widthPercent = (item.count / maxFunnel) * 100
  return (
    <View style={styles.funnelRow}>
      <Text style={styles.funnelLabel}>{item.status}</Text>
      <View style={styles.funnelBarTrack}>
        <View style={[styles.funnelBar, { width: `${Math.max(widthPercent, 4)}%`, backgroundColor: item.color }]} />
      </View>
      <Text style={styles.funnelCount}>{item.count}</Text>
    </View>
  )
}

const ActivityItem = React.memo(function ActivityItem({ item, showBorder }: { item: any; showBorder: boolean }) {
  return (
    <View style={[styles.activityItem, showBorder && styles.activityItemBorder]}>
      <View style={[styles.activityDot, { backgroundColor: STATUS_DASHBOARD_COLORS[item.toStatus as ApplicationStatus] ?? Colors.light.outline }]} />
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {item.company}
        </Text>
        <Text style={styles.activitySubtitle} numberOfLines={1}>
          {item.fromStatus ? `${statusLabel(item.fromStatus)} → ${statusLabel(item.toStatus)}` : statusLabel(item.toStatus)}
        </Text>
        <Text style={styles.activityDate}>{formatDate(item.changedAt)}</Text>
      </View>
    </View>
  )
})

export default function DashboardScreen() {
  const insets = useSafeAreaInsets()
  const [period, setPeriod] = useState<Period>('30d')
  const [refreshing, setRefreshing] = useState(false)

  const summary = useAnalyticsSummary(period)
  const overTime = useApplicationsOverTime(period)
  const pipeline = usePipelineFunnel(period)
  const activity = useRecentActivity()

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      summary.refetch(),
      overTime.refetch(),
      pipeline.refetch(),
      activity.refetch(),
    ])
    setRefreshing(false)
  }, [])

  const handlePeriodChange = useCallback((key: Period) => {
    setPeriod(key)
  }, [])

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
    (overTime.data ?? []).map((d: any) => ({
      period: d.period?.slice(5) ?? '',
      count: d.count,
    })) as any[],
    [overTime.data]
  )

  const entrance = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current

  useEffect(() => {
    entrance.forEach((anim, i) => {
      anim.setValue(0)
      Animated.timing(anim, {
        toValue: 1,
        duration: 500 + i * 60,
        delay: i * 120,
        useNativeDriver: true,
      }).start()
    })
  }, [])

  function sectionStyle(index: number) {
    return {
      opacity: entrance[index],
      transform: [{
        translateY: entrance[index].interpolate({
          inputRange: [0, 1],
          outputRange: [20 - index * 4, 0],
        }),
      }],
    }
  }

  const isLoading = summary.isLoading || pipeline.isLoading || overTime.isLoading || activity.isLoading
  const isEmpty = !isLoading && summary.data?.totalApplications === 0

  if (isLoading) {
    return (
      <ScrollView
        style={[styles.container, { paddingTop: insets.top + 16 }]}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Dashboard</Text>
        </View>
        <View style={styles.statsGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.statCard, { borderLeftColor: Colors.light.outlineVariant, gap: 10 }]}>
              <View style={[styles.statIconWrap, { backgroundColor: Colors.light.surfaceContainer, width: 32, height: 32, borderRadius: 10 }]} />
              <View style={{ height: 12, width: '60%', borderRadius: 4, backgroundColor: Colors.light.surfaceContainer }} />
              <View style={{ height: 28, width: '40%', borderRadius: 6, backgroundColor: Colors.light.surfaceContainer }} />
            </View>
          ))}
        </View>
        <View style={[styles.chartCard, { height: 160, gap: 12 }]}>
          <View style={{ height: 16, width: '50%', borderRadius: 4, backgroundColor: Colors.light.surfaceContainer }} />
          <View style={{ flex: 1, borderRadius: 8, backgroundColor: Colors.light.surfaceContainer }} />
        </View>
        <View style={[styles.chartCard, { height: 200, gap: 12 }]}>
          <View style={{ height: 16, width: '40%', borderRadius: 4, backgroundColor: Colors.light.surfaceContainer }} />
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ height: 12, width: `${80 - i * 15}%`, borderRadius: 4, backgroundColor: Colors.light.surfaceContainer }} />
          ))}
        </View>
      </ScrollView>
    )
  }

  if (isEmpty) {
    return (
      <ScrollView contentContainerStyle={styles.emptyContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <EmptyState
          icon="applications"
          title="No data yet"
          description="Start adding job applications to see your dashboard come to life."
        />
      </ScrollView>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Dashboard</Text>
      </View>

      <Animated.View style={sectionStyle(0)}>
      <View style={styles.periodRow}>
        {periods.map(p => (
          <PeriodPill key={p.key} period={p.key} active={period === p.key} onPress={() => handlePeriodChange(p.key)} />
        ))}
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Applied"
          value={s?.totalApplications ?? 0}
          valueStr={String(s?.totalApplications ?? 0)}
          trend={s?.totalApplicationsTrend}
          direction={s?.totalApplicationsTrendDirection}
          icon="send"
          accent={Colors.light.primary}
        />
        <StatCard
          title="Active Pipeline"
          value={s?.activePipeline ?? 0}
          valueStr={String(s?.activePipeline ?? 0)}
          trend={s?.activeTrend}
          direction={s?.activeTrendDirection}
          icon="funnel"
          accent={Colors.light.accent}
        />
        <StatCard
          title="Response Rate"
          value={s?.responseRate ?? 0}
          valueStr={`${s?.responseRate ?? 0}%`}
          trend={s?.responseRateTrend}
          direction={s?.responseRateTrendDirection}
          icon="chatbubble-ellipses"
          accent={Colors.light.statusPhoneScreen}
        />
        <StatCard
          title="Offer Rate"
          value={s?.offerRate ?? 0}
          valueStr={`${s?.offerRate ?? 0}%`}
          trend={s?.offerRateTrend}
          direction={s?.offerRateTrendDirection}
          icon="trophy"
          accent={Colors.light.statusOffer}
        />
      </View>
      </Animated.View>

      <Animated.View style={sectionStyle(1)}>
      {funnelData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pipeline Funnel</Text>
          <View style={styles.chartCard}>
            <View style={styles.funnelContainer}>
              {funnelData.map((item) => (
                <FunnelRow key={item.status} item={item} maxFunnel={maxFunnel} />
              ))}
            </View>
          </View>
        </View>
      )}
      </Animated.View>

      <Animated.View style={sectionStyle(2)}>
      {chartData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applications Over Time</Text>
          <View style={styles.chartCard}>
            <View style={{ height: 220 }}>
              {/* @ts-ignore - victory-native v41 CartesianChart generics */}
              <CartesianChart
                data={chartData}
                xKey="period"
                yKeys={["count"]}
                xAxis={{
                  labelColor: Colors.light.onSurfaceVariant,
                  lineColor: Colors.light.outlineVariant,
                  tickCount: Math.min(chartData.length, 6),
                }}
                yAxis={[{
                  labelColor: Colors.light.onSurfaceVariant,
                  lineColor: Colors.light.outlineVariant,
                  tickCount: 5,
                }]}
                frame={{ lineColor: Colors.light.outlineVariant, lineWidth: 1 }}
                domainPadding={{ left: 20, right: 20 }}
              >
                {({ points, chartBounds }: any) => (
                  <Bar 
                    points={points.count} 
                    chartBounds={chartBounds}
                    color={Colors.light.accent}
                    roundedCorners={{ topLeft: 4, topRight: 4 }}
                    animate={{ type: "timing", duration: 300 }}
                  />
                )}
              </CartesianChart>
            </View>
          </View>
        </View>
      )}
      </Animated.View>

      <Animated.View style={sectionStyle(3)}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {(!activity.data || activity.data.length === 0) ? (
            <View style={styles.activityEmpty}>
              <Ionicons name="time-outline" size={24} color={Colors.light.onSurfaceVariant} />
              <Text style={styles.activityEmptyText}>No recent activity</Text>
            </View>
          ) : (
            activity.data.map((item: any, idx: number) => (
              <ActivityItem key={item.id} item={item} showBorder={idx < activity.data.length - 1} />
            ))
          )}
        </View>
      </View>
      </Animated.View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 16,
    paddingTop: 8,
    gap: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
  },
  header: {
    paddingTop: 8,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: Typography.headline.lg,
    fontWeight: '800',
    color: Colors.light.onSurface,
    fontFamily: Fonts.headline,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  periodPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceContainer,
  },
  periodPillActive: {
    backgroundColor: Colors.light.primary,
  },
  periodPillText: {
    fontSize: Typography.body.sm,
    fontWeight: '600',
    color: Colors.light.onSurfaceVariant,
    fontFamily: Fonts.body,
  },
  periodPillTextActive: {
    color: Colors.light.onPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    gap: 10,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendText: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    fontFamily: Fonts.body,
  },
  statTitle: {
    fontSize: Typography.label.md,
    fontWeight: '500',
    color: Colors.light.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: Fonts.body,
  },
  statValue: {
    fontSize: Typography.headline.lg,
    fontWeight: '800',
    color: Colors.light.onSurface,
    fontFamily: Fonts.headline,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: Typography.title.md,
    fontWeight: '700',
    color: Colors.light.onSurface,
    fontFamily: Fonts.headline,
  },
  chartCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  funnelContainer: {
    gap: 12,
  },
  funnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  funnelLabel: {
    width: 100,
    fontSize: Typography.body.sm,
    fontWeight: '600',
    color: Colors.light.onSurface,
    fontFamily: Fonts.body,
  },
  funnelBarTrack: {
    flex: 1,
    height: 24,
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 6,
    overflow: 'hidden',
  },
  funnelBar: {
    height: '100%',
    borderRadius: 6,
  },
  funnelCount: {
    width: 36,
    fontSize: Typography.title.sm,
    fontWeight: '700',
    color: Colors.light.onSurface,
    textAlign: 'right',
    fontFamily: Fonts.headline,
  },
  activityCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 4,
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activityEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  activityEmptyText: {
    fontSize: Typography.body.sm,
    color: Colors.light.onSurfaceVariant,
    fontFamily: Fonts.body,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: Typography.title.sm,
    fontWeight: '600',
    color: Colors.light.onSurface,
    fontFamily: Fonts.headline,
  },
  activitySubtitle: {
    fontSize: Typography.label.md,
    color: Colors.light.onSurfaceVariant,
    fontFamily: Fonts.body,
  },
  activityDate: {
    fontSize: Typography.label.sm,
    color: Colors.light.outline,
    marginTop: 1,
    fontFamily: Fonts.body,
  },
})
