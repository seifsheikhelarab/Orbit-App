import React, { useCallback, useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { StaggeredList } from '@/components/shared/StaggeredList'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/components/shared/ApiError'
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useSnoozeNotification, useDismissNotification, type Notification } from '@/features/notifications/api/useNotifications'

export default function NotificationsScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const styles = useMemo(() => getStyles(colors), [colors])
  const { data: notifications, isLoading, isError, error, refetch, isRefetching } = useNotifications()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const snooze = useSnoozeNotification()
  const dismiss = useDismissNotification()

  const unreadCount = notifications?.filter((n: Notification) => !n.readAt)?.length ?? 0

  const handleMarkAsRead = useCallback((id: string) => {
    markAsRead.mutate(id)
  }, [markAsRead])

  const handleSnooze = useCallback((id: string, days: number) => {
    snooze.mutate({ id, days })
  }, [snooze])

  const handleDismiss = useCallback((id: string) => {
    Alert.alert('Dismiss', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Dismiss', style: 'destructive', onPress: () => dismiss.mutate(id) },
    ])
  }, [dismiss])

  const handleNavigate = useCallback((applicationId: string | null) => {
    if (applicationId) {
      router.push(`/(tabs)/applications/${applicationId}` as const)
    }
  }, [router])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PageHeader
        icon="notifications-outline"
        iconVariant="accent"
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        badge={unreadCount}
        badgeVariant="count"
        right={
          unreadCount > 0 && (
            <Button variant="ghost" size="sm" onPress={() => markAllAsRead.mutate()}>
              Mark all read
            </Button>
          )
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <ApiError message={(error as any)?.userMessage || (error as any)?.message} onRetry={() => refetch()} fullScreen />
        ) : notifications && notifications.length > 0 ? (
          <StaggeredList staggerDelay={50} initialDelay={80} direction="up">
            {notifications.map((notification: Notification) => (
              <View key={notification.id} style={styles.cardGap}>
                <NotificationCard
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onSnooze={handleSnooze}
                  onDismiss={handleDismiss}
                  onNavigate={handleNavigate}
                />
              </View>
            ))}
          </StaggeredList>
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="notifications-off-outline" size={32} color={colors.onSurfaceVariant} />
            </View>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDesc}>You're all caught up!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const NotificationCard = React.memo(function NotificationCard({
  notification,
  onMarkAsRead,
  onSnooze,
  onDismiss,
  onNavigate,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onSnooze: (id: string, days: number) => void
  onDismiss: (id: string) => void
  onNavigate: (applicationId: string | null) => void
}) {
  const colors = useColors()
  const cs = useMemo(() => getStyles(colors), [colors])
  const isUnread = !notification.readAt
  const isOverdue = notification.type === 'FOLLOW_UP_OVERDUE'

  return (
    <Pressable
      onPress={() => onNavigate(notification.applicationId ?? null)}
      style={({ pressed }) => [pressed && cs.cardPressed]}
    >
      <Card
        notification
        notificationUnread={isUnread}
        notificationOverdue={isOverdue}
      >
        <View style={cs.cardInner}>
          <View style={cs.cardLeft}>
            <View style={[cs.dot, isUnread ? cs.dotUnread : cs.dotRead]} />
          </View>
          <View style={cs.cardBody}>
            <View style={cs.cardHeader}>
              <Text style={[cs.cardTitle, !isUnread && cs.cardTitleDim]} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={cs.cardTime}>
                {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
              </Text>
            </View>
            {notification.body && (
              <Text style={cs.cardBodyText} numberOfLines={2}>
                {notification.body}
              </Text>
            )}
            {notification.jobTitle && (
              <Text style={cs.cardMeta}>
                {notification.jobTitle}
                {notification.company && ` at ${notification.company}`}
              </Text>
            )}
            <View style={cs.cardActions}>
              {isUnread && (
                <Pressable onPress={(e) => { e.stopPropagation(); onMarkAsRead(notification.id) }} style={cs.actionBtn} accessibilityRole="button">
                  <Text style={cs.actionText}>Mark read</Text>
                </Pressable>
              )}
              <Pressable onPress={(e) => { e.stopPropagation(); onSnooze(notification.id, 3) }} style={cs.actionBtn} accessibilityRole="button">
                <Text style={cs.actionText}>Snooze</Text>
              </Pressable>
              <Pressable onPress={(e) => { e.stopPropagation(); onDismiss(notification.id) }} style={cs.actionBtn} accessibilityRole="button">
                <Text style={[cs.actionText, cs.actionDanger]}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  )
})

const getStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
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
    backgroundColor: c.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: Typography.headline.sm,
    fontWeight: '700',
    fontFamily: Fonts.headline,
    color: c.onSurface,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: c.onSurfaceVariant,
    textAlign: 'center',
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardGap: {
    marginBottom: 12,
  },
  cardInner: {
    flexDirection: 'row',
    gap: 12,
  },
  cardLeft: {
    paddingTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotUnread: {
    backgroundColor: c.primary,
  },
  dotRead: {
    backgroundColor: 'transparent',
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: {
    fontSize: Typography.body.sm,
    fontWeight: '600',
    fontFamily: Fonts.body,
    color: c.onSurface,
    flex: 1,
  },
  cardTitleDim: {
    color: c.onSurfaceVariant,
  },
  cardTime: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    color: c.onSurfaceVariant,
    flexShrink: 0,
  },
  cardBodyText: {
    fontSize: Typography.label.lg,
    fontFamily: Fonts.body,
    color: c.onSurfaceVariant,
    lineHeight: 18,
  },
  cardMeta: {
    fontSize: Typography.label.lg,
    fontFamily: Fonts.body,
    color: c.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  actionBtn: {},
  actionText: {
    fontSize: Typography.label.sm,
    fontWeight: '600',
    fontFamily: Fonts.body,
    color: c.primary,
  },
  actionDanger: {
    color: c.error,
  },
})
