import { useState, useEffect, useRef, useMemo } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { signIn } from '@/lib/auth-client'
import { cacheSessionFromLogin } from '@/contexts/AuthContext'
import { Colors, Typography, Fonts, getShadows } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { useReduceMotion } from '@/hooks/useReduceMotion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  createStaggerValues,
  animateStagger,
  staggerStyle,
  AnimationTiming,
} from '@/constants/animations'

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

  const reduceMotion = useReduceMotion()
  const staggerVals = useRef(createStaggerValues(5, 0, 12)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    animateStagger(staggerVals.opacities, staggerVals.translates, {
      baseDelay: 0,
      staggerMs: 100,
      startY: 12,
      reduced: reduceMotion,
    })
    if (!reduceMotion) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.5, ...AnimationTiming.easeOutQuart(2500) }),
          Animated.timing(pulseAnim, { toValue: 1, ...AnimationTiming.easeOutQuart(2500) }),
        ])
      ).start()
    }
  }, [reduceMotion])

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

  const getStaggerStyle = (index: number) =>
    staggerStyle(staggerVals.opacities[index], staggerVals.translates[index], 12)

  const styles = useMemo(() => getStyles(colors), [colors])

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

        <Animated.View style={[styles.card, getStaggerStyle(0)]}>
          <View style={styles.accentBar} />

          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Ionicons name="rocket-outline" size={36} color={colors.accent} />
            </View>
            <Text style={styles.badgeText}>ORBIT ACCESS</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Authenticate to access mission control.</Text>
          </View>

          <Animated.View style={getStaggerStyle(1)}>
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
            <Animated.View style={[styles.errorBanner, getStaggerStyle(2)]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </Animated.View>
          ) : null}

          <Animated.View style={[styles.form, getStaggerStyle(2)]}>
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

          <Animated.View style={getStaggerStyle(3)}>
            <Button onPress={handleLogin} loading={loading} size="lg">Authenticate</Button>
          </Animated.View>

          <Animated.View style={[styles.footer, getStaggerStyle(4)]}>
            <Text style={styles.footerText}>No access credentials? </Text>
            <Link href={'/(auth)/register' as any} style={styles.footerLink}>Request access</Link>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function getStyles(c: typeof Colors.light) {
  const s = getShadows(c)
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
      paddingVertical: 48,
    },
    decorativeDot: {
      position: 'absolute',
      backgroundColor: c.accent,
      zIndex: 0,
    },
    orbitalRing: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      borderWidth: 1,
      borderColor: c.accent + '12',
      top: '5%',
      right: -60,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 20,
      padding: 32,
      ...s.xl,
      overflow: 'hidden',
    },
    accentBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: c.accent,
    },
    header: {
      alignItems: 'center',
      marginBottom: 28,
    },
    logoWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: c.accentContainer,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    badgeText: {
      fontSize: Typography.label.sm,
      fontFamily: Fonts.body,
      fontWeight: '700',
      color: c.accent,
      letterSpacing: 2,
      marginBottom: 8,
    },
    title: {
      fontSize: Typography.headline.lg,
      fontFamily: Fonts.headline,
      fontWeight: '800',
      color: c.onSurface,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: Typography.body.sm,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
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
      backgroundColor: c.outlineVariant,
    },
    dividerText: {
      fontSize: Typography.label.sm,
      fontFamily: Fonts.body,
      color: c.onSurfaceVariant,
      marginHorizontal: 16,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.errorContainer,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      fontSize: Typography.body.sm,
      fontFamily: Fonts.body,
      color: c.error,
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
      color: c.onSurface,
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
      color: c.accent,
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
      color: c.onSurfaceVariant,
    },
    footerLink: {
      fontSize: Typography.body.sm,
      fontFamily: Fonts.body,
      fontWeight: '700',
      color: c.accent,
    },
  })
}
