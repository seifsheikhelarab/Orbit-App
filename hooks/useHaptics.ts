import { useCallback } from 'react'
import * as Haptics from 'expo-haptics'
import { Platform } from 'react-native'

const isIOS = Platform.OS === 'ios'

export function useHaptics() {
  const light = useCallback(() => {
    if (isIOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    }
  }, [])

  const medium = useCallback(() => {
    if (isIOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    }
  }, [])

  const heavy = useCallback(() => {
    if (isIOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
    }
  }, [])

  const selection = useCallback(() => {
    if (isIOS) {
      Haptics.selectionAsync().catch(() => {})
    }
  }, [])

  const success = useCallback(() => {
    if (isIOS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
    }
  }, [])

  const warning = useCallback(() => {
    if (isIOS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
    }
  }, [])

  const error = useCallback(() => {
    if (isIOS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
    }
  }, [])

  return { light, medium, heavy, selection, success, warning, error }
}

export function hapticLight() {
  if (isIOS) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
  }
}

export function hapticMedium() {
  if (isIOS) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
  }
}

export function hapticHeavy() {
  if (isIOS) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
  }
}

export function hapticSelection() {
  if (isIOS) {
    Haptics.selectionAsync().catch(() => {})
  }
}

export function hapticSuccess() {
  if (isIOS) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
  }
}

export function hapticWarning() {
  if (isIOS) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
  }
}

export function hapticError() {
  if (isIOS) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
  }
}
