import { useState, useMemo, useCallback, useEffect } from 'react'
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts, Shadows } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { ApplicationCard } from '@/components/applications/ApplicationCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { APPLICATION_STATUSES, APPLICATION_STATUS_CONFIG, type ApplicationStatus } from '@/lib/status'
import { useApplications, type Application } from '@/features/applications/api/useApplications'

export default function ApplicationsScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const [selectedStatuses, setSelectedStatuses] = useState<ApplicationStatus[]>([])
  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (searchTimer) clearTimeout(searchTimer)
    }
  }, [])

  const handleSearch = useCallback((text: string) => {
    setSearchText(text)
    if (searchTimer) clearTimeout(searchTimer)
    const timer = setTimeout(() => setDebouncedSearch(text), 300)
    setSearchTimer(timer)
  }, [searchTimer])

  const toggleStatus = useCallback((status: ApplicationStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    )
  }, [])

  const hasFilters = selectedStatuses.length > 0 || debouncedSearch.length > 0

  const queryParams = useMemo(() => ({
    search: debouncedSearch,
    status: selectedStatuses,
    location: '',
    appliedFrom: '',
    appliedTo: '',
    salaryMin: undefined as number | undefined,
    salaryMax: undefined as number | undefined,
    page: 1,
    limit: 50,
    sort: 'createdAt',
    order: 'desc' as const,
  }), [debouncedSearch, selectedStatuses])

  const { data: response, isLoading } = useApplications(queryParams)
  const applications = response?.data || []

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <PageHeader
          icon="briefcase-outline"
          iconVariant="accent"
          title="Applications"
          subtitle="Track and manage your pipeline."
          badge={applications.length}
        />
        <View style={styles.loadingContainer}>
          <Skeleton height={48} width="100%" />
          <Skeleton height={200} width="100%" />
          <Skeleton height={200} width="100%" />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PageHeader
        icon="briefcase-outline"
        iconVariant="accent"
        title="Applications"
        subtitle="Track and manage your pipeline."
        badge={applications.length}
        right={
          <Button onPress={() => router.push('/(tabs)/applications/new' as const)}>
            <Ionicons name="add" size={18} color={colors.onPrimary} />
            <Text style={{ color: colors.onPrimary }}>  New</Text>
          </Button>
        }
      />

      <FlatList
        data={applications}
        keyExtractor={(item: Application) => item.id}
        renderItem={({ item }: { item: Application }) => <ApplicationListItem app={item} />}
        ListHeaderComponent={
          <View>
            <View style={styles.searchRow}>
              <Input
                left={<Ionicons name="search-outline" size={16} color={colors.onSurfaceVariant} />}
                value={searchText}
                onChangeText={handleSearch}
                placeholder="Search applications..."
              />
            </View>

            <View style={styles.statusRow}>
              {APPLICATION_STATUSES.map((status) => {
                const active = selectedStatuses.includes(status)
                const cfg = APPLICATION_STATUS_CONFIG[status]
                return (
                    <Pressable
                      key={status}
                      onPress={() => toggleStatus(status)}
                      style={[styles.statusPill, active && styles.statusPillActive]}
                      accessibilityRole="button"
                    >
                    <View style={[styles.pillDot, active && { backgroundColor: colors.onPrimary }]} />
                    <Text style={[styles.statusPillText, active && styles.statusPillTextActive]}>
                      {cfg.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {hasFilters && (
              <Pressable onPress={() => { setSelectedStatuses([]); setSearchText(''); setDebouncedSearch(''); }} accessibilityRole="button">
                <Text style={styles.clearFilters}>Clear filters</Text>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="applications"
            title="No applications yet"
            description="Start tracking your job search."
            action={{ label: 'Add Application', onPress: () => router.push('/(tabs)/applications/new' as const) }}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

function ApplicationListItem({ app }: { app: Application }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <ApplicationCard
        application={app}
        onPress={() => router.push(`/(tabs)/applications/${app.id}` as const)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  searchRow: { marginBottom: 12 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: Colors.light.surfaceContainer,
    borderWidth: 1, borderColor: Colors.light.outlineVariant,
  },
  statusPillActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    ...Shadows.sm,
  },
  pillDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.onSurfaceVariant,
  },
  statusPillText: {
    fontSize: Typography.label.md, fontWeight: '600',
    color: Colors.light.onSurfaceVariant, fontFamily: Fonts.body,
  },
  statusPillTextActive: { color: Colors.light.onPrimary },
  clearFilters: {
    fontSize: Typography.label.md, color: Colors.light.accent,
    fontWeight: '600', marginBottom: 8, fontFamily: Fonts.body,
    letterSpacing: 0.3,
  },
  list: { paddingBottom: 100 },
  loadingContainer: { gap: 16, paddingTop: 16, padding: 16 },
})
