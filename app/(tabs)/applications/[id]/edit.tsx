import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Spinner } from '@/components/ui/spinner'
import { ApplicationForm, type ApplicationFormValues } from '@/components/applications/ApplicationForm'
import { useApplication, useUpdateApplication, useDeleteApplication } from '@/features/applications/api/useApplications'

export default function EditApplicationScreen() {
  const colors = useColors()
  const s = getStyles(colors)
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
      router.replace('/(tabs)/applications' as const)
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to delete application')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <View style={s.loading}>
        <Spinner size="large" />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.loading}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={s.errorText}>Failed to load application</Text>
          <Text style={s.errorDetail}>{error?.message || 'An unexpected error occurred'}</Text>
        </View>
      </View>
    )
  }

  if (!response?.data) return null

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <Pressable onPress={() => router.back()} style={s.backBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={s.title}>Edit Application</Text>
        <View style={s.backBtn} />
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

const getStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background, gap: 12 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 20,
    borderBottomWidth: 1, borderBottomColor: c.outlineVariant,
    backgroundColor: c.surface,
  },
  backBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.headline.sm, fontWeight: '700', color: c.onSurface, fontFamily: Fonts.headline, flex: 1, textAlign: 'center' },
  errorText: { fontSize: Typography.title.lg, fontWeight: '600', color: c.error, fontFamily: Fonts.headline },
  errorDetail: { fontSize: Typography.body.sm, color: c.onSurfaceVariant, textAlign: 'center', fontFamily: Fonts.body },
})

const styles = getStyles(Colors.light)
