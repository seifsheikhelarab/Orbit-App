import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, RefreshControl, type TextInput } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts, Shadows } from '@/constants/theme'
import { hexa } from '@/lib/opacity'
import { useColors } from '@/hooks/useColors'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useProfile, useUpdateProfile } from '@/features/profile/api/useProfile'
import { defaultResumeData, type ResumeData } from '@/features/resumes/api/types'

function DossierScore({ label, score }: { label: string; score: number }) {
  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreLabel}>
        <Text style={styles.scoreLabelText}>{label}</Text>
        <Text style={styles.scoreValue}>{score}%</Text>
      </View>
      <View style={styles.scoreTrack}>
        <View style={[styles.scoreBar, { width: `${score}%` }]} />
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const colors = useColors()
  const { data: profile, isLoading, refetch, isRefetching } = useProfile()
  const updateProfile = useUpdateProfile()
  const [formData, setFormData] = useState<ResumeData>(defaultResumeData)

  useEffect(() => {
    if (profile?.content) {
      setFormData(profile.content)
    }
  }, [profile])

  const handleSave = useCallback(async () => {
    try {
      await updateProfile.mutateAsync(formData)
      Alert.alert('Synced', 'Professional dossier synchronized')
    } catch {
      Alert.alert('Error', 'Failed to sync dossier')
    }
  }, [formData, updateProfile])

  const skillInputRef = useRef<TextInput>(null)
  const [skillText, setSkillText] = useState('')

  const addSkill = useCallback(() => {
    const text = skillText.trim()
    if (text) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, { name: text, level: '', keywords: '' }] }))
      setSkillText('')
      skillInputRef.current?.focus()
    }
  }, [skillText])

  const set = useCallback((path: (string | number)[], value: any) => {
    setFormData(prev => {
      const next = { ...prev }
      let obj: any = next
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[String(path[i])]
      }
      obj[String(path[path.length - 1])] = value
      return next
    })
  }, [])

  const identityScore = formData.basics.name && formData.basics.summary ? 100 : 40
  const expScore = Math.min(formData.work.length * 25, 100)
  const skillScore = Math.min(formData.skills.length * 10, 100)

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PageHeader icon="person-outline" iconVariant="accent" title="Professional Dossier" subtitle="Your central record of experience" />
        <View style={styles.skeletonWrap}>
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonRow}>
            <View style={styles.skeletonHalf} />
            <View style={styles.skeletonHalf} />
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <PageHeader
        icon="person-outline"
        iconVariant="accent"
        title="Professional Dossier"
        subtitle="Your central record of experience"
        right={
          <Button size="sm" onPress={handleSave} loading={updateProfile.isPending}>
            <Ionicons name="cloud-upload-outline" size={14} color={colors.onPrimary} />
            <Text style={{ color: colors.onPrimary, fontSize: Typography.label.sm, fontFamily: Fonts.body, marginLeft: 4 }}> Sync</Text>
          </Button>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={styles.layout}>
          <View style={styles.main}>
            {/* Identity */}
            <Card>
              <CardContent>
                <View style={styles.sectionHead}>
                  <View style={[styles.sectionIcon, { backgroundColor: hexa(colors.primary, 0.08) }]}>
                    <Ionicons name="person-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Identity & Summary</Text>
                </View>
                <View style={styles.fieldGrid}>
                  <View style={styles.half}>
                    <Label>Full Name</Label>
                    <Input value={formData.basics.name} onChangeText={(v) => set(['basics', 'name'], v)} containerStyle={styles.inlineMt6} />
                  </View>
                  <View style={styles.half}>
                    <Label>Professional Label</Label>
                    <Input value={formData.basics.label} onChangeText={(v) => set(['basics', 'label'], v)} placeholder="e.g. Senior Engineer" containerStyle={styles.inlineMt6} />
                  </View>
                  <View style={styles.half}>
                    <Label>Email</Label>
                    <Input value={formData.basics.email} onChangeText={(v) => set(['basics', 'email'], v)} keyboardType="email-address" containerStyle={styles.inlineMt6} />
                  </View>
                  <View style={styles.half}>
                    <Label>Phone</Label>
                    <Input value={formData.basics.phone} onChangeText={(v) => set(['basics', 'phone'], v)} containerStyle={styles.inlineMt6} />
                  </View>
                  <View style={styles.full}>
                    <Label>Location</Label>
                    <Input value={formData.basics.location} onChangeText={(v) => set(['basics', 'location'], v)} containerStyle={styles.inlineMt6} />
                  </View>
                  <View style={styles.full}>
                    <Label>Strategic Summary</Label>
                    <Textarea value={formData.basics.summary} onChangeText={(v) => set(['basics', 'summary'], v)} placeholder="High-level overview of your professional value proposition." style={styles.inlineMt6} />
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardContent>
                <View style={styles.sectionHead}>
                  <View style={[styles.sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="briefcase-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.sectionTitle}>Professional Trajectory</Text>
                </View>
                {formData.work.map((exp, i) => (
                  <View key={i} style={styles.entry}>
                    <View style={styles.entryRow}>
                      <View style={styles.entryHalf}>
                        <Label>Organization</Label>
                        <Input value={exp.company} onChangeText={(v) => set(['work', i, 'company'], v)} containerStyle={styles.inlineMt4} />
                      </View>
                      <View style={styles.entryHalf}>
                        <Label>Role Title</Label>
                        <Input value={exp.position} onChangeText={(v) => set(['work', i, 'position'], v)} containerStyle={styles.inlineMt4} />
                      </View>
                    </View>
                    <View style={styles.entryRow}>
                      <View style={styles.entryHalf}>
                        <Label>Start Date</Label>
                        <Input value={exp.startDate} onChangeText={(v) => set(['work', i, 'startDate'], v)} placeholder="YYYY-MM" containerStyle={styles.inlineMt4} />
                      </View>
                      <View style={styles.entryHalf}>
                        <Label>End Date</Label>
                        <Input value={exp.endDate} onChangeText={(v) => set(['work', i, 'endDate'], v)} placeholder="YYYY-MM" containerStyle={styles.inlineMt4} />
                      </View>
                    </View>
                    <Label>Impact & Key Results</Label>
                    <Textarea value={exp.highlights} onChangeText={(v) => set(['work', i, 'highlights'], v)} placeholder="List your primary achievements..." style={styles.inlineMt4} />
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, work: prev.work.filter((_, idx) => idx !== i) }))} accessibilityRole="button">
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
                <Button variant="outline" onPress={() => setFormData(prev => ({ ...prev, work: [...prev.work, { company: '', position: '', startDate: '', endDate: '', highlights: '' }] }))}>
            <Ionicons name="add" size={14} color={colors.onSurfaceVariant} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: Typography.body.sm, fontFamily: Fonts.body, marginLeft: 6 }}> Add Experience</Text>
                </Button>
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardContent>
                <View style={styles.sectionHead}>
                  <View style={[styles.sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="school-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.sectionTitle}>Academic Foundation</Text>
                </View>
                {formData.education.map((edu, i) => (
                  <View key={i} style={styles.entry}>
                    <View style={styles.entryRow}>
                      <View style={styles.entryHalf}>
                        <Label>Institution</Label>
                        <Input value={edu.institution} onChangeText={(v) => set(['education', i, 'institution'], v)} containerStyle={styles.inlineMt4} />
                      </View>
                      <View style={styles.entryHalf}>
                        <Label>Degree</Label>
                        <Input value={edu.studyType} onChangeText={(v) => set(['education', i, 'studyType'], v)} placeholder="Bachelor's" containerStyle={styles.inlineMt4} />
                      </View>
                    </View>
                    <View style={styles.entryRow}>
                      <View style={styles.entryHalf}>
                        <Label>Field of Study</Label>
                        <Input value={edu.area} onChangeText={(v) => set(['education', i, 'area'], v)} containerStyle={styles.inlineMt4} />
                      </View>
                      <View style={styles.entryHalf}>
                        <Label>Completion Date</Label>
                        <Input value={edu.endDate} onChangeText={(v) => set(['education', i, 'endDate'], v)} placeholder="YYYY" containerStyle={styles.inlineMt4} />
                      </View>
                    </View>
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }))} accessibilityRole="button">
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
                <Button variant="outline" onPress={() => setFormData(prev => ({ ...prev, education: [...prev.education, { institution: '', studyType: '', area: '', startDate: '', endDate: '', score: '' }] }))}>
            <Ionicons name="add" size={14} color={colors.onSurfaceVariant} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: Typography.body.sm, fontFamily: Fonts.body, marginLeft: 6 }}> Add Education</Text>
                </Button>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card>
              <CardContent>
                <View style={styles.sectionHead}>
                  <View style={[styles.sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="layers-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.sectionTitle}>Key Initiatives & Projects</Text>
                </View>
                {formData.projects.map((proj, i) => (
                  <View key={i} style={styles.entry}>
                    <View style={styles.entryRow}>
                      <View style={styles.entryHalf}>
                        <Label>Project Title</Label>
                        <Input value={proj.name} onChangeText={(v) => set(['projects', i, 'name'], v)} containerStyle={styles.inlineMt4} />
                      </View>
                      <View style={styles.entryHalf}>
                        <Label>URL</Label>
                        <Input value={proj.url} onChangeText={(v) => set(['projects', i, 'url'], v)} containerStyle={styles.inlineMt4} />
                      </View>
                    </View>
                    <Label>Description</Label>
                    <Textarea value={proj.highlights} onChangeText={(v) => set(['projects', i, 'highlights'], v)} placeholder="Explain the problem solved and your contribution..." style={styles.inlineMt4} />
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }))} accessibilityRole="button">
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
                <Button variant="outline" onPress={() => setFormData(prev => ({ ...prev, projects: [...prev.projects, { name: '', description: '', highlights: '', url: '', startDate: '', endDate: '' }] }))}>
            <Ionicons name="add" size={14} color={colors.onSurfaceVariant} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: Typography.body.sm, fontFamily: Fonts.body, marginLeft: 6 }}> Add Project</Text>
                </Button>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardContent>
                <View style={styles.sectionHead}>
                  <View style={[styles.sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="bulb-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.sectionTitle}>Expertise & Skills</Text>
                </View>
                <View style={styles.skillsWrap}>
                  {formData.skills.map((skill, i) => (
                    <View key={i} style={styles.skillChip}>
                      <Text style={styles.skillChipText}>{skill.name}</Text>
                      <Pressable onPress={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))} accessibilityRole="button">
                        <Ionicons name="close" size={14} color={colors.onSurfaceVariant} />
                      </Pressable>
                    </View>
                  ))}
                </View>
                {formData.skills.length === 0 && (
                  <Text style={styles.emptySkills}>No expertise records found.</Text>
                )}
                <View style={styles.addSkillRow}>
                  <Input
                    ref={skillInputRef}
                    value={skillText}
                    onChangeText={setSkillText}
                    placeholder="Add a skill and press +"
                    containerStyle={{ flex: 1 }}
                    onSubmitEditing={addSkill}
                  />
                  <Pressable style={styles.addSkillBtn} onPress={addSkill} accessibilityRole="button">
                    <Ionicons name="add" size={20} color={colors.onPrimary} />
                  </Pressable>
                </View>
              </CardContent>
            </Card>

            {/* Volunteering */}
            <Card>
              <CardContent>
                <View style={styles.sectionHead}>
                  <View style={[styles.sectionIcon, { backgroundColor: hexa(colors.error, 0.08) }]}>
                    <Ionicons name="heart-outline" size={18} color={colors.error} />
                  </View>
                  <Text style={styles.sectionTitle}>Volunteering</Text>
                </View>
                {formData.volunteer.map((vol, i) => (
                  <View key={i} style={styles.entry}>
                    <View style={styles.entryRow}>
                      <View style={styles.entryHalf}>
                        <Label>Organization</Label>
                        <Input value={vol.organization} onChangeText={(v) => set(['volunteer', i, 'organization'], v)} containerStyle={styles.inlineMt4} />
                      </View>
                      <View style={styles.entryHalf}>
                        <Label>Role</Label>
                        <Input value={vol.position} onChangeText={(v) => set(['volunteer', i, 'position'], v)} containerStyle={styles.inlineMt4} />
                      </View>
                    </View>
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, volunteer: prev.volunteer.filter((_, idx) => idx !== i) }))} accessibilityRole="button">
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
                <Button variant="outline" onPress={() => setFormData(prev => ({ ...prev, volunteer: [...prev.volunteer, { organization: '', position: '', startDate: '', endDate: '', highlights: '' }] }))}>
            <Ionicons name="add" size={14} color={colors.onSurfaceVariant} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: Typography.body.sm, fontFamily: Fonts.body, marginLeft: 6 }}> Add Volunteering</Text>
                </Button>
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardContent>
                <View style={styles.sectionHead}>
                  <View style={[styles.sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="globe-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.sectionTitle}>Languages</Text>
                </View>
                {formData.languages.map((lang, i) => (
                  <View key={i} style={styles.entry}>
                    <View style={styles.entryRow}>
                      <View style={styles.entryHalf}>
                        <Label>Language</Label>
                        <Input value={lang.name} onChangeText={(v) => set(['languages', i, 'name'], v)} containerStyle={styles.inlineMt4} />
                      </View>
                      <View style={styles.entryHalf}>
                        <Label>Fluency</Label>
                        <Input value={lang.fluency} onChangeText={(v) => set(['languages', i, 'fluency'], v)} placeholder="Native / Fluent" containerStyle={styles.inlineMt4} />
                      </View>
                    </View>
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }))} accessibilityRole="button">
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
                <Button variant="outline" onPress={() => setFormData(prev => ({ ...prev, languages: [...prev.languages, { name: '', fluency: '', highlights: '', startDate: '' }] }))}>
            <Ionicons name="add" size={14} color={colors.onSurfaceVariant} />
            <Text style={{ color: colors.onSurfaceVariant, fontSize: Typography.body.sm, fontFamily: Fonts.body, marginLeft: 6 }}> Add Language</Text>
                </Button>
              </CardContent>
            </Card>
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            <View style={styles.readinessCard}>
              <View style={styles.readinessHeader}>
                <Ionicons name="sparkles-outline" size={20} color={colors.accent} />
                <Text style={styles.readinessTitle}>Intelligence Readiness</Text>
              </View>
              <Text style={styles.readinessDesc}>
                Our models use this dossier as the ground truth. The higher the completeness, the better the tailoring accuracy.
              </Text>
              <DossierScore label="Identity Record" score={identityScore} />
              <DossierScore label="Experience Volume" score={expScore} />
              <DossierScore label="Skill Density" score={skillScore} />
              <View style={styles.readinessStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            </View>

            <Pressable style={styles.autocvCard} onPress={() => router.push('/(tabs)/autocv' as const)} accessibilityRole="button">
              <View style={styles.autocvTop}>
                <View style={[styles.sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                  <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
              </View>
              <Text style={styles.autocvTitle}>AutoCV Engine</Text>
              <Text style={styles.autocvSub}>Generate tailored dossiers</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 8, gap: 16, paddingBottom: 100 },
  skeletonWrap: { padding: 16, gap: 16 },
  skeletonCard: { height: 200, borderRadius: 32, backgroundColor: Colors.light.surfaceContainer },
  skeletonRow: { flexDirection: 'row', gap: 16 },
  skeletonHalf: { flex: 1, height: 200, borderRadius: 32, backgroundColor: Colors.light.surfaceContainer },
  layout: { gap: 16 },
  main: { gap: 16 },
  sidebar: { gap: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: Typography.title.sm, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline },
  fieldGrid: { gap: 16 },
  half: { flex: 1 },
  full: { flex: 1 },
  entry: { gap: 10, padding: 16, backgroundColor: Colors.light.surfaceContainerLow, borderRadius: 16, marginBottom: 12 },
  entryRow: { flexDirection: 'row', gap: 10 },
  entryHalf: { flex: 1 },
  inlineMt4: { marginTop: 4 },
  inlineMt6: { marginTop: 6 },
  removeText: { fontSize: Typography.label.sm, color: Colors.light.error, fontWeight: '600', marginTop: 4, fontFamily: Fonts.body },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  skillChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: Colors.light.surfaceContainer, borderRadius: 100,
    borderWidth: 1, borderColor: Colors.light.outlineVariant,
  },
  skillChipText: { fontSize: Typography.label.md, fontWeight: '600', color: Colors.light.onSurface, fontFamily: Fonts.body },
  emptySkills: { fontSize: Typography.body.sm, color: Colors.light.onSurfaceVariant, fontFamily: Fonts.body, fontStyle: 'italic', marginBottom: 12 },
  addSkillRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addSkillBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.light.primary, alignItems: 'center', justifyContent: 'center' },
  readinessCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 28, padding: 24,
    gap: 16,
  },
  readinessHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  readinessTitle: { fontSize: Typography.body.md, fontWeight: '700', color: Colors.light.onPrimary, fontFamily: Fonts.headline },
  readinessDesc: { fontSize: Typography.label.sm, color: hexa(Colors.light.onPrimary, 0.70), fontFamily: Fonts.body, lineHeight: 16 },
  scoreRow: { gap: 6 },
  scoreLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreLabelText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: hexa(Colors.light.onPrimary, 0.60), fontFamily: Fonts.body },
  scoreValue: { fontSize: 9, fontWeight: '700', color: Colors.light.accent, fontFamily: Fonts.body },
  scoreTrack: { height: 4, backgroundColor: hexa(Colors.light.onPrimary, 0.10), borderRadius: 2, overflow: 'hidden' },
  scoreBar: { height: '100%', backgroundColor: Colors.light.accent, borderRadius: 2 },
  readinessStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: hexa(Colors.light.onPrimary, 0.10), paddingTop: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.light.accent },
  statusText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: hexa(Colors.light.onPrimary, 0.40), fontFamily: Fonts.body },
  autocvCard: {
    backgroundColor: Colors.light.surfaceContainerLow,
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: Colors.light.outlineVariant,
  },
  autocvTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  autocvTitle: { fontSize: Typography.body.md, fontWeight: '700', color: Colors.light.onSurface, fontFamily: Fonts.headline },
  autocvSub: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: hexa(Colors.light.onSurfaceVariant, 0.50), marginTop: 2, fontFamily: Fonts.body },
})
