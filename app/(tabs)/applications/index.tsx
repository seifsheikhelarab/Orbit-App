import { useState, useMemo, useCallback, useEffect } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { ApplicationCard } from '@/components/applications/ApplicationCard'
import { APPLICATION_STATUSES, APPLICATION_STATUS_CONFIG, type ApplicationStatus } from '@/lib/status'
import { useApplications, type Application } from '@/features/applications/api/useApplications'

export default function ApplicationsScreen() {
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
  }, [selectedStatuses])

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

  const { data: response, isLoading, refetch, isRefetching } = useApplications(queryParams)
  const applications = response?.data || []

  if (isLoading) {
    return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.loadingContainer}>
          <Skeleton height={48} width="100%" />
          <Skeleton height={200} width="100%" />
          <Skeleton height={200} width="100%" />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View>
        <View style={styles.header}>
          <View style={styles.headerLeftVisual}>
            <View style={styles.headerStatIcon}>
              <Text style={styles.headerStatCount}>{applications.length}</Text>
            </View>
            <View>
              <Text style={styles.title}>Applications</Text>
              <Text style={styles.subtitle}>Track and manage your pipeline.</Text>
            </View>
          </View>
          <Button onPress={() => router.push('/(tabs)/applications/new' as any)}>
            <Ionicons name="add" size={18} color={Colors.light.onPrimary} />
            <Text> New</Text>
          </Button>
        </View>

        <View style={styles.searchRow}>
          <Input
            left={<Ionicons name="search-outline" size={16} color={Colors.light.onSurfaceVariant} />}
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
              >
                <Text style={[styles.statusPillText, active && styles.statusPillTextActive]}>
                  {cfg.label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {hasFilters && (
          <Pressable onPress={() => { setSelectedStatuses([]); setSearchText(''); setDebouncedSearch(''); }}>
            <Text style={styles.clearFilters}>Clear filters</Text>
          </Pressable>
        )}

        {applications.length === 0 ? (
          <EmptyState
            icon="applications"
            title="No applications yet"
            description="Start tracking your job search."
            action={{ label: 'Add Application', onPress: () => router.push('/(tabs)/applications/new' as any) }}
          />
        ) : (
          <View style={styles.list}>
            {applications.map((app: Application) => (
              <ApplicationListItem key={app.id} app={app} />
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </View>
    </View>
  )
}

function ApplicationListItem({ app }: { app: Application }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <ApplicationCard
        application={app}
        onPress={() => router.push(`/(tabs)/applications/${app.id}` as any)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingTop: 8 },
  headerLeftVisual: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  headerStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.light.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerStatCount: {
    fontSize: Typography.title.md,
    fontWeight: '800',
    color: Colors.light.primary,
    fontFamily: Fonts.headline,
  },
  title: { fontSize: Typography.headline.md, fontWeight: '800', color: Colors.light.onSurface, fontFamily: Fonts.headline, letterSpacing: -0.5 },
  subtitle: { fontSize: Typography.body.sm, color: Colors.light.onSurfaceVariant, fontFamily: Fonts.body },
  searchRow: { marginBottom: 12 },

  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statusPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: Colors.light.surfaceContainer, borderWidth: 1, borderColor: Colors.light.outlineVariant },
  statusPillActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  statusPillText: { fontSize: Typography.label.md, fontWeight: '600', color: Colors.light.onSurfaceVariant, fontFamily: Fonts.body },
  statusPillTextActive: { color: Colors.light.onPrimary },
  clearFilters: { fontSize: Typography.label.md, color: Colors.light.accent, fontWeight: '600', marginBottom: 8, fontFamily: Fonts.body },
  list: { paddingBottom: 100 },
  loadingContainer: { gap: 16, paddingTop: 16 },
})
