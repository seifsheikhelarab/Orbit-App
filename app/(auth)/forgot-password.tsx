import { useState, useRef, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordScreen() {
  const colors = useColors()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(12)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [])

  const handleSubmit = async () => {
    if (!email) return
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.sentContainer}>
              <View style={styles.sentIcon}>
                  <Ionicons name="checkmark-circle" size={40} color={colors.success} />
              </View>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We sent a password reset link to{' '}
                <Text style={styles.emailText}>{email}</Text>. Check your inbox and follow the
                instructions.
              </Text>
              <Link href={'/(auth)/login' as any} style={styles.backLink}>
                <Ionicons name="arrow-back" size={16} color={colors.primary} />
                <Text style={styles.backLinkText}> Back to login</Text>
              </Link>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
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
          <Link href={'/(auth)/login' as any} style={styles.backLink}>
            <Ionicons name="arrow-back" size={16} color={colors.onSurfaceVariant} />
            <Text style={styles.backLinkSubText}> Back to login</Text>
          </Link>

          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={28} color={colors.primary} />
          </View>

          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>

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

          <Button onPress={handleSubmit} loading={loading} size="lg">Send Reset Link</Button>
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
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backLinkSubText: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
  },
  backLinkText: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.accentContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.headline.md,
    fontFamily: Fonts.headline,
    fontWeight: '700',
    color: Colors.light.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    color: Colors.light.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: 24,
  },
  emailText: {
    fontWeight: '700',
    color: Colors.light.onSurface,
  },
  sentContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  sentIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.successContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  field: {
    gap: 6,
    marginBottom: 20,
  },
  label: {
    fontSize: Typography.body.sm,
    fontFamily: Fonts.body,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },

})
