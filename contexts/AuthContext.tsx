import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useSession, authClient } from '@/lib/auth-client'
import { ActivityIndicator, View } from 'react-native'
import { Colors } from '@/constants/theme'
import * as SecureStore from 'expo-secure-store'
import { on } from '@/lib/events'

const SESSION_CACHE_KEY = 'orbitapp_session_cache'
const BEARER_TOKEN_KEY = 'orbitapp_bearer_token'

interface AuthContextValue {
  session: ReturnType<typeof useSession>['data']
  isPending: boolean
  isAuthenticated: boolean
  authError: string | null
  signOut: () => Promise<void>
  handleAuthError: (error: any) => void
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isPending: true,
  isAuthenticated: false,
  authError: null,
  signOut: async () => {},
  handleAuthError: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: liveSession, isPending: livePending, error: liveError } = useSession()
  const [cachedSession, setCachedSession] = useState<any>(null)
  const [cacheLoaded, setCacheLoaded] = useState(false)
  const [signedOut, setSignedOut] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const signOutRef = useRef<(() => Promise<void>) | null>(null)

  // Listen to live error — if session fetch failed, check if it's a 401
  useEffect(() => {
    if (liveError) {
      const status = (liveError as any)?.status
      if (status === 401) {
        setAuthError('Your session has expired. Please sign in again.')
        SecureStore.deleteItemAsync(SESSION_CACHE_KEY).catch(() => {})
        SecureStore.deleteItemAsync(BEARER_TOKEN_KEY).catch(() => {})
      } else {
        setAuthError('Unable to verify your session. Please try again.')
      }
    }
  }, [liveError])

  // Listen for auth:expired events from the API interceptor
  useEffect(() => {
    const unsub = on('auth:expired', (error: any) => {
      const msg = error?.userMessage || 'Your session has expired. Please sign in again.'
      setAuthError(msg)
      setSignedOut(true)
      setCachedSession(null)
    })
    return unsub
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setCacheLoaded(true)
    }, 3000)

    SecureStore.getItemAsync(SESSION_CACHE_KEY).then((cached) => {
      clearTimeout(timer)
      if (cached) {
        try {
          setCachedSession(JSON.parse(cached))
        } catch {
          // Invalid cache, ignore
        }
      }
      setCacheLoaded(true)
    }).catch(() => {
      clearTimeout(timer)
      setCacheLoaded(true)
    })

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (liveSession) {
      SecureStore.setItemAsync(SESSION_CACHE_KEY, JSON.stringify(liveSession)).catch(() => {})
      // Clear any auth error once session is re-established
      setAuthError(null)
    }
  }, [liveSession])

  const session = signedOut ? null : (liveSession ?? cachedSession)
  const isPending = livePending && !cacheLoaded
  const isAuthenticated = !!session

  const signOut = useCallback(async () => {
    setSignedOut(true)
    setCachedSession(null)
    setAuthError(null)
    await Promise.all([
      SecureStore.deleteItemAsync(BEARER_TOKEN_KEY).catch(() => {}),
      SecureStore.deleteItemAsync(SESSION_CACHE_KEY).catch(() => {}),
    ])
    try {
      await authClient.signOut()
    } catch {
      // already signed out locally
    }
  }, [])

  signOutRef.current = signOut

  const handleAuthError = useCallback(async (error: any) => {
    const msg = error?.userMessage || 'Your session has expired. Please sign in again.'
    setAuthError(msg)
    setSignedOut(true)
    setCachedSession(null)
    await Promise.all([
      SecureStore.deleteItemAsync(BEARER_TOKEN_KEY),
      SecureStore.deleteItemAsync(SESSION_CACHE_KEY),
    ]).catch(() => {})
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        isPending,
        isAuthenticated,
        authError,
        signOut,
        handleAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export async function cacheSessionFromLogin(session: any) {
  if (session) {
    await SecureStore.setItemAsync(SESSION_CACHE_KEY, JSON.stringify(session))
  }
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
