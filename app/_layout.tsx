import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack, usePathname, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState, useRef } from 'react'
import { Platform, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import 'react-native-reanimated'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { ReduceMotionProvider } from '@/hooks/useReduceMotion'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { LoadingFallback } from '@/components/shared/LoadingFallback'
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
  const colorScheme = useColorScheme()
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const fontTimeout = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      fontTimeout.current = true
      setFontsLoaded(true)
    }, 5000)

    Font.loadAsync({
      Inter: { 400: Inter_400Regular, 500: Inter_500Medium, 600: Inter_600SemiBold, 700: Inter_700Bold } as any,
      Manrope: { 400: Manrope_400Regular, 500: Manrope_500Medium, 600: Manrope_600SemiBold, 700: Manrope_700Bold, 800: Manrope_800ExtraBold } as any,
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
    return <LoadingFallback />
  }

  return (
    <SafeAreaProvider>
      <ReduceMotionProvider>
        <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
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
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={colorScheme === 'dark' ? Colors.dark.surface : Colors.light.surface} />
        </AuthGate>
      </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
        </ThemeProvider>
      </ReduceMotionProvider>
    </SafeAreaProvider>
  )
}
