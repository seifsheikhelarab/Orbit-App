import { useState, useMemo, useRef, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { signUp, signIn } from '@/lib/auth-client'
import { cacheSessionFromLogin } from '@/contexts/AuthContext'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function getPasswordStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  if (pw.length === 0) return { level: 0, label: '', color: Colors.light.onSurfaceVariant, barColor: 'transparent', width: '0%' }
  if (score <= 1) return { level: 1, label: 'Weak', color: Colors.light.error, barColor: Colors.light.error, width: '25%' }
  if (score === 2) return { level: 2, label: 'Fair', color: Colors.light.warning, barColor: Colors.light.warning, width: '50%' }
  if (score === 3) return { level: 3, label: 'Good', color: Colors.light.primary, barColor: Colors.light.primary, width: '75%' }
  return { level: 4, label: 'Strong', color: Colors.light.success, barColor: Colors.light.success, width: '100%' }
}

export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [])

  const strength = useMemo(() => getPasswordStrength(password), [password])

  const handleRegister = async () => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    const { error, data } = await signUp.email({
      email,
      password,
      name,
      callbackURL: '/',
    })
    if (error) {
      setErrorMsg(error.message || 'Registration failed')
      setLoading(false)
    } else if (data) {
      await cacheSessionFromLogin(data)
      setSuccessMsg('Account created! Redirecting...')
      setLoading(false)
      setTimeout(() => router.replace('/(tabs)' as any), 1500)
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <Ionicons name="rocket-outline" size={48} color={Colors.light.primary} style={styles.logo} />
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start your journey with Orbit today.</Text>
          </View>

          <Button variant="outline" onPress={handleGoogle}><Ionicons name="logo-google" size={20} /><Text> Sign up with Google</Text></Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {successMsg ? (
            <View style={[styles.errorBanner, { backgroundColor: Colors.light.successContainer }]}>
              <Ionicons name="mail-outline" size={16} color={Colors.light.success} />
              <Text style={[styles.errorText, { color: Colors.light.success }]}>{successMsg}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Alex Rivera"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="alex@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                right={
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.light.outline} />
                  </Pressable>
                }
              />

              {password.length > 0 ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor: i <= strength.level ? strength.barColor : Colors.light.outlineVariant,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.strengthLabel}>
                    <Ionicons
                      name={strengthIcon(strength.level) as any}
                      size={12}
                      color={strength.color}
                    />
                    <Text style={[styles.strengthText, { color: strength.color }]}>
                      {strength.label} password
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>

            <Button onPress={handleRegister} loading={loading} size="lg">Create Account</Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href={'/(auth)/login' as any} style={styles.footerLink}>
              Log in
            </Link>
          </View>
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
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 32,
    shadowColor: Colors.light.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    marginBottom: 16,
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
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    letterSpacing: 0.5,
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
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  eyeButton: {
    padding: 12,
  },
  strengthContainer: {
    marginTop: 8,
    gap: 6,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.outlineVariant,
  },
  strengthLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strengthText: {
    fontSize: Typography.label.sm,
    fontFamily: Fonts.body,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    color: Colors.light.primary,
  },
})
