import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { ApplicationForm, type ApplicationFormValues } from '@/components/applications/ApplicationForm'
import { useCreateApplication } from '@/features/applications/api/useApplications'

export default function NewApplicationScreen() {
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
      router.back()
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to create application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.onSurface} />
        </Pressable>
        <Text style={styles.title}>
          New Application
        </Text>
      </View>
      <ApplicationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  title: { fontSize: Typography.headline.sm, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline },
})
