import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { Spinner } from '@/components/ui/spinner'
import { ApplicationForm, type ApplicationFormValues } from '@/components/applications/ApplicationForm'
import { useApplication, useUpdateApplication, useDeleteApplication } from '@/features/applications/api/useApplications'

export default function EditApplicationScreen() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: response, isLoading, isError, error } = useApplication(id!)
  const updateApplication = useUpdateApplication()
  const deleteApplication = useDeleteApplication()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (data: ApplicationFormValues) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined,
      }
      await updateApplication.mutateAsync({ id: id!, data: payload })
      router.back()
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update application')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteApplication.mutateAsync(id!)
      router.replace('/(tabs)/applications' as any)
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to delete application')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Spinner size="large" />
      </View>
    )
  }

  if (isError) {
    return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <View style={styles.loading}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.light.error} />
          <Text style={styles.errorText}>Failed to load application</Text>
          <Text style={styles.errorDetail}>{error?.message || 'An unexpected error occurred'}</Text>
        </View>
      </View>
    )
  }

  if (!response?.data) return null

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.onSurface} />
        </Pressable>
        <Text style={styles.title}>Edit Application</Text>
        <View style={{ width: 24 }} />
      </View>
      <ApplicationForm
        initialData={response.data}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: Typography.headline.sm, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline },
  errorText: { fontSize: Typography.title.lg, fontWeight: '600', color: Colors.light.error, marginTop: 16, fontFamily: Fonts.headline },
  errorDetail: { fontSize: Typography.body.sm, color: Colors.light.onSurfaceVariant, marginTop: 8, textAlign: 'center', fontFamily: Fonts.body },
})
