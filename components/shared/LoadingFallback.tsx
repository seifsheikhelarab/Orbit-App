import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { hexa } from '@/lib/opacity'
import { AnimationTiming } from '@/constants/animations'

function GeometricDossierGrid({ accent }: { accent: string }) {
  const rotateAnim = useRef(new Animated.Value(0)).current
  const reduceMotion = useReduceMotion()

  useEffect(() => {
    if (reduceMotion) {
      rotateAnim.setValue(1)
      return
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          ...AnimationTiming.easeOutQuart(2000),
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          ...AnimationTiming.easeOutQuart(2000),
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [reduceMotion])

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  })

  const dots = [
    { opacity: 0.9 },
    { opacity: 0.7 },
    { opacity: 0.5 },
    { opacity: 0.9 },
  ]

  return (
    <View style={styles.gridContainer}>
      <Animated.View style={[styles.grid, { transform: [{ rotate: spin }] }]}>
        {dots.map((dot, i) => (
          <View
            key={i}
            style={[
              styles.gridDot,
              {
                backgroundColor: accent,
                opacity: dot.opacity,
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  )
}

function ScanningLine({ accent }: { accent: string }) {
  const scanAnim = useRef(new Animated.Value(0)).current
  const reduceMotion = useReduceMotion()

  useEffect(() => {
    if (reduceMotion) {
      scanAnim.setValue(0.5)
      return
    }
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          ...AnimationTiming.easeOutQuart(2000),
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          ...AnimationTiming.easeOutQuart(2000),
        }),
      ]),
    )
    scan.start()
    return () => scan.stop()
  }, [reduceMotion])

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 80],
  })

  return (
    <Animated.View
      style={[
        styles.scanLine,
        {
          backgroundColor: hexa(accent, 0.6),
          transform: [{ translateY }],
        },
      ]}
    />
  )
}

function LoadingDots({ accent }: { accent: string }) {
  const dot1 = useRef(new Animated.Value(0)).current
  const dot2 = useRef(new Animated.Value(0)).current
  const dot3 = useRef(new Animated.Value(0)).current
  const reduceMotion = useReduceMotion()

  useEffect(() => {
    if (reduceMotion) {
      ;[dot1, dot2, dot3].forEach((d) => d.setValue(1))
      return
    }
    const bounce = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            ...AnimationTiming.easeOutQuart(400),
          }),
          Animated.timing(anim, {
            toValue: 0,
            ...AnimationTiming.easeOutQuart(400),
          }),
        ]),
      )

    bounce(dot1, 0).start()
    bounce(dot2, 150).start()
    bounce(dot3, 300).start()

    return () => {
      ;[dot1, dot2, dot3].forEach((d) => d.stopAnimation())
    }
  }, [reduceMotion])

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 1],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        }),
      },
    ],
  })

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { backgroundColor: accent }, dotStyle(dot1)]} />
      <Animated.View style={[styles.dot, { backgroundColor: accent }, dotStyle(dot2)]} />
      <Animated.View style={[styles.dot, { backgroundColor: accent }, dotStyle(dot3)]} />
    </View>
  )
}

function LoadingFallback({ message = 'Decrypting Dossiers' }: { message?: string }) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <GeometricDossierGrid accent={theme.accent} />

      <View style={styles.scanArea}>
        <ScanningLine accent={theme.accent} />
      </View>

      <View style={styles.textArea}>
        <Text style={[styles.title, { color: theme.onSurface }]}>{message}</Text>
        <LoadingDots accent={theme.accent} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  grid: {
    width: 48,
    height: 48,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridDot: {
    width: 18,
    height: 18,
    borderRadius: 4,
  },
  scanArea: {
    width: 80,
    height: 80,
    position: 'absolute',
    top: '42%',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  textArea: {
    alignItems: 'center',
    gap: 16,
    marginTop: 48,
  },
  title: {
    fontSize: Typography.label.lg,
    fontFamily: Fonts.body,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
})

export { LoadingFallback }
