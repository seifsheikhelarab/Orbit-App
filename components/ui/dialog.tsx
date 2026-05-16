import { useState, useRef, useEffect, cloneElement, useMemo } from 'react'
import { Modal, View, Text, Pressable, StyleSheet, Animated, type ViewStyle, type TextStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '@/hooks/useColors'
import { Colors, Typography } from '@/constants/theme'
import { hexa } from '@/lib/opacity'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const setIsOpen = onOpenChange ?? setInternalOpen
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    if (isOpen) {
      scaleAnim.setValue(0.95)
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start()
    }
  }, [isOpen])

  const childrenArray = Array.isArray(children) ? children : [children]
  const trigger = childrenArray.find((c: any) => c?.type === DialogTrigger)
  const content = childrenArray.find((c: any) => c?.type === DialogContent)

  return (
    <>
      {trigger && cloneElement(trigger.props.children, { onPress: () => setIsOpen(true) })}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)} accessibilityElementsHidden>
          <Animated.View style={[styles.content, { opacity: scaleAnim, transform: [{ scale: scaleAnim }] }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              {content?.props.children}
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => setIsOpen(false)} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
              </Pressable>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  )
}

function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DialogContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DialogHeader({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return <View style={[styles.header, style]}>{children}</View>
}

function DialogFooter({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return <View style={[styles.footer, style]}>{children}</View>
}

function DialogTitle({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return <Text style={[styles.title, style]}>{children}</Text>
}

function DialogDescription({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  return <Text style={[styles.description, style]}>{children}</Text>
}

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: hexa(c.onSurface, 0.30),
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    content: {
      width: '100%',
      maxWidth: 400,
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 24,
      gap: 24,
      shadowColor: c.onSurface,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      padding: 4,
    },
    header: {
      flexDirection: 'column',
      gap: 4,
    },
    title: {
      fontSize: Typography.title.lg,
      fontWeight: '600',
      color: c.onSurface,
    },
    description: {
      fontSize: Typography.body.sm,
      color: c.onSurfaceVariant,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 8,
    },
  })
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription }
