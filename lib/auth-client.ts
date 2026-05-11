import { createAuthClient } from 'better-auth/react'
import { expoClient } from '@better-auth/expo/client'
import * as SecureStore from 'expo-secure-store'

const BEARER_TOKEN_KEY = 'orbitapp_bearer_token'
const SESSION_CACHE_KEY = 'orbitapp_session_cache'

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_AUTH_URL || "http://192.168.1.37:5726",
  plugins: [
    expoClient({
      scheme: 'orbitapp',
      storagePrefix: 'orbitapp',
      storage: SecureStore,
    }),
  ],
  fetchOptions: {
    onSuccess: async (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token")
      if (authToken) {
        try {
          await SecureStore.setItemAsync(BEARER_TOKEN_KEY, authToken)
        } catch {
          // ignored
        }
      }
    },
  },
})

export const { signIn, signUp, useSession } = authClient

export const signOut = async (options?: Parameters<typeof authClient.signOut>[0]) => {
  try {
    await SecureStore.deleteItemAsync(BEARER_TOKEN_KEY)
    await SecureStore.deleteItemAsync(SESSION_CACHE_KEY)
  } catch {
    // ignored
  }
  return authClient.signOut(options)
}
