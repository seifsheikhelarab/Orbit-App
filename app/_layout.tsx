import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack, usePathname, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState, useRef } from 'react'
import { ActivityIndicator, Platform, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-reanimated'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Colors } from '@/constants/theme'
import * as Font from 'expo-font'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
    },
  },
})

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isPending } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isPending) return

    const inAuthGroup = AUTH_ROUTES.some((route) => pathname.startsWith(route))

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [isAuthenticated, isPending, pathname])

  return <>{children}</>
}

export const unstable_settings = {
  anchor: '(tabs)',
}

const isNative = Platform.OS === 'ios' || Platform.OS === 'android'

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const fontTimeout = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      fontTimeout.current = true
      setFontsLoaded(true)
    }, 5000)

    Font.loadAsync({
      Inter: {
        400: Inter_400Regular,
        500: Inter_500Medium,
        600: Inter_600SemiBold,
        700: Inter_700Bold,
      },
      Manrope: {
        400: Manrope_400Regular,
        500: Manrope_500Medium,
        600: Manrope_600SemiBold,
        700: Manrope_700Bold,
        800: Manrope_800ExtraBold,
      },
    })
      .then(() => {
        clearTimeout(timer)
        setFontsLoaded(true)
      })
      .catch(() => {
        clearTimeout(timer)
        setFontsLoaded(true)
      })

    return () => clearTimeout(timer)
  }, [])

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: isNative ? 'slide_from_right' : 'default',
              animationDuration: 300,
            }}
          >
            <Stack.Screen
              name="(auth)"
              options={{
                animation: isNative ? 'fade_from_bottom' : 'default',
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                animation: isNative ? 'fade_from_bottom' : 'default',
              }}
            />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                animation: isNative ? 'slide_from_bottom' : 'default',
              }}
            />
          </Stack>
          <StatusBar style="dark" />
        </AuthGate>
      </AuthProvider>
    </QueryClientProvider>
    </SafeAreaProvider>
  )
}
