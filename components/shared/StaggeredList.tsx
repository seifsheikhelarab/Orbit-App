import { Children, useEffect, useRef } from 'react'
import { View, type ViewStyle } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withTiming, withSpring, type WithSpringConfig } from 'react-native-reanimated'

interface StaggeredListProps {
  children: React.ReactNode
  staggerDelay?: number
  initialDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  spring?: boolean
  style?: ViewStyle
}

const springConfig: WithSpringConfig = {
  damping: 20,
  stiffness: 150,
  mass: 0.8,
}

function StaggeredItem({
  children,
  index,
  staggerDelay,
  initialDelay,
  direction,
  spring,
}: {
  children: React.ReactNode
  index: number
  staggerDelay: number
  initialDelay: number
  direction: 'up' | 'down' | 'left' | 'right'
  spring: boolean
}) {
  const offsetMap = {
    up: { x: 0, y: 24 },
    down: { x: 0, y: -24 },
    left: { x: 24, y: 0 },
    right: { x: -24, y: 0 },
  }

  const offset = offsetMap[direction]
  const delay = initialDelay + index * staggerDelay

  const opacity = useSharedValue(0)
  const translateX = useSharedValue(offset.x)
  const translateY = useSharedValue(offset.y)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }))

  const childrenRef = useRef(children)
  childrenRef.current = children

  useEffect(() => {
    const animConfig = spring
      ? { withDelay, withSpring: (val: number, cfg: WithSpringConfig) => withSpring(val, cfg) }
      : { withDelay, withTiming: (val: number) => withTiming(val, { duration: 400 }) }

    opacity.value = withDelay(delay, spring
      ? withSpring(1, springConfig)
      : withTiming(1, { duration: 400 })
    )
    translateX.value = withDelay(delay, spring
      ? withSpring(0, springConfig)
      : withTiming(0, { duration: 400 })
    )
    translateY.value = withDelay(delay, spring
      ? withSpring(0, springConfig)
      : withTiming(0, { duration: 400 })
    )
  }, [spring, childrenRef])

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  )
}

export default function StaggeredList({
  children,
  staggerDelay = 60,
  initialDelay = 100,
  direction = 'up',
  spring = true,
  style,
}: StaggeredListProps) {
  useRef(Children.count(children))
  return (
    <View style={style}>
      {Children.map(children, (child, index) =>
        child ? (
          <StaggeredItem
            key={index}
            index={index}
            staggerDelay={staggerDelay}
            initialDelay={initialDelay}
            direction={direction}
            spring={spring}
          >
            {child}
          </StaggeredItem>
        ) : null
      )}
    </View>
  )
}

export { StaggeredList }
export type { StaggeredListProps }
