import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { signUp, signIn } from '@/lib/auth-client'
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
} from '@/constants/animations'

function getPasswordStrength(pw: string, c: typeof Colors.light) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  if (pw.length === 0) return { level: 0, label: '', color: c.onSurfaceVariant, barColor: 'transparent', width: '0%' }
  if (score <= 1) return { level: 1, label: 'WEAK', color: c.error, barColor: c.error, width: '25%' }
  if (score === 2) return { level: 2, label: 'FAIR', color: c.warning, barColor: c.warning, width: '50%' }
  if (score === 3) return { level: 3, label: 'GOOD', color: c.primary, barColor: c.primary, width: '75%' }
  return { level: 4, label: 'STRONG', color: c.success, barColor: c.success, width: '100%' }
}

const DECORATIVE_DOTS = [
  { top: '8%', right: '10%', size: 5, opacity: 0.2 },
  { top: '18%', left: '6%', size: 7, opacity: 0.15 },
  { top: '40%', right: '4%', size: 4, opacity: 0.25 },
  { top: '60%', left: '12%', size: 6, opacity: 0.12 },
  { top: '78%', right: '14%', size: 3, opacity: 0.2 },
]

export default function RegisterScreen() {
  const colors = useColors()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const reduceMotion = useReduceMotion()
  const staggerVals = useRef(createStaggerValues(5, 0, 12)).current

  useEffect(() => {
    animateStagger(staggerVals.opacities, staggerVals.translates, {
      baseDelay: 0,
      staggerMs: 100,
      startY: 12,
      reduced: reduceMotion,
    })
  }, [reduceMotion])

  const strength = useMemo(() => getPasswordStrength(password, colors), [password, colors])

  const handleRegister = async () => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    const { error, data } = await signUp.email({ email, password, name, callbackURL: '/' })
    if (error) {
      setErrorMsg(error.message || 'Registration failed')
      setLoading(false)
    } else if (data) {
      await cacheSessionFromLogin(data)
      setSuccessMsg('Access granted. Redirecting...')
      setLoading(false)
      setTimeout(() => router.replace('/(tabs)' as const), 1500)
    }
  }

  const handleGoogle = async () => {
    await signIn.social({ provider: 'google' })
  }

  const strengthIcon = (level: number) => {
    if (level <= 1) return 'close-circle'
    if (level === 2) return 'warning'
    return 'shield-checkmark'
  }

  const getStaggerStyle = (index: number) =>
    staggerStyle(staggerVals.opacities[index], staggerVals.translates[index], 12)

  const styles = useMemo(() => getStyles(colors), [colors])

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {DECORATIVE_DOTS.map((dot, i) => (
          <View
            key={i}
            style={[styles.decorativeDot, {
              top: dot.top as any,
              left: (dot as any).left,
              right: (dot as any).right,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              opacity: dot.opacity,
              backgroundColor: colors.primary,
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
            <Text style={styles.badgeText}>NEW PERSONNEL</Text>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Establish your mission credentials.</Text>
          </View>

          <Animated.View style={getStaggerStyle(1)}>
            <Button variant="outline" onPress={handleGoogle}>
              <Ionicons name="logo-google" size={18} color={colors.onSurfaceVariant} />
              <Text style={{ color: colors.onSurface }}>  Sign up with Google</Text>
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or register with email</Text>
              <View style={styles.dividerLine} />
            </View>
          </Animated.View>

          {errorMsg ? (
            <Animated.View style={[styles.errorBanner, getStaggerStyle(2)]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </Animated.View>
          ) : null}

          {successMsg ? (
            <Animated.View style={[styles.successBanner, getStaggerStyle(2)]}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
              <Text style={styles.successText}>{successMsg}</Text>
            </Animated.View>
          ) : null}

          <Animated.View style={[styles.form, getStaggerStyle(2)]}>
            <View style={styles.field}>
              <Text style={styles.label}>FULL NAME</Text>
              <Input value={name} onChangeText={setName} placeholder="Alex Rivera" autoCapitalize="words" />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <Input
                value={email} onChangeText={setEmail} placeholder="alex@example.com"
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>PASSWORD</Text>
              <Input
                value={password} onChangeText={setPassword} placeholder="Enter your password"
                secureTextEntry={!showPassword} autoCapitalize="none"
                right={
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton} accessibilityRole="button">
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.outline} />
                  </Pressable>
                }
              />
              {password.length > 0 ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((i) => (
                      <View key={i} style={[styles.strengthBar, { backgroundColor: i <= strength.level ? strength.barColor : colors.outlineVariant }]} />
                    ))}
                  </View>
                  <View style={styles.strengthLabel}>
                    <Ionicons name={strengthIcon(strength.level) as any} size={12} color={strength.color} />
                    <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label} PASSWORD</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </Animated.View>

          <Animated.View style={getStaggerStyle(3)}>
            <Button onPress={handleRegister} loading={loading} size="lg">Create Account</Button>
          </Animated.View>

          <Animated.View style={[styles.footer, getStaggerStyle(4)]}>
            <Text style={styles.footerText}>Already registered? </Text>
            <Link href={'/(auth)/login' as any} style={styles.footerLink}>Sign in</Link>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function getStyles(c: typeof Colors.light) {
  const s = getShadows(c)
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 48 },
    decorativeDot: { position: 'absolute', zIndex: 0 },
    orbitalRing: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 1,
      borderColor: c.accent + '10',
      bottom: '10%',
      left: -50,
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
    header: { alignItems: 'center', marginBottom: 28 },
    logoWrap: {
      width: 64, height: 64, borderRadius: 20,
      backgroundColor: c.accentContainer,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
    },
    badgeText: {
      fontSize: Typography.label.sm, fontFamily: Fonts.body,
      fontWeight: '700', color: c.accent,
      letterSpacing: 2, marginBottom: 8,
    },
    title: {
      fontSize: Typography.headline.lg, fontFamily: Fonts.headline,
      fontWeight: '800', color: c.onSurface,
      letterSpacing: -0.5, marginBottom: 8,
    },
    subtitle: {
      fontSize: Typography.body.sm, fontFamily: Fonts.body,
      color: c.onSurfaceVariant, letterSpacing: 0.3,
    },
    divider: {
      flexDirection: 'row', alignItems: 'center', marginVertical: 20,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.outlineVariant },
    dividerText: {
      fontSize: Typography.label.sm, fontFamily: Fonts.body,
      color: c.onSurfaceVariant, marginHorizontal: 16,
      letterSpacing: 0.8, textTransform: 'uppercase',
    },
    errorBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: c.errorContainer, borderRadius: 8,
      padding: 12, marginBottom: 16,
    },
    errorText: {
      fontSize: Typography.body.sm, fontFamily: Fonts.body,
      color: c.error, fontWeight: '500', flex: 1,
    },
    successBanner: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: c.successContainer, borderRadius: 8,
      padding: 12, marginBottom: 16,
    },
    successText: {
      fontSize: Typography.body.sm, fontFamily: Fonts.body,
      color: c.success, fontWeight: '500', flex: 1,
    },
    form: { gap: 20 },
    field: { gap: 6 },
    label: {
      fontSize: Typography.label.sm, fontFamily: Fonts.body,
      fontWeight: '700', color: c.onSurface, letterSpacing: 0.8,
    },
    eyeButton: { padding: 12 },
    strengthContainer: { marginTop: 8, gap: 6 },
    strengthBars: { flexDirection: 'row', gap: 6 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: c.outlineVariant },
    strengthLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    strengthText: {
      fontSize: Typography.label.sm, fontFamily: Fonts.body,
      fontWeight: '700', letterSpacing: 0.8,
    },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
    footerText: { fontSize: Typography.body.sm, fontFamily: Fonts.body, color: c.onSurfaceVariant },
    footerLink: { fontSize: Typography.body.sm, fontFamily: Fonts.body, fontWeight: '700', color: c.accent },
  })
}
