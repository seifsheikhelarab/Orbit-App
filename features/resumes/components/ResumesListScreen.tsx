import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { View, Text, Pressable, FlatList, StyleSheet, Alert, RefreshControl, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts, getShadows } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ApiError } from '@/components/shared/ApiError'
import { AnimationTiming } from '@/constants/animations'
import {
  useResumes,
  useDeleteResume,
  useCreateResume,
  type Resume,
} from '@/features/resumes/api/useResumes'
import {
  defaultResumeData,
  defaultCoverLetterContent,
  type ResumeType,
} from '@/features/resumes/api/types'

const tabs: { key: ResumeType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'RESUME', label: 'Resumes', icon: 'document-text-outline' },
  { key: 'COVER_LETTER', label: 'Cover Letters', icon: 'mail-outline' },
]

export default function ResumesListScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const styles = useMemo(() => getStyles(colors), [colors])
  const [activeTab, setActiveTab] = useState<ResumeType>('RESUME')
  const { data: response, isLoading, isError, error, refetch, isRefetching } = useResumes(1, 50, activeTab)
  const deleteResume = useDeleteResume()
  const createResume = useCreateResume()
  const [isCreating, setIsCreating] = useState(false)

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete document', 'Are you sure you want to delete this?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteResume.mutate(id),
        },
      ])
    },
    [deleteResume],
  )

  const handleCreate = useCallback(
    (type: ResumeType) => {
      setIsCreating(true)
      const data =
        type === 'RESUME'
          ? {
              name: 'Untitled Resume',
              content: defaultResumeData,
              settings: defaultResumeData.settings,
            }
          : {
              name: 'Untitled Cover Letter',
              type,
              content: defaultCoverLetterContent,
              settings: {},
            }

      createResume.mutate(data, {
        onSuccess: (res) => {
            if (res?.data?.id) router.push(`/(resumes)/${res.data.id}` as const)
          setIsCreating(false)
        },
        onError: () => setIsCreating(false),
      })
    },
    [createResume],
  )

  const handleDuplicate = useCallback(
    (item: Resume) => {
      setIsCreating(true)
      createResume.mutate(
        {
          name: `${item.name} (Copy)`,
          type: item.type,
          content: item.content,
          settings: item.settings,
        },
        {
          onSuccess: (res) => {
          if (res?.data?.id) router.push(`/(resumes)/${res.data.id}` as const)
            setIsCreating(false)
          },
          onError: () => setIsCreating(false),
        },
      )
    },
    [createResume],
  )

  const listOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(listOpacity, {
      toValue: 1,
      ...AnimationTiming.easeOutQuart(400),
    }).start()
  }, [])

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <PageHeader
          icon="document-text-outline"
          iconVariant="accent"
          title="My Documents"
          subtitle="Manage resumes and cover letters"
        />
        <View style={styles.loadingContainer}>
          <Skeleton height={44} width="100%" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={100} width="100%" />
          ))}
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <PageHeader
          icon="document-text-outline"
          iconVariant="accent"
          title="My Documents"
          subtitle="Manage resumes and cover letters"
        />
        <ApiError message={(error as any)?.userMessage || (error as any)?.message} onRetry={() => refetch()} fullScreen />
      </View>
    )
  }

  const items = response?.data || []

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PageHeader
        icon="document-text-outline"
        iconVariant="accent"
        title="My Documents"
        subtitle="Manage resumes and cover letters"
        right={
          <Button size="sm" onPress={() => handleCreate(activeTab)} disabled={isCreating}>
            <Ionicons name="add" size={14} color={colors.onPrimary} />
          </Button>
        }
      />
      <Animated.View style={{ flex: 1, opacity: listOpacity }}>
      <FlatList
        data={items}
        keyExtractor={(item: Resume) => item.id}
        renderItem={({ item }: { item: Resume }) => (
          <ResumeCard
            item={item}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            isCreating={isCreating}
          />
        )}
        ListHeaderComponent={
          <View style={styles.tabRow}>
            {tabs.map((tab) => {
              const active = activeTab === tab.key
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tab, active && styles.tabActive]}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={active ? colors.onPrimary : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={activeTab === 'RESUME' ? 'default' : 'inbox'}
            title={
              activeTab === 'RESUME'
                ? 'No resumes yet'
                : 'No cover letters yet'
            }
            description={
              activeTab === 'RESUME'
                ? 'Create your first resume to start applying to jobs'
                : 'Create your first cover letter to personalize your applications'
            }
            action={{
              label: `Create ${activeTab === 'RESUME' ? 'Resume' : 'Cover Letter'}`,
              onPress: () => handleCreate(activeTab),
            }}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
      </Animated.View>
    </View>
  )
}

function ResumeCard({
  item,
  onDuplicate,
  onDelete,
  isCreating,
}: {
  item: Resume
  onDuplicate: (item: Resume) => void
  onDelete: (id: string) => void
  isCreating: boolean
}) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <Pressable
      onPress={() => router.push(`/(resumes)/${item.id}` as const)}
      style={({ pressed }) => [pressed && { opacity: 0.95 }, { marginBottom: 12 }]}
    >
      <Card variant="glass" size="sm">
        <View style={styles.cardTop}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.type === 'COVER_LETTER' ? 'Cover Letter' : 'Resume'} ·{' '}
              {new Date(item.updatedAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <Button variant="ghost" size="xs" onPress={() => onDuplicate(item)} disabled={isCreating} accessibilityLabel="Duplicate">
              <Ionicons name="copy-outline" size={14} color={colors.onSurfaceVariant} />
            </Button>
            <Button variant="ghost" size="xs" onPress={() => onDelete(item.id)} accessibilityLabel="Delete">
              <Ionicons name="trash-outline" size={14} color={colors.error} />
            </Button>
          </View>
        </View>
      </Card>
    </Pressable>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { padding: 16, paddingBottom: 100 },
    loadingContainer: { gap: 16, padding: 16 },
    tabRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 100,
      backgroundColor: c.surfaceContainer,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    tabActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
      ...getShadows(c).sm,
    },
    tabText: {
      fontSize: Typography.label.md,
      fontWeight: '600',
      color: c.onSurfaceVariant,
      fontFamily: Fonts.body,
    },
    tabTextActive: { color: c.onPrimary },
    list: { paddingBottom: 100 },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardInfo: { flex: 1, gap: 2 },
    cardName: {
      fontSize: Typography.body.md,
      fontWeight: '600',
      color: c.onSurface,
      fontFamily: Fonts.body,
    },
    cardMeta: {
      fontSize: Typography.body.sm,
      color: c.onSurfaceVariant,
      fontFamily: Fonts.body,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 4,
    },
  })
}
