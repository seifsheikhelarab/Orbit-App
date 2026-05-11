import { useState, useCallback } from 'react'
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
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

export default function ResumesListScreen() {
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<ResumeType>('RESUME')
  const { data: response, isLoading, isError, refetch, isRefetching } = useResumes(1, 50, activeTab)
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
          if (res?.data?.id)
            router.push(`/(resumes)/${res.data.id}` as any)
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
          type: item.type as ResumeType,
          content: item.content,
          settings: item.settings,
        },
        {
          onSuccess: (res) => {
            if (res?.data?.id)
              router.push(`/(resumes)/${res.data.id}` as any)
            setIsCreating(false)
          },
          onError: () => setIsCreating(false),
        },
      )
    },
    [createResume],
  )

  if (isLoading) {
    return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <Skeleton height={48} width="60%" />
          <Skeleton height={40} width={130} />
        </View>
        <Skeleton height={44} width="100%" style={{ marginBottom: 16 }} />
        <View style={{ gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={200} width="100%" />
          ))}
        </View>
      </View>
    )
  }

  const items = response?.data || []

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.light.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>My Documents</Text>
            <Text style={styles.subtitle}>
              Manage resumes and cover letters
            </Text>
          </View>
          <Button
            onPress={() => handleCreate(activeTab)}
            disabled={isCreating}
          >
            <Ionicons name="add" size={16} color={Colors.light.onPrimary} />
            <Text style={{ color: Colors.light.onPrimary, fontWeight: '600', fontSize: Typography.body.sm, fontFamily: Fonts.body }}>
              {' '}
              {activeTab === 'RESUME' ? 'Resume' : 'Cover Letter'}
            </Text>
          </Button>
        </View>

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setActiveTab('RESUME')}
            style={[styles.tab, activeTab === 'RESUME' && styles.tabActive]}
          >
            <Ionicons
              name="document-text-outline"
              size={16}
              color={
                activeTab === 'RESUME'
                  ? Colors.light.onPrimary
                  : Colors.light.onSurfaceVariant
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'RESUME' && styles.tabTextActive,
              ]}
            >
              Resumes
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('COVER_LETTER')}
            style={[
              styles.tab,
              activeTab === 'COVER_LETTER' && styles.tabActive,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={16}
              color={
                activeTab === 'COVER_LETTER'
                  ? Colors.light.onPrimary
                  : Colors.light.onSurfaceVariant
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'COVER_LETTER' && styles.tabTextActive,
              ]}
            >
              Cover Letters
            </Text>
          </Pressable>
        </View>

        {items.length === 0 ? (
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
        ) : (
          <View style={styles.list}>
            {items.map((item: any) => (
              <ResumeCard
                key={item.id}
                item={item}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                isCreating={isCreating}
              />
            ))}
            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>
    </View>
  )
}

function ResumeCard({
  item,
  onDuplicate,
  onDelete,
  isCreating,
}: {
  item: any
  onDuplicate: (item: any) => void
  onDelete: (id: string) => void
  isCreating: boolean
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Pressable
        onPress={() => router.push(`/(resumes)/${item.id}` as any)}
        style={styles.card}
      >
        <View style={styles.cardPreview}>
          <View style={styles.cardPreviewHeader} />
          <View style={styles.cardPreviewContent}>
            <View style={styles.cardPreviewLineWide} />
            <View style={styles.cardPreviewLineHalf} />
            <View style={styles.cardPreviewLineMedium} />
            <View style={styles.cardPreviewLineFull} />
            <View style={styles.cardPreviewLineFull} />
            <View style={styles.cardPreviewLineThreeQ} />
          </View>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>
              {item.type === 'COVER_LETTER' ? 'CL' : 'CV'}
            </Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardMeta}>
            {item.type === 'COVER_LETTER' ? 'Cover Letter' : 'Resume'} ·{' '}
            {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <Button variant="ghost" size="xs" onPress={() => onDuplicate(item)} disabled={isCreating}>
            <Ionicons name="copy-outline" size={14} color={Colors.light.onSurfaceVariant} />
            <Text style={{ fontSize: Typography.label.sm, color: Colors.light.onSurfaceVariant, marginLeft: 4, fontFamily: Fonts.body }}>Copy</Text>
          </Button>
          <Button variant="ghost" size="xs" onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={14} color={Colors.light.error} />
          </Button>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: Typography.headline.md,
    fontWeight: '800',
    color: Colors.light.onSurface,
    fontFamily: Fonts.headline,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.body.sm,
    color: Colors.light.onSurfaceVariant,
    marginTop: 2,
    fontFamily: Fonts.body,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surfaceContainer,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: Typography.label.md,
    fontWeight: '600',
    color: Colors.light.onSurfaceVariant,
    fontFamily: Fonts.body,
  },
  tabTextActive: {
    color: Colors.light.onPrimary,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    overflow: 'hidden',
  },
  cardPreview: {
    height: 160,
    backgroundColor: Colors.light.surfaceContainerLow,
    padding: 16,
    position: 'relative',
  },
  cardPreviewHeader: {
    height: 20,
    backgroundColor: Colors.light.primary + '15',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant + '30',
    borderRadius: 4,
    marginBottom: 12,
  },
  cardPreviewContent: {
    gap: 6,
  },
  cardPreviewLineWide: {
    height: 10,
    width: '75%',
    borderRadius: 4,
    backgroundColor: Colors.light.onSurface + '12',
  },
  cardPreviewLineHalf: {
    height: 8,
    width: '50%',
    borderRadius: 4,
    backgroundColor: Colors.light.onSurface + '8',
  },
  cardPreviewLineMedium: {
    height: 8,
    width: '66%',
    borderRadius: 4,
    backgroundColor: Colors.light.onSurface + '8',
  },
  cardPreviewLineFull: {
    height: 6,
    width: '100%',
    borderRadius: 4,
    backgroundColor: Colors.light.onSurface + '8',
  },
  cardPreviewLineThreeQ: {
    height: 6,
    width: '75%',
    borderRadius: 4,
    backgroundColor: Colors.light.onSurface + '8',
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.light.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant + '50',
  },
  cardBadgeText: {
    fontSize: Typography.label.sm,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light.onSurfaceVariant + '99',
    fontFamily: Fonts.body,
  },
  cardInfo: {
    padding: 16,
    paddingBottom: 8,
  },
  cardName: {
    fontSize: Typography.body.md,
    fontWeight: '600',
    color: Colors.light.onSurface,
    fontFamily: Fonts.body,
  },
  cardMeta: {
    fontSize: Typography.body.sm,
    color: Colors.light.onSurfaceVariant,
    marginTop: 2,
    fontFamily: Fonts.body,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.outline,
    backgroundColor: Colors.light.surfaceContainerLow,
  },
})
