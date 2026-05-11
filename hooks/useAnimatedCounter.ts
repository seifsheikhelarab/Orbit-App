import { useEffect, useRef, useState } from 'react'

interface UseAnimatedCounterOptions {
  duration?: number
  delay?: number
  decimals?: number
  enabled?: boolean
}

export function useAnimatedCounter(
  target: number,
  { duration = 1200, delay = 0, decimals = 0, enabled = true }: UseAnimatedCounterOptions = {}
) {
  const [displayValue, setDisplayValue] = useState(0)
  const frameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(target)
      return
    }

    const startDelay = setTimeout(() => {
      startTimeRef.current = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        const currentValue = eased * target
        setDisplayValue(currentValue)

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate)
        }
      }

      frameRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(startDelay)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, duration, delay, decimals, enabled])

  return displayValue
}

export function formatCounter(
  value: number,
  options: { decimals?: number; suffix?: string; prefix?: string } = {}
): string {
  const { decimals = 0, suffix = '', prefix = '' } = options
  return `${prefix}${value.toFixed(decimals)}${suffix}`
}
