import { createContext, useContext, useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

const ReduceMotionContext = createContext(false)

export function ReduceMotionProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => listener.remove()
  }, [])

  return (
    <ReduceMotionContext.Provider value={reduceMotion}>
      {children}
    </ReduceMotionContext.Provider>
  )
}

export function useReduceMotion() {
  return useContext(ReduceMotionContext)
}
