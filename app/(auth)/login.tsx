import { useState, useEffect, useRef } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { Link, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { signIn } from '@/lib/auth-client'
import { cacheSessionFromLogin } from '@/contexts/AuthContext'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setErrorMsg('')
    const { error, data } = await signIn.email({
      email,
      password,
    })
    if (error) {
      setErrorMsg(error.message || 'Login failed')
      setLoading(false)
    } else {
      await cacheSessionFromLogin(data)
      router.replace('/(tabs)' as any)
    }
  }

  const handleGoogle = async () => {
    const { error } = await signIn.social({
      provider: 'google',
    })
    if (!error) {
      router.replace('/(tabs)' as any)
    }
  }

  const staggeredStyle = (delay: number) => ({
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  })

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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Please enter your details to sign in.</Text>
          </View>

          <Button variant="outline" onPress={handleGoogle}><Ionicons name="logo-google" size={20} /><Text> Login with Google</Text></Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {errorMsg ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.light.error} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
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
            </View>

            <View style={styles.helpers}>
              <Link href={'/(auth)/forgot-password' as any} style={styles.forgotLink}>
                Forgot password?
              </Link>
            </View>

            <Button onPress={handleLogin} loading={loading} size="lg">Sign In</Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href={'/(auth)/register' as any} style={styles.footerLink}>
              Create one
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
  helpers: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  forgotLink: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    fontWeight: '600',
    color: Colors.light.primary,
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
