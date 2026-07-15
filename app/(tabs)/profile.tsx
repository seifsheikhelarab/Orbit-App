import { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, RefreshControl, type TextInput } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Typography, Fonts, getShadows } from '@/constants/theme'
import { hexa } from '@/lib/opacity'
import { useColors } from '@/hooks/useColors'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/PageHeader'
import { ApiError } from '@/components/shared/ApiError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useProfile, useUpdateProfile } from '@/features/profile/api/useProfile'
import { defaultResumeData, type ResumeData } from '@/features/resumes/api/types'

export default function ProfileScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { data: profile, isLoading, isError, error, refetch, isRefetching } = useProfile()
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

  if (isLoading) {
    return (
      <View style={[getStyles(colors).container, { paddingTop: insets.top }]}>
        <PageHeader icon="person-outline" iconVariant="accent" title="Professional Dossier" subtitle="Your central record of experience" />
        <View style={getStyles(colors).skeletonWrap}>
          <View style={getStyles(colors).skeletonCard} />
          <View style={getStyles(colors).skeletonCard} />
          <View style={getStyles(colors).skeletonRow}>
            <View style={getStyles(colors).skeletonHalf} />
            <View style={getStyles(colors).skeletonHalf} />
          </View>
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={[getStyles(colors).container, { paddingTop: insets.top }]}>
        <PageHeader icon="person-outline" iconVariant="accent" title="Professional Dossier" subtitle="Your central record of experience" />
        <ApiError message={(error as any)?.userMessage || (error as any)?.message} onRetry={() => refetch()} fullScreen />
      </View>
    )
  }

  return (
    <View style={[getStyles(colors).container, { paddingTop: insets.top }]}>
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

      <ScrollView style={getStyles(colors).scroll} contentContainerStyle={getStyles(colors).scrollContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={getStyles(colors).layout}>
          <View style={getStyles(colors).main}>
            {/* Identity */}
            <Card>
              <CardContent>
                <View style={getStyles(colors).sectionHead}>
                  <View style={[getStyles(colors).sectionIcon, { backgroundColor: hexa(colors.primary, 0.08) }]}>
                    <Ionicons name="person-outline" size={18} color={colors.primary} />
                  </View>
                  <Text style={getStyles(colors).sectionTitle}>Identity & Summary</Text>
                </View>
                <View style={getStyles(colors).fieldGrid}>
                  <View style={getStyles(colors).half}>
                    <Label>Full Name</Label>
                    <Input value={formData.basics.name} onChangeText={(v) => set(['basics', 'name'], v)} containerStyle={getStyles(colors).inlineMt6} />
                  </View>
                  <View style={getStyles(colors).half}>
                    <Label>Professional Label</Label>
                    <Input value={formData.basics.label} onChangeText={(v) => set(['basics', 'label'], v)} placeholder="e.g. Senior Engineer" containerStyle={getStyles(colors).inlineMt6} />
                  </View>
                  <View style={getStyles(colors).half}>
                    <Label>Email</Label>
                    <Input value={formData.basics.email} onChangeText={(v) => set(['basics', 'email'], v)} keyboardType="email-address" containerStyle={getStyles(colors).inlineMt6} />
                  </View>
                  <View style={getStyles(colors).half}>
                    <Label>Phone</Label>
                    <Input value={formData.basics.phone} onChangeText={(v) => set(['basics', 'phone'], v)} containerStyle={getStyles(colors).inlineMt6} />
                  </View>
                  <View style={getStyles(colors).full}>
                    <Label>Location</Label>
                    <Input value={formData.basics.location} onChangeText={(v) => set(['basics', 'location'], v)} containerStyle={getStyles(colors).inlineMt6} />
                  </View>
                  <View style={getStyles(colors).full}>
                    <Label>Strategic Summary</Label>
                    <Textarea value={formData.basics.summary} onChangeText={(v) => set(['basics', 'summary'], v)} placeholder="High-level overview of your professional value proposition." style={getStyles(colors).inlineMt6} />
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card>
              <CardContent>
                <View style={getStyles(colors).sectionHead}>
                  <View style={[getStyles(colors).sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="briefcase-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={getStyles(colors).sectionTitle}>Professional Trajectory</Text>
                </View>
                {formData.work.map((exp, i) => (
                  <View key={i} style={getStyles(colors).entry}>
                    <View style={getStyles(colors).entryRow}>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Organization</Label>
                        <Input value={exp.company} onChangeText={(v) => set(['work', i, 'company'], v)} containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Role Title</Label>
                        <Input value={exp.position} onChangeText={(v) => set(['work', i, 'position'], v)} containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                    </View>
                    <View style={getStyles(colors).entryRow}>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Start Date</Label>
                        <Input value={exp.startDate} onChangeText={(v) => set(['work', i, 'startDate'], v)} placeholder="YYYY-MM" containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>End Date</Label>
                        <Input value={exp.endDate} onChangeText={(v) => set(['work', i, 'endDate'], v)} placeholder="YYYY-MM" containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                    </View>
                    <Label>Impact & Key Results</Label>
                    <Textarea value={exp.highlights} onChangeText={(v) => set(['work', i, 'highlights'], v)} placeholder="List your primary achievements..." style={getStyles(colors).inlineMt4} />
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, work: prev.work.filter((_, idx) => idx !== i) }))} accessibilityRole="button" style={{ paddingVertical: 8, minHeight: 44, justifyContent: 'center' }}>
                      <Text style={getStyles(colors).removeText}>Remove</Text>
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
                <View style={getStyles(colors).sectionHead}>
                  <View style={[getStyles(colors).sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="school-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={getStyles(colors).sectionTitle}>Academic Foundation</Text>
                </View>
                {formData.education.map((edu, i) => (
                  <View key={i} style={getStyles(colors).entry}>
                    <View style={getStyles(colors).entryRow}>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Institution</Label>
                        <Input value={edu.institution} onChangeText={(v) => set(['education', i, 'institution'], v)} containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Degree</Label>
                        <Input value={edu.studyType} onChangeText={(v) => set(['education', i, 'studyType'], v)} placeholder="Bachelor's" containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                    </View>
                    <View style={getStyles(colors).entryRow}>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Field of Study</Label>
                        <Input value={edu.area} onChangeText={(v) => set(['education', i, 'area'], v)} containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Completion Date</Label>
                        <Input value={edu.endDate} onChangeText={(v) => set(['education', i, 'endDate'], v)} placeholder="YYYY" containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                    </View>
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }))} accessibilityRole="button" style={{ paddingVertical: 8, minHeight: 44, justifyContent: 'center' }}>
                      <Text style={getStyles(colors).removeText}>Remove</Text>
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
                <View style={getStyles(colors).sectionHead}>
                  <View style={[getStyles(colors).sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="layers-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={getStyles(colors).sectionTitle}>Key Initiatives & Projects</Text>
                </View>
                {formData.projects.map((proj, i) => (
                  <View key={i} style={getStyles(colors).entry}>
                    <View style={getStyles(colors).entryRow}>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Project Title</Label>
                        <Input value={proj.name} onChangeText={(v) => set(['projects', i, 'name'], v)} containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>URL</Label>
                        <Input value={proj.url} onChangeText={(v) => set(['projects', i, 'url'], v)} containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                    </View>
                    <Label>Description</Label>
                    <Textarea value={proj.highlights} onChangeText={(v) => set(['projects', i, 'highlights'], v)} placeholder="Explain the problem solved and your contribution..." style={getStyles(colors).inlineMt4} />
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }))} accessibilityRole="button" style={{ paddingVertical: 8, minHeight: 44, justifyContent: 'center' }}>
                      <Text style={getStyles(colors).removeText}>Remove</Text>
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
                <View style={getStyles(colors).sectionHead}>
                  <View style={[getStyles(colors).sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="bulb-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={getStyles(colors).sectionTitle}>Expertise & Skills</Text>
                </View>
                <View style={getStyles(colors).skillsWrap}>
                  {formData.skills.map((skill, i) => (
                    <View key={i} style={getStyles(colors).skillChip}>
                      <Text style={getStyles(colors).skillChipText}>{skill.name}</Text>
                      <Pressable onPress={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))} accessibilityRole="button" style={{ padding: 4, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="close" size={14} color={colors.onSurfaceVariant} />
                      </Pressable>
                    </View>
                  ))}
                </View>
                {formData.skills.length === 0 && (
                  <Text style={getStyles(colors).emptySkills}>No expertise records found.</Text>
                )}
                <View style={getStyles(colors).addSkillRow}>
                  <Input
                    ref={skillInputRef}
                    value={skillText}
                    onChangeText={setSkillText}
                    placeholder="Add a skill and press +"
                    containerStyle={{ flex: 1 }}
                    onSubmitEditing={addSkill}
                  />
                  <Pressable style={getStyles(colors).addSkillBtn} onPress={addSkill} accessibilityRole="button">
                    <Ionicons name="add" size={20} color={colors.onPrimary} />
                  </Pressable>
                </View>
              </CardContent>
            </Card>

            {/* Volunteering */}
            <Card>
              <CardContent>
                <View style={getStyles(colors).sectionHead}>
                  <View style={[getStyles(colors).sectionIcon, { backgroundColor: hexa(colors.error, 0.08) }]}>
                    <Ionicons name="heart-outline" size={18} color={colors.error} />
                  </View>
                  <Text style={getStyles(colors).sectionTitle}>Volunteering</Text>
                </View>
                {formData.volunteer.map((vol, i) => (
                  <View key={i} style={getStyles(colors).entry}>
                    <View style={getStyles(colors).entryRow}>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Organization</Label>
                        <Input value={vol.organization} onChangeText={(v) => set(['volunteer', i, 'organization'], v)} containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Role</Label>
                        <Input value={vol.position} onChangeText={(v) => set(['volunteer', i, 'position'], v)} containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                    </View>
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, volunteer: prev.volunteer.filter((_, idx) => idx !== i) }))} accessibilityRole="button" style={{ paddingVertical: 8, minHeight: 44, justifyContent: 'center' }}>
                      <Text style={getStyles(colors).removeText}>Remove</Text>
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
                <View style={getStyles(colors).sectionHead}>
                  <View style={[getStyles(colors).sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                    <Ionicons name="globe-outline" size={18} color={colors.accent} />
                  </View>
                  <Text style={getStyles(colors).sectionTitle}>Languages</Text>
                </View>
                {formData.languages.map((lang, i) => (
                  <View key={i} style={getStyles(colors).entry}>
                    <View style={getStyles(colors).entryRow}>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Language</Label>
                        <Input value={lang.name} onChangeText={(v) => set(['languages', i, 'name'], v)} containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                      <View style={getStyles(colors).entryHalf}>
                        <Label>Fluency</Label>
                        <Input value={lang.fluency} onChangeText={(v) => set(['languages', i, 'fluency'], v)} placeholder="Native / Fluent" containerStyle={getStyles(colors).inlineMt4} />
                      </View>
                    </View>
                    <Pressable onPress={() => setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, idx) => idx !== i) }))} accessibilityRole="button" style={{ paddingVertical: 8, minHeight: 44, justifyContent: 'center' }}>
                      <Text style={getStyles(colors).removeText}>Remove</Text>
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
          <View style={getStyles(colors).sidebar}>
            <Pressable style={getStyles(colors).autocvCard} onPress={() => router.push('/(tabs)/autocv' as const)} accessibilityRole="button">
              <View style={getStyles(colors).autocvTop}>
                <View style={[getStyles(colors).sectionIcon, { backgroundColor: hexa(colors.accent, 0.08) }]}>
                  <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
              </View>
              <Text style={getStyles(colors).autocvTitle}>AutoCV Engine</Text>
              <Text style={getStyles(colors).autocvSub}>Generate tailored dossiers</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}


const getStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 100 },
  skeletonWrap: { padding: 16, gap: 16 },
  skeletonCard: { height: 200, borderRadius: 32, backgroundColor: c.surfaceContainer },
  skeletonRow: { flexDirection: 'row', gap: 16 },
  skeletonHalf: { flex: 1, height: 200, borderRadius: 32, backgroundColor: c.surfaceContainer },
  layout: { gap: 16 },
  main: { gap: 16 },
  sidebar: { gap: 16 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: Typography.title.sm, fontWeight: '700', color: c.onSurface, fontFamily: Fonts.headline },
  fieldGrid: { gap: 16 },
  half: { flex: 1 },
  full: { flex: 1 },
  entry: { gap: 10, padding: 16, backgroundColor: c.surfaceContainerLow, borderRadius: 16, marginBottom: 12 },
  entryRow: { flexDirection: 'row', gap: 10 },
  entryHalf: { flex: 1 },
  inlineMt4: { marginTop: 4 },
  inlineMt6: { marginTop: 6 },
  removeText: { fontSize: Typography.label.sm, color: c.error, fontWeight: '600', marginTop: 4, fontFamily: Fonts.body },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  skillChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: c.surfaceContainer, borderRadius: 100,
    borderWidth: 1, borderColor: c.outlineVariant,
  },
  skillChipText: { fontSize: Typography.label.md, fontWeight: '600', color: c.onSurface, fontFamily: Fonts.body },
  emptySkills: { fontSize: Typography.body.sm, color: c.onSurfaceVariant, fontFamily: Fonts.body, fontStyle: 'italic', marginBottom: 12 },
  addSkillRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addSkillBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  autocvCard: {
    backgroundColor: c.surfaceContainerLow,
    borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: c.outlineVariant,
  },
  autocvTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  autocvTitle: { fontSize: Typography.body.md, fontWeight: '700', color: c.onSurface, fontFamily: Fonts.headline },
  autocvSub: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: hexa(c.onSurfaceVariant, 0.65), marginTop: 2, fontFamily: Fonts.body },
})
