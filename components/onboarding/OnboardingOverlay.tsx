import { useState, useRef, useEffect, useMemo } from 'react'
import { View, Text, Pressable, StyleSheet, Animated, Dimensions, Modal } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts, Shadows } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    icon: 'rocket-outline' as const,
    title: 'Mission Control Activated',
    subtitle: 'Welcome to Orbit',
    description: 'Your centralized hub for managing every job application. Track positions, prepare for interviews, and land your next role — all from one place.',
  },
  {
    icon: 'briefcase-outline' as const,
    title: 'Add Your First Target',
    subtitle: 'Start Tracking',
    description: 'Enter a company and position you\'re pursuing. We\'ll help you organize the details, set reminders, and move through each stage of the pipeline.',
  },
]

interface OnboardingOverlayProps {
  visible: boolean
  onComplete: () => void
}

export function OnboardingOverlay({ visible, onComplete }: OnboardingOverlayProps) {
  const colors = useColors()
  const styles = useMemo(() => getStyles(colors), [colors])
  const [step, setStep] = useState(0)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(20)).current

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0)
      slideAnim.setValue(20)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start()
    }
  }, [visible, step])

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      fadeAnim.setValue(0)
      slideAnim.setValue(20)
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const handleAddFirst = () => {
    onComplete()
    router.push('/(tabs)/applications/new' as const)
  }

  const s = STEPS[step]

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.orbitalTL} />
        <View style={styles.orbitalBR} />

        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.accentBar} />

          <View style={styles.stepIndicator}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.stepDot, i === step && styles.stepDotActive, i < step && styles.stepDotDone]} />
            ))}
          </View>

          <View style={styles.iconWrap}>
            <Ionicons name={s.icon} size={44} color={colors.accent} />
          </View>

          <Text style={styles.badge}>{s.subtitle}</Text>
          <Text style={styles.title}>{s.title}</Text>
          <Text style={styles.description}>{s.description}</Text>

          <View style={styles.actions}>
            {step === 0 ? (
              <Button size="lg" onPress={handleNext}>
                Show Me Around
              </Button>
            ) : (
              <Button size="lg" onPress={handleAddFirst}>
                Add First Application
              </Button>
            )}
            <Pressable onPress={handleSkip} style={styles.skipButton} accessibilityRole="button">
              <Text style={styles.skipText}>
                {step === 0 ? 'Skip intro' : 'Skip, I\'ll add later'}
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const { width } = Dimensions.get('window')

function getStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: c.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    orbitalTL: {
      position: 'absolute',
      top: -80,
      left: -80,
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 1,
      borderColor: c.accent + '12',
    },
    orbitalBR: {
      position: 'absolute',
      bottom: -60,
      right: -60,
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: c.primary + '10',
    },
    card: {
      width: width - 48,
      backgroundColor: c.surface,
      borderRadius: 24,
      padding: 36,
      ...Shadows.xl,
      overflow: 'hidden',
    },
    accentBar: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      height: 4,
      backgroundColor: c.accent,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 32,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.outlineVariant,
    },
    stepDotActive: {
      width: 24,
      backgroundColor: c.accent,
      borderRadius: 4,
    },
    stepDotDone: {
      backgroundColor: c.accent,
    },
    iconWrap: {
      width: 88,
      height: 88,
      borderRadius: 24,
      backgroundColor: c.accentContainer,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 20,
    },
    badge: {
      fontSize: Typography.label.sm,
      fontFamily: Fonts.body,
      fontWeight: '700',
      color: c.accent,
      letterSpacing: 2,
      textAlign: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: Typography.headline.lg,
      fontFamily: Fonts.headline,
      fontWeight: '800',
      color: c.onSurface,
      textAlign: 'center',
      letterSpacing: -0.5,
      marginBottom: 12,
    },
    description: {
      fontSize: Typography.body.md,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
      paddingHorizontal: 8,
    },
    actions: {
      gap: 12,
    },
    skipButton: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    skipText: {
      fontSize: Typography.body.sm,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
      fontWeight: '500',
    },
  })
}
