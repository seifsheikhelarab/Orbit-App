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
  const s = getStyles(colors)
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
      <View style={s.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={s.errorText}>Application not found</Text>
        <Text style={s.errorHint}>This application may have been deleted or the link may be incorrect.</Text>
        <Button onPress={() => router.back()}>Go back to applications</Button>
      </View>
    )
  }

  const app = response.data

  return (
    <ScrollView style={[s.container, { paddingTop: insets.top + 16 }]} contentContainerStyle={s.content}>
      <View style={s.topBar}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Pressable onPress={() => router.push(`/(tabs)/applications/${id}/edit` as const)} accessibilityRole="button">
          <Ionicons name="create-outline" size={22} color={colors.accent} />
        </Pressable>
      </View>

      <View style={s.titleSection}>
        <View style={s.titleRow}>
          <Text style={s.company}>{app.company}</Text>
          <StatusBadge status={app.applicationStatus} />
        </View>
        <Text style={s.jobTitle}>{app.jobTitle}</Text>
      </View>

      <Card variant="elevated" accentPosition="left" accentColor={colors.accent}>
        <CardContent>
          <View style={s.detailGrid}>
            {app.location && (
              <View style={s.detailItem}>
                <View style={s.detailIcon}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={s.detailLabel}>Location</Text>
                  <Text style={s.detailValue}>{app.location}</Text>
                </View>
              </View>
            )}
            <View style={s.detailItem}>
              <View style={s.detailIcon}>
                <Ionicons name="cash-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={s.detailLabel}>Compensation</Text>
                <Text style={s.detailValue}>
                  {app.salaryMin || app.salaryMax
                    ? `${app.salaryMin ? `$${app.salaryMin.toLocaleString()}` : '?'} - ${app.salaryMax ? `$${app.salaryMax.toLocaleString()}` : '?'}`
                    : 'Undisclosed'}
                </Text>
              </View>
            </View>
            {app.appliedDate && (
              <View style={s.detailItem}>
                <View style={s.detailIcon}>
                  <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={s.detailLabel}>Applied</Text>
                  <Text style={s.detailValue}>{new Date(app.appliedDate).toLocaleDateString()}</Text>
                </View>
              </View>
            )}
            {app.jobURL && (
              <View style={s.detailItem}>
                <View style={s.detailIcon}>
                  <Ionicons name="link-outline" size={18} color={colors.accent} />
                </View>
                <Pressable onPress={() => Linking.openURL(app.jobURL!)}>
                  <Text style={s.detailLabel}>Job URL</Text>
                  <Text style={[s.detailValue, s.link]}>Open link</Text>
                </Pressable>
              </View>
            )}
          </View>
        </CardContent>
      </Card>

      {app.notes && (
        <Card>
          <CardContent>
            <Text style={s.sectionTitleSmall}>Notes</Text>
            <Text style={s.notes}>{app.notes}</Text>
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

const getStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background, gap: 12, padding: 32 },
  errorText: { fontSize: Typography.headline.sm, fontWeight: '700', color: c.error, fontFamily: Fonts.headline },
  errorHint: { fontSize: Typography.body.sm, color: c.onSurfaceVariant, textAlign: 'center', fontFamily: Fonts.body, maxWidth: 300 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titleSection: { marginBottom: 8, gap: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  company: { fontSize: 32, fontWeight: '800', color: c.onSurface, fontFamily: Fonts.headline, letterSpacing: -0.5, flex: 1 },
  jobTitle: { fontSize: Typography.title.lg, fontWeight: '500', color: c.onSurfaceVariant, fontFamily: Fonts.headline },
  detailGrid: { gap: 16 },
  detailItem: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  detailIcon: { width: 32, alignItems: 'center' },
  detailLabel: { fontSize: Typography.label.sm, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: c.onSurfaceVariant, fontFamily: Fonts.body },
  detailValue: { fontSize: Typography.title.md, fontWeight: '700', color: c.onSurface, fontFamily: Fonts.headline },
  link: { color: c.accent, textDecorationLine: 'underline' },
  sectionTitleSmall: { fontSize: Typography.label.lg, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: c.onSurface, fontFamily: Fonts.body, marginBottom: 8 },
  notes: { fontSize: Typography.body.md, color: c.onSurfaceVariant, lineHeight: 22, fontStyle: 'italic', fontFamily: Fonts.body },
})

const styles = getStyles(Colors.light)
