import { Animated, Easing } from 'react-native'

/**
 * Timing configs matching Orbit-Client's ease-out-quart, ease-out-quint, ease-out-expo
 * cubic-bezier transitions, adapted for React Native's Animated API.
 */
export const AnimationTiming = {
  /** ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1) — default motion */
  easeOutQuart: (duration: number = 400) => ({
    duration,
    easing: Easing.bezier(0.25, 1, 0.5, 1),
    useNativeDriver: true,
  }),
  /** ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1) — dramatic reveals */
  easeOutQuint: (duration: number = 600) => ({
    duration,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    useNativeDriver: true,
  }),
  /** ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1) — bar fills, counts */
  easeOutExpo: (duration: number = 800) => ({
    duration,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    useNativeDriver: true,
  }),
  /** Fast micro-interaction — press, feedback */
  micro: () => ({
    duration: 200,
    easing: Easing.bezier(0.25, 1, 0.5, 1),
    useNativeDriver: true,
  }),
  /** Page entrance */
  pageEnter: () => ({
    duration: 500,
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    useNativeDriver: true,
  }),
}

/**
 * Entry animation values for staggering children.
 * Returns an array of animated values (opacity + translateY) for N children.
 */
export function createStaggerValues(
  count: number,
  baseDelay: number = 80,
  startY: number = 16,
) {
  const opacities = Array.from({ length: count }, () => new Animated.Value(0))
  const translates = Array.from({ length: count }, () => new Animated.Value(startY))
  return { opacities, translates }
}

/**
 * Start a staggered entrance animation sequence.
 * Each child fades in + slides up with increasing delay.
 */
export function animateStagger(
  opacities: Animated.Value[],
  translates: Animated.Value[],
  options?: {
    baseDelay?: number
    staggerMs?: number
    startY?: number
    reduced?: boolean
    onComplete?: () => void
  },
) {
  const { baseDelay = 0, staggerMs = 80, startY = 16, reduced = false } = options ?? {}

  if (reduced) {
    // Skip animation — just set final values
    opacities.forEach((o) => o.setValue(1))
    translates.forEach((t) => t.setValue(0))
    options?.onComplete?.()
    return
  }

  const anims = opacities.flatMap((opacity, i) => [
    Animated.timing(opacity, {
      toValue: 1,
      ...AnimationTiming.easeOutQuart(400),
      delay: baseDelay + i * staggerMs,
    }),
    Animated.timing(translates[i], {
      toValue: 0,
      ...AnimationTiming.easeOutQuart(400),
      delay: baseDelay + i * staggerMs,
    }),
  ])

  Animated.parallel(anims).start(options?.onComplete)
}

/**
 * Get stagger style object for an Animated.View at index i.
 */
export function staggerStyle(
  opacity: Animated.Value,
  translateY: Animated.Value,
  startY: number = 16,
) {
  return {
    opacity,
    transform: [
      {
        translateY: translateY.interpolate({
          inputRange: [0, startY],
          outputRange: [0, startY],
          extrapolate: 'clamp',
        }),
      },
    ],
  }
}

/**
 * Section reveal animation config (fade + scale + slide).
 * Matches Orbit-Client's sectionReveal keyframe.
 */
export function sectionRevealStyle(
  opacity: Animated.Value,
  scale: Animated.Value,
  translateY: Animated.Value,
) {
  return {
    opacity,
    transform: [
      { scale },
      {
        translateY: translateY.interpolate({
          inputRange: [0, 24],
          outputRange: [0, 24],
          extrapolate: 'clamp',
        }),
      },
    ],
  }
}

/**
 * Create animation values for section reveals.
 */
export function createSectionRevealValues(count: number) {
  const opacities = Array.from({ length: count }, () => new Animated.Value(0))
  const scales = Array.from({ length: count }, () => new Animated.Value(0.98))
  const translates = Array.from({ length: count }, () => new Animated.Value(24))
  return { opacities, scales, translates }
}

/**
 * Start section reveal animations with stagger.
 */
export function animateSectionReveal(
  opacities: Animated.Value[],
  scales: Animated.Value[],
  translates: Animated.Value[],
  reduced: boolean = false,
  onComplete?: () => void,
) {
  if (reduced) {
    opacities.forEach((o) => o.setValue(1))
    scales.forEach((s) => s.setValue(1))
    translates.forEach((t) => t.setValue(0))
    onComplete?.()
    return
  }

  const anims = opacities.flatMap((opacity, i) => [
    Animated.timing(opacity, {
      toValue: 1,
      ...AnimationTiming.easeOutQuint(600),
      delay: i * 100,
    }),
    Animated.timing(scales[i], {
      toValue: 1,
      ...AnimationTiming.easeOutQuint(600),
      delay: i * 100,
    }),
    Animated.timing(translates[i], {
      toValue: 0,
      ...AnimationTiming.easeOutQuint(600),
      delay: i * 100,
    }),
  ])

  Animated.parallel(anims).start(onComplete)
}

/** Default easing for component transitions */
export const DEFAULT_EASING = Easing.bezier(0.25, 1, 0.5, 1)
