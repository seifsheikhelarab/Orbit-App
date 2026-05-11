import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useSession, authClient } from '@/lib/auth-client'
import { ActivityIndicator, View } from 'react-native'
import { Colors } from '@/constants/theme'
import * as SecureStore from 'expo-secure-store'

const SESSION_CACHE_KEY = 'orbitapp_session_cache'
const BEARER_TOKEN_KEY = 'orbitapp_bearer_token'

interface AuthContextValue {
  session: ReturnType<typeof useSession>['data']
  isPending: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isPending: true,
  isAuthenticated: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: liveSession, isPending: livePending } = useSession()
  const [cachedSession, setCachedSession] = useState<any>(null)
  const [cacheLoaded, setCacheLoaded] = useState(false)
  const [signedOut, setSignedOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setCacheLoaded(true)
    }, 3000)

    SecureStore.getItemAsync(SESSION_CACHE_KEY).then((cached) => {
      clearTimeout(timer)
      if (cached) {
        setCachedSession(JSON.parse(cached))
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
      SecureStore.setItemAsync(SESSION_CACHE_KEY, JSON.stringify(liveSession))
    }
  }, [liveSession])

  const session = signedOut ? null : (liveSession ?? cachedSession)
  const isPending = livePending && !cacheLoaded
  const isAuthenticated = !!session

  const signOut = useCallback(async () => {
    setSignedOut(true)
    setCachedSession(null)
    await Promise.all([
      SecureStore.deleteItemAsync(BEARER_TOKEN_KEY),
      SecureStore.deleteItemAsync(SESSION_CACHE_KEY),
    ])
    try {
      await authClient.signOut()
    } catch {
      // already signed out locally
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        isPending,
        isAuthenticated,
        signOut,
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
