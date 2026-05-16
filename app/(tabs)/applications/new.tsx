import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as SecureStore from 'expo-secure-store'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { ApplicationForm, type ApplicationFormValues } from '@/components/applications/ApplicationForm'
import { useCreateApplication } from '@/features/applications/api/useApplications'

export default function NewApplicationScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const createApplication = useCreateApplication()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: ApplicationFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined,
      }
      await createApplication.mutateAsync(payload)
      await SecureStore.setItemAsync('orbitapp_first_app_created', 'true')
      router.back()
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>New Application</Text>
        <View style={styles.backBtn} />
      </View>
      <ApplicationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.light.outlineVariant,
    backgroundColor: Colors.light.surface,
  },
  backBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.headline.sm, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline, flex: 1, textAlign: 'center' },
})
