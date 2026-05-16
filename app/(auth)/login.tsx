import { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { signIn } from '@/lib/auth-client'
import { cacheSessionFromLogin } from '@/contexts/AuthContext'
import { Colors, Typography, Fonts, Shadows } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const DECORATIVE_DOTS = [
  { top: '12%', left: '8%', size: 6, opacity: 0.25 },
  { top: '20%', right: '12%', size: 4, opacity: 0.15 },
  { top: '45%', left: '4%', size: 8, opacity: 0.1 },
  { top: '65%', right: '6%', size: 5, opacity: 0.2 },
  { top: '82%', left: '16%', size: 3, opacity: 0.18 },
]

export default function LoginScreen() {
  const colors = useColors()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const entrance = useRef([...Array(5)].map(() => new Animated.Value(0))).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    entrance.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: i * 100,
        useNativeDriver: true,
      }).start()
    })
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setErrorMsg('')
    const { error, data } = await signIn.email({ email, password })
    if (error) {
      setErrorMsg(error.message || 'Login failed')
      setLoading(false)
    } else {
      await cacheSessionFromLogin(data)
      router.replace('/(tabs)' as const)
    }
  }

  const handleGoogle = async () => {
    const { error } = await signIn.social({ provider: 'google' })
    if (!error) router.replace('/(tabs)' as const)
  }

  const staggerStyle = (index: number) => ({
    opacity: entrance[index],
    transform: [{ translateY: entrance[index].interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  })

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {DECORATIVE_DOTS.map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.decorativeDot, {
              top: dot.top as any,
              left: (dot as any).left,
              right: (dot as any).right,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              opacity: dot.opacity,
              transform: [{ scale: Animated.multiply(pulseAnim, 1) }] as any,
            }]}
          />
        ))}
        <View style={styles.orbitalRing} />

        <Animated.View style={[styles.card, staggerStyle(0)]}>
          <View style={styles.accentBar} />

          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Ionicons name="rocket-outline" size={36} color={colors.accent} />
            </View>
            <Text style={styles.badgeText}>ORBIT ACCESS</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Authenticate to access mission control.</Text>
          </View>

          <Animated.View style={staggerStyle(1)}>
            <Button variant="outline" onPress={handleGoogle}>
              <Ionicons name="logo-google" size={18} color={colors.onSurfaceVariant} />
              <Text style={{ color: colors.onSurface }}>  Sign in with Google</Text>
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with credentials</Text>
              <View style={styles.dividerLine} />
            </View>
          </Animated.View>

          {errorMsg ? (
            <Animated.View style={[styles.errorBanner, staggerStyle(2)]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </Animated.View>
          ) : null}

          <Animated.View style={[styles.form, staggerStyle(2)]}>
            <View style={styles.field}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD</Text>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                right={
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} accessibilityRole="button">
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.outline} />
                  </Pressable>
                }
              />
            </View>
            <View style={styles.helpers}>
              <Link href={'/(auth)/forgot-password' as any} style={styles.forgotLink}>Reset credentials</Link>
            </View>
          </Animated.View>

          <Animated.View style={staggerStyle(3)}>
            <Button onPress={handleLogin} loading={loading} size="lg">Authenticate</Button>
          </Animated.View>

          <Animated.View style={[styles.footer, staggerStyle(4)]}>
            <Text style={styles.footerText}>No access credentials? </Text>
            <Link href={'/(auth)/register' as any} style={styles.footerLink}>Request access</Link>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 48,
  },
  decorativeDot: {
    position: 'absolute',
    backgroundColor: Colors.light.accent,
    zIndex: 0,
  },
  orbitalRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: Colors.light.accent + '12',
    top: '5%',
    right: -60,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 32,
    ...Shadows.xl,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.light.accent,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.light.accentContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    fontWeight: '700',
    color: Colors.light.accent,
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: Typography.headline.lg,
    fontFamily: Fonts.headline,
    fontWeight: '800',
    color: Colors.light.onSurface,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.outlineVariant,
  },
  dividerText: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    marginHorizontal: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.errorContainer,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: Colors.light.error,
    fontWeight: '500',
    flex: 1,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    fontWeight: '700',
    color: Colors.light.onSurface,
    letterSpacing: 0.8,
  },
  eyeButton: {
    padding: 12,
  },
  helpers: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  forgotLink: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    fontWeight: '600',
    color: Colors.light.accent,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
  },
  footerLink: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    fontWeight: '700',
    color: Colors.light.accent,
  },
})
