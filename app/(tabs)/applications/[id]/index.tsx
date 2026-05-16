import React, { useCallback } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingScreen } from '@/components/ui/spinner'
import { ContactsList } from '@/components/applications/ContactsList'
import { InterviewRoundsList } from '@/components/applications/InterviewRoundsList'
import { StatusHistoryTimeline } from '@/components/applications/StatusHistoryTimeline'
import { useApplication } from '@/features/applications/api/useApplications'
import { useContacts, useCreateContact, useDeleteContact, useInterviewRounds, useCreateInterviewRound, useDeleteInterviewRound, useStatusHistory } from '@/features/applications/api/useApplicationDetails'

export default function ApplicationDetailScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: response, isLoading, isError } = useApplication(id!)
  const { data: contacts = [], isLoading: loadingContacts } = useContacts(id!)
  const { data: rounds = [], isLoading: loadingRounds } = useInterviewRounds(id!)
  const { data: history = [], isLoading: loadingHistory } = useStatusHistory(id!)
  const createContact = useCreateContact(id!)
  const deleteContact = useDeleteContact(id!)
  const createRound = useCreateInterviewRound(id!)
  const deleteRound = useDeleteInterviewRound(id!)

  const handleAddContact = useCallback(async (data: Parameters<typeof createContact.mutateAsync>[0]) => {
    await createContact.mutateAsync(data)
  }, [createContact])

  const handleDeleteContact = useCallback(async (contactId: string) => {
    await deleteContact.mutateAsync(contactId)
  }, [deleteContact])

  const handleAddRound = useCallback(async (data: Parameters<typeof createRound.mutateAsync>[0]) => {
    await createRound.mutateAsync(data)
  }, [createRound])

  const handleDeleteRound = useCallback(async (roundId: string) => {
    await deleteRound.mutateAsync(roundId)
  }, [deleteRound])

  if (isLoading) return <LoadingScreen message="Loading application..." />

  if (isError || !response?.data) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Application not found</Text>
        <Text style={styles.errorHint}>This application may have been deleted or the link may be incorrect.</Text>
        <Button onPress={() => router.back()}>Go back to applications</Button>
      </View>
    )
  }

  const app = response.data

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Pressable onPress={() => router.push(`/(tabs)/applications/${id}/edit` as const)} accessibilityRole="button">
          <Ionicons name="create-outline" size={22} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.titleSection}>
        <View style={styles.titleRow}>
          <Text style={styles.company}>{app.company}</Text>
          <StatusBadge status={app.applicationStatus} />
        </View>
        <Text style={styles.jobTitle}>{app.jobTitle}</Text>
      </View>

      <Card variant="elevated" accentPosition="left" accentColor={colors.accent}>
        <CardContent>
          <View style={styles.detailGrid}>
            {app.location && (
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{app.location}</Text>
                </View>
              </View>
            )}
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="cash-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Compensation</Text>
                <Text style={styles.detailValue}>
                  {app.salaryMin || app.salaryMax
                    ? `${app.salaryMin ? `$${app.salaryMin.toLocaleString()}` : '?'} - ${app.salaryMax ? `$${app.salaryMax.toLocaleString()}` : '?'}`
                    : 'Undisclosed'}
                </Text>
              </View>
            </View>
            {app.appliedDate && (
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Applied</Text>
                  <Text style={styles.detailValue}>{new Date(app.appliedDate).toLocaleDateString()}</Text>
                </View>
              </View>
            )}
            {app.jobURL && (
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="link-outline" size={18} color={colors.accent} />
                </View>
                <Pressable onPress={() => Linking.openURL(app.jobURL!)}>
                  <Text style={styles.detailLabel}>Job URL</Text>
                  <Text style={[styles.detailValue, styles.link]}>Open link</Text>
                </Pressable>
              </View>
            )}
          </View>
        </CardContent>
      </Card>

      {app.notes && (
        <Card>
          <CardContent>
            <Text style={styles.sectionTitleSmall}>Notes</Text>
            <Text style={styles.notes}>{app.notes}</Text>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <ContactsList
            contacts={contacts || []}
            isLoading={loadingContacts}
            onAdd={handleAddContact}
            onDelete={handleDeleteContact}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <InterviewRoundsList
            rounds={rounds || []}
            isLoading={loadingRounds}
            onAdd={handleAddRound}
            onDelete={handleDeleteRound}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <StatusHistoryTimeline items={history || []} isLoading={loadingHistory} />
        </CardContent>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background, gap: 12, padding: 32 },
  errorText: { fontSize: Typography.headline.sm, fontWeight: '700', color: Colors.light.error, fontFamily: Fonts.headline },
  errorHint: { fontSize: Typography.body.sm, color: Colors.light.onSurfaceVariant, textAlign: 'center', fontFamily: Fonts.body, maxWidth: 300 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleSection: { marginBottom: 8, gap: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  company: { fontSize: 32, fontWeight: '800', color: Colors.light.onSurface, fontFamily: Fonts.headline, letterSpacing: -0.5, flex: 1 },
  jobTitle: { fontSize: Typography.title.lg, fontWeight: '500', color: Colors.light.onSurfaceVariant, fontFamily: Fonts.headline },
  detailGrid: { gap: 16 },
  detailItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  detailIcon: { width: 32, alignItems: 'center' },
  detailLabel: { fontSize: Typography.label.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.light.onSurfaceVariant, fontFamily: Fonts.body },
  detailValue: { fontSize: Typography.title.md, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline },
  link: { color: Colors.light.accent, textDecorationLine: 'underline' },
  sectionTitleSmall: { fontSize: Typography.label.lg, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.light.onSurface, fontFamily: Fonts.body, marginBottom: 8 },
  notes: { fontSize: Typography.body.md, color: Colors.light.onSurfaceVariant, lineHeight: 22, fontStyle: 'italic', fontFamily: Fonts.body },
})
