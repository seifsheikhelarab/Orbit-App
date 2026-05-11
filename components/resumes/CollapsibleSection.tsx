import { useState, type ReactNode } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography } from '@/constants/theme'

interface CollapsibleSectionProps {
  title: string
  description?: string
  icon?: keyof typeof Ionicons.glyphMap
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  title,
  description,
  icon,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <View style={[styles.container, open && styles.containerOpen]}>
      <Pressable
        onPress={() => setOpen(!open)}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          {icon && (
            <View style={[styles.iconBox, open && styles.iconBoxOpen]}>
              <Ionicons
                name={icon}
                size={16}
                color={open ? Colors.light.onPrimary : Colors.light.primary}
              />
            </View>
          )}
          <View style={styles.titleArea}>
            <Text style={[styles.title, open && styles.titleOpen]}>
              {title}
            </Text>
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
          </View>
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={open ? Colors.light.primary : Colors.light.onSurfaceVariant}
        />
      </Pressable>
      {open && (
        <View style={styles.content}>
          <View style={styles.divider} />
          <View style={styles.children}>{children}</View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    backgroundColor: Colors.light.surfaceContainerLow,
    overflow: 'hidden',
  },
  containerOpen: {
    borderColor: Colors.light.primary + '20',
    backgroundColor: Colors.light.surface,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.surfaceContainerHigh + '50',
  },
  iconBoxOpen: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    fontSize: Typography.body.md,
    fontWeight: '700',
    color: Colors.light.onSurface,
    letterSpacing: -0.3,
  },
  titleOpen: {
    fontSize: Typography.body.lg,
    color: Colors.light.onSurface,
  },
  description: {
    fontSize: Typography.body.sm,
    color: Colors.light.onSurfaceVariant,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.outline + '60',
    marginBottom: 16,
  },
  children: {
    gap: 16,
  },
})
