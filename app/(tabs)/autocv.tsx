import { useState, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { hexa } from '@/lib/opacity'
import { useColors } from '@/hooks/useColors'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAutoCV } from '@/features/profile/api/useProfile'
import type { ResumeData } from '@/features/resumes/api/types'

export default function AutoCVScreen() {
  const colors = useColors()
  const [jd, setJd] = useState('')
  const generateCV = useAutoCV()

  const [result, setResult] = useState<{
    jobData: any
    tailoredContent: {
      resumeContent: ResumeData
      coverLetter: string
    }
  } | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!jd.trim()) {
      Alert.alert('Input Required', 'Paste a job description to generate a tailored dossier.')
      return
    }
    try {
      const data = await generateCV.mutateAsync(jd.trim())
      setResult(data)
    } catch {
      Alert.alert('Generation Failed', 'The AutoCV engine could not generate a result. Please try again.')
    }
  }, [jd, generateCV])

  const handleSave = useCallback(() => {
    if (!result) return
    router.push({
      pathname: '/(resumes)/[id]' as const,
      params: { id: 'new', autoCV: JSON.stringify(result) },
    })
  }, [result])

  return (
    <View style={styles.container}>
      <PageHeader
        icon="sparkles-outline"
        iconVariant="accent"
        title="AutoCV Engine"
        subtitle="AI-powered dossier synthesis from any job description"
        right={result ? <Button size="sm" onPress={handleSave}>
          <Ionicons name="save-outline" size={14} color={colors.onPrimary} />
          <Text style={{ color: colors.onPrimary, fontSize: Typography.label.sm, fontFamily: Fonts.body, marginLeft: 4 }}> Save</Text>
        </Button> : undefined}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {!result ? (
          <>
            {/* Input */}
            <Card>
              <CardContent>
                <Text style={styles.inputLabel}>Job Description</Text>
                <Text style={styles.inputHint}>
                  Paste a full job description or a compelling summary. Our engine extracts signals, maps them against your dossier, and synthesizes a tailored version optimized for this specific opportunity.
                </Text>
                <Textarea
                  value={jd}
                  onChangeText={setJd}
                  placeholder={`Senior Software Engineer - Acme Corp\n\nWe are looking for...`}
                  style={styles.textarea}
                />
                <View style={styles.actions}>
                  <Button onPress={handleGenerate} loading={generateCV.isPending} disabled={generateCV.isPending}>
                      <Ionicons name="sparkles" size={14} color={colors.onPrimary} />
                    <Text style={{ color: colors.onPrimary, fontSize: Typography.label.sm, fontFamily: Fonts.body, marginLeft: 6 }}>
                      {generateCV.isPending ? 'Synthesizing...' : 'Generate Tailored Dossier'}
                    </Text>
                  </Button>
                </View>
              </CardContent>
            </Card>

            {/* How it works */}
            <Card>
              <CardContent>
                <Text style={styles.howTitle}>How It Works</Text>
                <View style={styles.stepRow}>
                  <View style={[styles.stepBadge, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="document-text-outline" size={16} color={colors.accent} />
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>1. Paste the JD</Text>
                    <Text style={styles.stepDesc}>Paste a job description or URL summary into the field above.</Text>
                  </View>
                </View>
                <View style={styles.stepRow}>
                  <View style={[styles.stepBadge, { backgroundColor: hexa(colors.primary, 0.08) }]}>
                    <Ionicons name="git-network-outline" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>2. Signal Extraction</Text>
                    <Text style={styles.stepDesc}>Our engine maps every requirement against your existing dossier for maximum alignment.</Text>
                  </View>
                </View>
                <View style={styles.stepRow}>
                  <View style={[styles.stepBadge, { backgroundColor: hexa(colors.success, 0.08) }]}>
                    <Ionicons name="sparkles" size={16} color={colors.success} />
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>3. Synthesize & Save</Text>
                    <Text style={styles.stepDesc}>Tailor and save the generated dossier, then attach it to a specific application.</Text>
                  </View>
                </View>
              </CardContent>
            </Card>


          </>
        ) : (
          <>
            {/* Result */}
            <Card>
              <CardContent>
                <View style={styles.resultHeader}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  <Text style={styles.resultTitle}>Dossier Synthesized</Text>
                </View>
                <Text style={styles.resultDesc}>We generated a dossier targeting your specific opportunity. Review it below, then save it to your dossier management.</Text>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Text style={styles.inputLabel}>Tailored Summary</Text>
                <Text style={styles.summaryText}>
                  {result.tailoredContent.resumeContent.basics.summary || 'No summary generated.'}
                </Text>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Text style={styles.inputLabel}>Cover Letter</Text>
                <Text style={styles.coverText}>
                  {result.tailoredContent.coverLetter || 'No cover letter generated.'}
                </Text>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Text style={styles.inputLabel}>Key Skills</Text>
                <View style={styles.skillsWrap}>
                  {result.tailoredContent.resumeContent.skills.slice(0, 10).map((s, i) => (
                    <View key={i} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{s.name}</Text>
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 8, gap: 16, paddingBottom: 100 },
  inputLabel: { fontSize: Typography.title.sm, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline },
  inputHint: { fontSize: Typography.label.sm, color: Colors.light.onSurfaceVariant, fontFamily: Fonts.body, marginTop: 4, marginBottom: 12, lineHeight: 16 },
  textarea: { minHeight: 220 },
  actions: { marginTop: 16 },
  howTitle: { fontSize: Typography.title.sm, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline, marginBottom: 16 },
  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  stepBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: Typography.body.md, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline },
  stepDesc: { fontSize: Typography.label.sm, color: Colors.light.onSurfaceVariant, fontFamily: Fonts.body, marginTop: 2, lineHeight: 16 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  resultTitle: { fontSize: Typography.body.lg, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline },
  resultDesc: { fontSize: Typography.label.sm, color: Colors.light.onSurfaceVariant, fontFamily: Fonts.body, lineHeight: 16 },
  summaryText: { fontSize: Typography.body.sm, color: Colors.light.onSurface, fontFamily: Fonts.body, lineHeight: 20, marginTop: 12 },
  coverText: { fontSize: Typography.body.sm, color: Colors.light.onSurface, fontFamily: Fonts.body, lineHeight: 20, marginTop: 12, fontStyle: 'italic' },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  skillBadge: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.light.surfaceContainer, borderRadius: 100,
    borderWidth: 1, borderColor: Colors.light.outlineVariant,
  },
  skillText: { fontSize: Typography.label.md, fontWeight: '600', color: Colors.light.onSurface, fontFamily: Fonts.body },
})

