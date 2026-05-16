import { useEffect, useMemo } from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated'
import { useColors } from '@/hooks/useColors'
import { Colors } from '@/constants/theme'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const shimmer = useSharedValue(0)

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.25, 0.6, 0.25]),
  }))

  return (
    <Animated.View
      accessibilityElementsHidden
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  )
}

function SkeletonCard({ lines = 3, style }: { lines?: number; style?: ViewStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <View style={[styles.card, style]}>
      <Skeleton height={16} width="60%" />
      <View style={{ gap: 6 }}>
        {[...Array(lines)].map((_, i) => (
          <Skeleton key={i} height={12} width={i === lines - 1 ? '45%' : '100%'} />
        ))}
      </View>
    </View>
  )
}

function KanbanSkeleton() {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const statuses = ['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'CLOSED']
  return (
    <View style={styles.kanbanContainer}>
      {statuses.map((status) => (
        <View key={status} style={styles.kanbanColumn}>
          <Skeleton width={96} height={32} />
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.kanbanCard}>
              <Skeleton width="100%" height={64} />
              <Skeleton width="66%" height={16} />
              <Skeleton width="50%" height={12} />
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} style={styles.tableHeaderCell} />
        ))}
      </View>
      {[...Array(rows)].map((_, row) => (
        <View key={row} style={styles.tableRow}>
          {[1, 2, 3, 4, 5].map((col) => (
            <Skeleton key={col} height={48} style={styles.tableCell} />
          ))}
        </View>
      ))}
    </View>
  )
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    skeleton: {
      backgroundColor: c.surfaceContainer,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 16,
      gap: 16,
    },
    kanbanContainer: {
      flexDirection: 'row',
      gap: 16,
      padding: 16,
    },
    kanbanColumn: {
      flex: 1,
      gap: 12,
    },
    kanbanCard: {
      gap: 8,
    },
    tableContainer: {
      gap: 12,
      padding: 16,
    },
    tableHeader: {
      flexDirection: 'row',
      gap: 16,
    },
    tableHeaderCell: {
      flex: 1,
      height: 32,
    },
    tableRow: {
      flexDirection: 'row',
      gap: 16,
    },
    tableCell: {
      flex: 1,
    },
  })
}

export { Skeleton, SkeletonCard, KanbanSkeleton, TableSkeleton }
