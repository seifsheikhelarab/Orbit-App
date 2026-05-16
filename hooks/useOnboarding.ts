import { useState, useEffect, useCallback } from 'react'
import * as SecureStore from 'expo-secure-store'

const ONBOARDING_KEY = 'orbitapp_onboarding_completed'
const SEEN_TIPS_KEY = 'orbitapp_seen_tips'

export function useOnboarding() {
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(true)

  useEffect(() => {
    SecureStore.getItemAsync(ONBOARDING_KEY).then((val) => {
      setCompleted(val === 'true')
      setLoading(false)
    }).catch(() => {
      setCompleted(false)
      setLoading(false)
    })
  }, [])

  const complete = useCallback(async () => {
    setCompleted(true)
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true')
  }, [])

  return { onboardingCompleted: completed, loading, complete }
}

export function useFeatureTip(screenId: string) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    SecureStore.getItemAsync(SEEN_TIPS_KEY).then((val) => {
      const seen: Record<string, boolean> = val ? JSON.parse(val) : {}
      if (seen[screenId]) setVisible(false)
    }).catch(() => {})
  }, [screenId])

  const dismiss = useCallback(async () => {
    setVisible(false)
    const raw = await SecureStore.getItemAsync(SEEN_TIPS_KEY)
    const seen: Record<string, boolean> = raw ? JSON.parse(raw) : {}
    seen[screenId] = true
    await SecureStore.setItemAsync(SEEN_TIPS_KEY, JSON.stringify(seen))
  }, [screenId])

  return { visible, dismiss }
}
