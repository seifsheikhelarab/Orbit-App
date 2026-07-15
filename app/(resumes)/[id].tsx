import { useEffect, useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { hexa } from '@/lib/opacity'
import { useColors } from '@/hooks/useColors'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { CollapsibleSection } from '@/components/resumes/CollapsibleSection'
import { SegmentedControl } from '@/components/resumes/SegmentedControl'
import { Field } from '@/components/resumes/Field'
import { useResume, useUpdateResume } from '@/features/resumes/api/useResumes'
import {
  defaultResumeData,
  defaultCoverLetterContent,
  type ResumeData,
  type ResumeSettings,
  type CoverLetterContent,
  type ResumeType,
} from '@/features/resumes/api/types'
import { renderModernHtml } from '@/features/resumes/pdf/renderModern'
import { renderProfessionalHtml } from '@/features/resumes/pdf/renderProfessional'
import { renderMinimalHtml } from '@/features/resumes/pdf/renderMinimal'
import { renderCoverLetterHtml } from '@/features/resumes/pdf/renderCoverLetter'

const COLOR_PRESETS = [
  '#1e3a8a', '#0f766e', '#a8009a', '#dc2626',
  '#d97706', '#059669', '#4f46e5', '#db2777',
  '#0891b2', '#65a30d', '#c026d3', '#ea580c',
]

function EntryPanel({
  title,
  meta,
  defaultOpen,
  children,
}: {
  title: string
  meta?: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const colors = useColors()
  const entryStyles = useMemo(() => getEntryStyles(colors), [colors])
  const [open, setOpen] = useState(defaultOpen ?? false)

  return (
    <View style={entryStyles.container}>
      <Pressable
        onPress={() => setOpen(!open)}
        style={[entryStyles.header, open && entryStyles.headerOpen]}
        accessibilityRole="button"
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[entryStyles.title, open && entryStyles.titleOpen]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {meta && (
            <Text style={entryStyles.meta} numberOfLines={1}>
              {meta}
            </Text>
          )}
        </View>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={open ? colors.primary : hexa(colors.onSurfaceVariant, 0.31)}
        />
      </Pressable>
      {open && <View style={entryStyles.content}>{children}</View>}
    </View>
  )
}

function getEntryStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.outline,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      gap: 12,
    },
    headerOpen: {
      borderBottomWidth: 1,
      borderBottomColor: hexa(c.outline, 0.31),
    },
    title: {
      fontSize: Typography.body.md,
      fontWeight: '600',
      color: c.onSurface,
      fontFamily: Fonts.body,
    },
    titleOpen: {
      color: c.primary,
    },
    meta: {
      fontSize: Typography.body.sm,
      color: c.onSurfaceVariant,
      marginTop: 2,
      fontFamily: Fonts.body,
    },
    content: {
      padding: 16,
      gap: 14,
      backgroundColor: hexa(c.surfaceContainerLow, 0.19),
    },
    flex1: { flex: 1 },
    rowGap12: { flexDirection: 'row', gap: 12 },
    errorChip: { color: c.onError, fontSize: Typography.label.md, marginLeft: 6, fontFamily: Fonts.body },
    secondaryChip: { color: c.onSecondaryContainer, fontSize: Typography.label.md, marginLeft: 6, fontFamily: Fonts.body },
    nameInput: {
      fontSize: Typography.title.md,
      fontWeight: '700',
      color: c.onSurface,
      fontFamily: Fonts.headline,
      padding: 0,
      margin: 0,
    },
    colorSwatch: {
      width: 36,
      height: 36,
      borderRadius: 12,
    },
    colorSwatchActive: {
      borderWidth: 3,
      borderColor: c.surface,
      transform: [{ scale: 1.1 }],
      elevation: 6,
    },
    colorPickerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
  })
}

export default function BuilderScreen() {
  const colors = useColors()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const entryStyles = useMemo(() => getEntryStyles(colors), [colors])
  const styles = useMemo(() => getBuilderStyles(colors), [colors])
  const skillStyles = useMemo(() => getSkillStyles(colors), [colors])
  const { data: response, isLoading, isError } = useResume(id ?? '')
  const updateResume = useUpdateResume()
  const document = response?.data

  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData)
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterContent>(
    defaultCoverLetterContent,
  )
  const [settings, setSettings] = useState<ResumeSettings>(
    defaultResumeData.settings,
  )
  const [name, setName] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const lastSavedRef = useRef<string>('')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const docType = (document?.type as ResumeType) || 'RESUME'

  useEffect(() => {
    if (document) {
      setName(document.name)
      const currentContent = document.content || {}
      const stateString = JSON.stringify({
        name: document.name,
        content: currentContent,
        settings: document.settings || {},
      })
      lastSavedRef.current = stateString

      if (docType === 'RESUME') {
        const loadedSettings = {
          ...defaultResumeData.settings,
          ...(currentContent.settings || {}),
          ...(document.settings || {}),
        }
        const loaded = {
          ...defaultResumeData,
          ...currentContent,
          settings: loadedSettings,
          basics: {
            ...defaultResumeData.basics,
            ...(currentContent.basics || {}),
          },
        }
        setResumeData(loaded)
        setSettings(loadedSettings)
      } else {
        setCoverLetterData({
          ...defaultCoverLetterContent,
          ...currentContent,
        })
        setSettings(defaultResumeData.settings)
      }
    }
  }, [document?.id])

  const handleSave = useCallback(
    async (skipToast = false) => {
      if (!id) return
      const content =
        docType === 'RESUME'
          ? { ...resumeData, settings }
          : coverLetterData
      const currentSettings = docType === 'RESUME' ? settings : {}
      const stateString = JSON.stringify({
        name,
        content,
        settings: currentSettings,
      })
      if (stateString === lastSavedRef.current) return

      try {
        await updateResume.mutateAsync({
          id,
          name,
          content,
          settings: currentSettings,
        })
        lastSavedRef.current = stateString
      } catch {}
    },
    [id, docType, resumeData, coverLetterData, settings, name, updateResume],
  )

  useEffect(() => {
    if (!document) return
    const content =
      docType === 'RESUME'
        ? { ...resumeData, settings }
        : coverLetterData
    const currentSettings = docType === 'RESUME' ? settings : {}
    const currentState = JSON.stringify({
      name,
      content,
      settings: currentSettings,
    })
    if (currentState !== lastSavedRef.current) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => handleSave(true), 1000)
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [resumeData, coverLetterData, settings, name, document])

  const handleExportPdf = useCallback(async () => {
    if (!document) return
    try {
      setIsExporting(true)
      const appName = `orbit-resume-${(document.name || 'document').replace(/\s+/g, '-').toLowerCase()}`

      const html =
        docType === 'COVER_LETTER'
          ? renderCoverLetterHtml(coverLetterData)
          : settings.template === 'professional'
            ? renderProfessionalHtml({ ...resumeData, settings })
            : settings.template === 'minimal'
              ? renderMinimalHtml({ ...resumeData, settings })
              : renderModernHtml({ ...resumeData, settings })

      const { uri } = await Print.printToFileAsync({ html })

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: document.name || 'Resume',
        })
      } else {
        Alert.alert('PDF saved', 'File saved')
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to generate PDF.')
    } finally {
      setIsExporting(false)
    }
  }, [document, docType, resumeData, coverLetterData, settings])

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Spinner />
      </View>
    )
  }

  if (isError || !document) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={{ color: colors.error }}>Failed to load document.</Text>
      </View>
    )
  }

  const basicsContent = (
    <>
      <View style={entryStyles.rowGap12}>
        <View style={entryStyles.flex1}>
          <Field label="Full Name" help="Your name as it should appear in the header.">
            <Input
              placeholder="Full Name"
              value={resumeData.basics.name}
              onChangeText={(v) =>
                setResumeData({
                  ...resumeData,
                  basics: { ...resumeData.basics, name: v },
                })
              }
            />
          </Field>
        </View>
        <View style={entryStyles.flex1}>
          <Field label="Target Title" help="Match this to the role you are applying for.">
            <Input
              placeholder="Job Title"
              value={resumeData.basics.label}
              onChangeText={(v) =>
                setResumeData({
                  ...resumeData,
                  basics: { ...resumeData.basics, label: v },
                })
              }
            />
          </Field>
        </View>
      </View>
      <View style={entryStyles.rowGap12}>
        <View style={entryStyles.flex1}>
          <Field label="Email">
            <Input
              placeholder="Email"
              value={resumeData.basics.email}
              onChangeText={(v) =>
                setResumeData({
                  ...resumeData,
                  basics: { ...resumeData.basics, email: v },
                })
              }
            />
          </Field>
        </View>
        <View style={entryStyles.flex1}>
          <Field label="Phone">
            <Input
              placeholder="Phone"
              value={resumeData.basics.phone}
              onChangeText={(v) =>
                setResumeData({
                  ...resumeData,
                  basics: { ...resumeData.basics, phone: v },
                })
              }
            />
          </Field>
        </View>
      </View>
      <Field label="Location">
        <Input
          placeholder="Location"
          value={resumeData.basics.location}
          onChangeText={(v) =>
            setResumeData({
              ...resumeData,
              basics: { ...resumeData.basics, location: v },
            })
          }
        />
      </Field>
      <Field
        label="Summary"
        help="Two to three lines that connect your strengths to the target role."
      >
        <Textarea
          placeholder="Professional Summary"
          value={resumeData.basics.summary}
          onChangeText={(v) =>
            setResumeData({
              ...resumeData,
              basics: { ...resumeData.basics, summary: v },
            })
          }
        />
      </Field>
    </>
  )

  const renderWorkSection = () => (
    <CollapsibleSection
      title="Work Experience"
      icon="briefcase-outline"
      defaultOpen={false}
    >
      {resumeData.work.map((w, i) => (
        <EntryPanel
          key={i}
          title={w.position || 'Untitled role'}
          meta={w.company || 'Add company'}
          defaultOpen={i === resumeData.work.length - 1}
        >
          <View style={entryStyles.rowGap12}>
            <View style={entryStyles.flex1}>
              <Field label="Company">
                <Input
                  placeholder="Company"
                  value={w.company}
                  onChangeText={(v) => {
                    const work = [...resumeData.work]
                    work[i] = { ...work[i], company: v }
                    setResumeData({ ...resumeData, work })
                  }}
                />
              </Field>
            </View>
            <View style={entryStyles.flex1}>
              <Field label="Role title">
                <Input
                  placeholder="Position"
                  value={w.position}
                  onChangeText={(v) => {
                    const work = [...resumeData.work]
                    work[i] = { ...work[i], position: v }
                    setResumeData({ ...resumeData, work })
                  }}
                />
              </Field>
            </View>
          </View>
          <View style={entryStyles.rowGap12}>
            <View style={entryStyles.flex1}>
              <Field label="Start date">
                <Input
                  placeholder="Jan 2023"
                  value={w.startDate}
                  onChangeText={(v) => {
                    const work = [...resumeData.work]
                    work[i] = { ...work[i], startDate: v }
                    setResumeData({ ...resumeData, work })
                  }}
                />
              </Field>
            </View>
            <View style={entryStyles.flex1}>
              <Field label="End date">
                <Input
                  placeholder="Present"
                  value={w.endDate}
                  onChangeText={(v) => {
                    const work = [...resumeData.work]
                    work[i] = { ...work[i], endDate: v }
                    setResumeData({ ...resumeData, work })
                  }}
                />
              </Field>
            </View>
          </View>
          <Field
            label="Impact bullets"
            help="One result per line. Start with action, scope, and outcome."
          >
            <Textarea
              placeholder="Improved onboarding flow, reducing drop-off by 18%"
              value={w.highlights}
              onChangeText={(v) => {
                const work = [...resumeData.work]
                work[i] = { ...work[i], highlights: v }
                setResumeData({ ...resumeData, work })
              }}
            />
          </Field>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => {
              const work = resumeData.work.filter((_, idx) => idx !== i)
              setResumeData({ ...resumeData, work })
            }}
          >
            <Ionicons name="trash-outline" size={14} color={colors.onError} />
            <Text style={entryStyles.errorChip}>
              Remove role
            </Text>
          </Button>
        </EntryPanel>
      ))}
      <Button
        variant="secondary"
        onPress={() =>
          setResumeData({
            ...resumeData,
            work: [
              ...resumeData.work,
              {
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                highlights: '',
              },
            ],
          })
        }
      >
        <Ionicons name="add" size={14} color={colors.onSecondaryContainer} />
        <Text
          style={entryStyles.secondaryChip}
        >
          Add Experience
        </Text>
      </Button>
    </CollapsibleSection>
  )

  const renderEducationSection = () => (
    <CollapsibleSection
      title="Education"
      icon="school-outline"
      defaultOpen={false}
    >
      {resumeData.education.map((edu, i) => (
        <EntryPanel
          key={i}
          title={edu.institution || 'Untitled education'}
          meta={
            [edu.studyType, edu.area].filter(Boolean).join(' in ') ||
            'Add degree details'
          }
          defaultOpen={i === resumeData.education.length - 1}
        >
          <Field label="Institution">
            <Input
              placeholder="Institution"
              value={edu.institution}
              onChangeText={(v) => {
                const ed = [...resumeData.education]
                ed[i] = { ...ed[i], institution: v }
                setResumeData({ ...resumeData, education: ed })
              }}
            />
          </Field>
          <View style={entryStyles.rowGap12}>
            <View style={entryStyles.flex1}>
              <Field label="Degree">
                <Input
                  placeholder="BSc, MBA"
                  value={edu.studyType}
                  onChangeText={(v) => {
                    const ed = [...resumeData.education]
                    ed[i] = { ...ed[i], studyType: v }
                    setResumeData({ ...resumeData, education: ed })
                  }}
                />
              </Field>
            </View>
            <View style={entryStyles.flex1}>
              <Field label="Area of study">
                <Input
                  placeholder="Computer Science"
                  value={edu.area}
                  onChangeText={(v) => {
                    const ed = [...resumeData.education]
                    ed[i] = { ...ed[i], area: v }
                    setResumeData({ ...resumeData, education: ed })
                  }}
                />
              </Field>
            </View>
          </View>
          <View style={entryStyles.rowGap12}>
            <View style={entryStyles.flex1}>
              <Field label="Start date">
                <Input
                  placeholder="2019"
                  value={edu.startDate}
                  onChangeText={(v) => {
                    const ed = [...resumeData.education]
                    ed[i] = { ...ed[i], startDate: v }
                    setResumeData({ ...resumeData, education: ed })
                  }}
                />
              </Field>
            </View>
            <View style={entryStyles.flex1}>
              <Field label="End date">
                <Input
                  placeholder="2023"
                  value={edu.endDate}
                  onChangeText={(v) => {
                    const ed = [...resumeData.education]
                    ed[i] = { ...ed[i], endDate: v }
                    setResumeData({ ...resumeData, education: ed })
                  }}
                />
              </Field>
            </View>
          </View>
          <Field label="Score / GPA">
            <Input
              placeholder="3.8 GPA"
              value={edu.score}
              onChangeText={(v) => {
                const ed = [...resumeData.education]
                ed[i] = { ...ed[i], score: v }
                setResumeData({ ...resumeData, education: ed })
              }}
            />
          </Field>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => {
              const ed = resumeData.education.filter((_, idx) => idx !== i)
              setResumeData({ ...resumeData, education: ed })
            }}
          >
            <Ionicons name="trash-outline" size={14} color={colors.onError} />
            <Text style={entryStyles.errorChip}>
              Remove education
            </Text>
          </Button>
        </EntryPanel>
      ))}
      <Button
        variant="secondary"
        onPress={() =>
          setResumeData({
            ...resumeData,
            education: [
              ...resumeData.education,
              {
                institution: '',
                area: '',
                studyType: '',
                startDate: '',
                endDate: '',
                score: '',
              },
            ],
          })
        }
      >
           <Ionicons name="add" size={14} color={colors.onSecondaryContainer} />
        <Text
          style={entryStyles.secondaryChip}
        >
          Add Education
        </Text>
      </Button>
    </CollapsibleSection>
  )

  const renderSkillsSection = () => (
        <CollapsibleSection
          title="Skills"
          icon="bulb-outline"
          defaultOpen={false}
        >
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {resumeData.skills.map((skill, i) => (
              <View key={i} style={skillStyles.chip}>
                <Text style={skillStyles.chipText}>{skill.name}</Text>
      <Pressable
        onPress={() => {
          const s = resumeData.skills.filter((_, idx) => idx !== i)
          setResumeData({ ...resumeData, skills: s })
        }}
        hitSlop={8}
        accessibilityRole="button"
      >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={colors.onSurfaceVariant}
                  />
                </Pressable>
              </View>
            ))}
          </View>
          <Field
            label="Add skill"
            help="Type a skill and press Enter/Return."
          >
            <Input
              placeholder="React, API design, ..."
              onSubmitEditing={(e) => {
                const v = e.nativeEvent.text.trim()
                if (v) {
                  setResumeData({
                    ...resumeData,
                    skills: [
                      ...resumeData.skills,
                      { name: v, level: '', keywords: '' },
                    ],
                  })
                }
              }}
            />
          </Field>
        </CollapsibleSection>
  )

  const renderProjectsSection = () => (
    <CollapsibleSection
      title="Projects"
      icon="code-outline"
      defaultOpen={false}
    >
      {resumeData.projects.map((proj, i) => (
        <EntryPanel
          key={i}
          title={proj.name || 'Untitled project'}
          meta={proj.url || 'Add URL'}
          defaultOpen={i === resumeData.projects.length - 1}
        >
          <Field label="Project Name">
            <Input
              placeholder="Orbit App"
              value={proj.name}
              onChangeText={(v) => {
                const p = [...resumeData.projects]
                p[i] = { ...p[i], name: v }
                setResumeData({ ...resumeData, projects: p })
              }}
            />
          </Field>
          <Field label="URL">
            <Input
              placeholder="https://..."
              value={proj.url}
              onChangeText={(v) => {
                const p = [...resumeData.projects]
                p[i] = { ...p[i], url: v }
                setResumeData({ ...resumeData, projects: p })
              }}
            />
          </Field>
          <View style={entryStyles.rowGap12}>
            <View style={entryStyles.flex1}>
              <Field label="Start date">
                <Input
                  placeholder="Jan 2023"
                  value={proj.startDate}
                  onChangeText={(v) => {
                    const p = [...resumeData.projects]
                    p[i] = { ...p[i], startDate: v }
                    setResumeData({ ...resumeData, projects: p })
                  }}
                />
              </Field>
            </View>
            <View style={entryStyles.flex1}>
              <Field label="End date">
                <Input
                  placeholder="Present"
                  value={proj.endDate}
                  onChangeText={(v) => {
                    const p = [...resumeData.projects]
                    p[i] = { ...p[i], endDate: v }
                    setResumeData({ ...resumeData, projects: p })
                  }}
                />
              </Field>
            </View>
          </View>
          <Field label="Highlights">
            <Textarea
              placeholder="Built with React and Node.js..."
              value={proj.highlights}
              onChangeText={(v) => {
                const p = [...resumeData.projects]
                p[i] = { ...p[i], highlights: v }
                setResumeData({ ...resumeData, projects: p })
              }}
            />
          </Field>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => {
              const p = resumeData.projects.filter((_, idx) => idx !== i)
              setResumeData({ ...resumeData, projects: p })
            }}
          >
            <Ionicons name="trash-outline" size={14} color={colors.onError} />
            <Text style={entryStyles.errorChip}>
              Remove project
            </Text>
          </Button>
        </EntryPanel>
      ))}
      <Button
        variant="secondary"
        onPress={() =>
          setResumeData({
            ...resumeData,
            projects: [
              ...resumeData.projects,
              {
                name: '',
                description: '',
                highlights: '',
                url: '',
                startDate: '',
                endDate: '',
              },
            ],
          })
        }
      >
           <Ionicons name="add" size={14} color={colors.onSecondaryContainer} />
        <Text
          style={entryStyles.secondaryChip}
        >
          Add Project
        </Text>
      </Button>
    </CollapsibleSection>
  )

  const renderCertificationsSection = () => (
    <CollapsibleSection
      title="Certifications"
      icon="ribbon-outline"
      defaultOpen={false}
    >
      {resumeData.certifications.map((cert, i) => (
        <EntryPanel
          key={i}
          title={cert.name || 'Untitled certification'}
          meta={cert.issuer || 'Add issuer'}
          defaultOpen={i === resumeData.certifications.length - 1}
        >
          <Field label="Certificate Name">
            <Input
              placeholder="AWS Solutions Architect"
              value={cert.name}
              onChangeText={(v) => {
                const c = [...resumeData.certifications]
                c[i] = { ...c[i], name: v }
                setResumeData({ ...resumeData, certifications: c })
              }}
            />
          </Field>
          <Field label="Issuer">
            <Input
              placeholder="Amazon Web Services"
              value={cert.issuer}
              onChangeText={(v) => {
                const c = [...resumeData.certifications]
                c[i] = { ...c[i], issuer: v }
                setResumeData({ ...resumeData, certifications: c })
              }}
            />
          </Field>
          <View style={entryStyles.rowGap12}>
            <View style={entryStyles.flex1}>
              <Field label="Date">
                <Input
                  placeholder="Jan 2023"
                  value={cert.startDate}
                  onChangeText={(v) => {
                    const c = [...resumeData.certifications]
                    c[i] = { ...c[i], startDate: v }
                    setResumeData({ ...resumeData, certifications: c })
                  }}
                />
              </Field>
            </View>
            <View style={entryStyles.flex1}>
              <Field label="URL">
                <Input
                  placeholder="https://..."
                  value={cert.url}
                  onChangeText={(v) => {
                    const c = [...resumeData.certifications]
                    c[i] = { ...c[i], url: v }
                    setResumeData({ ...resumeData, certifications: c })
                  }}
                />
              </Field>
            </View>
          </View>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => {
              const c = resumeData.certifications.filter((_, idx) => idx !== i)
              setResumeData({ ...resumeData, certifications: c })
            }}
          >
            <Ionicons name="trash-outline" size={14} color={colors.onError} />
            <Text style={entryStyles.errorChip}>
              Remove certification
            </Text>
          </Button>
        </EntryPanel>
      ))}
      <Button
        variant="secondary"
        onPress={() =>
          setResumeData({
            ...resumeData,
            certifications: [
              ...resumeData.certifications,
              {
                name: '',
                issuer: '',
                startDate: '',
                endDate: '',
                url: '',
                highlights: '',
              },
            ],
          })
        }
      >
        <Ionicons name="add" size={14} color={colors.onSecondaryContainer} />
        <Text
          style={entryStyles.secondaryChip}
        >
          Add Certification
        </Text>
      </Button>
    </CollapsibleSection>
  )

  const renderVolunteerSection = () => (
    <CollapsibleSection
      title="Volunteer"
      icon="heart-outline"
      defaultOpen={false}
    >
      {resumeData.volunteer.map((vol, i) => (
        <EntryPanel
          key={i}
          title={vol.position || 'New volunteer role'}
          meta={vol.organization || 'Organization name'}
          defaultOpen={i === resumeData.volunteer.length - 1}
        >
          <View style={entryStyles.rowGap12}>
            <View style={entryStyles.flex1}>
              <Field label="Organization">
                <Input
                  placeholder="Red Cross"
                  value={vol.organization}
                  onChangeText={(v) => {
                    const vl = [...resumeData.volunteer]
                    vl[i] = { ...vl[i], organization: v }
                    setResumeData({ ...resumeData, volunteer: vl })
                  }}
                />
              </Field>
            </View>
            <View style={entryStyles.flex1}>
              <Field label="Role">
                <Input
                  placeholder="Volunteer"
                  value={vol.position}
                  onChangeText={(v) => {
                    const vl = [...resumeData.volunteer]
                    vl[i] = { ...vl[i], position: v }
                    setResumeData({ ...resumeData, volunteer: vl })
                  }}
                />
              </Field>
            </View>
          </View>
          <View style={entryStyles.rowGap12}>
            <View style={entryStyles.flex1}>
              <Field label="Start date">
                <Input
                  placeholder="Jan 2023"
                  value={vol.startDate}
                  onChangeText={(v) => {
                    const vl = [...resumeData.volunteer]
                    vl[i] = { ...vl[i], startDate: v }
                    setResumeData({ ...resumeData, volunteer: vl })
                  }}
                />
              </Field>
            </View>
            <View style={entryStyles.flex1}>
              <Field label="End date">
                <Input
                  placeholder="Present"
                  value={vol.endDate}
                  onChangeText={(v) => {
                    const vl = [...resumeData.volunteer]
                    vl[i] = { ...vl[i], endDate: v }
                    setResumeData({ ...resumeData, volunteer: vl })
                  }}
                />
              </Field>
            </View>
          </View>
          <Field
            label="Impact bullets"
            help="One result per line."
          >
            <Textarea
              placeholder="Organized community food drive serving 200+ families"
              value={vol.highlights}
              onChangeText={(v) => {
                const vl = [...resumeData.volunteer]
                vl[i] = { ...vl[i], highlights: v }
                setResumeData({ ...resumeData, volunteer: vl })
              }}
            />
          </Field>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => {
              const vl = resumeData.volunteer.filter((_, idx) => idx !== i)
              setResumeData({ ...resumeData, volunteer: vl })
            }}
          >
            <Ionicons name="trash-outline" size={14} color={colors.onError} />
            <Text style={entryStyles.errorChip}>
              Remove
            </Text>
          </Button>
        </EntryPanel>
      ))}
      <Button
        variant="secondary"
        onPress={() =>
          setResumeData({
            ...resumeData,
            volunteer: [
              ...resumeData.volunteer,
              {
                organization: '',
                position: '',
                startDate: '',
                endDate: '',
                highlights: '',
              },
            ],
          })
        }
      >
        <Ionicons name="add" size={14} color={colors.onSecondaryContainer} />
        <Text
          style={entryStyles.secondaryChip}
        >
          Add Volunteer
        </Text>
      </Button>
    </CollapsibleSection>
  )

  const renderLanguagesSection = () => (
    <CollapsibleSection
      title="Languages"
      icon="globe-outline"
      defaultOpen={false}
    >
      {resumeData.languages.map((lang, i) => (
        <EntryPanel
          key={i}
          title={lang.name || 'New language'}
          meta={lang.fluency || 'Proficiency level'}
          defaultOpen={i === resumeData.languages.length - 1}
        >
          <View style={entryStyles.rowGap12}>
            <View style={entryStyles.flex1}>
              <Field label="Language">
                <Input
                  placeholder="English"
                  value={lang.name}
                  onChangeText={(v) => {
                    const l = [...resumeData.languages]
                    l[i] = { ...l[i], name: v }
                    setResumeData({ ...resumeData, languages: l })
                  }}
                />
              </Field>
            </View>
            <View style={entryStyles.flex1}>
              <Field label="Fluency">
                <Input
                  placeholder="Native"
                  value={lang.fluency}
                  onChangeText={(v) => {
                    const l = [...resumeData.languages]
                    l[i] = { ...l[i], fluency: v }
                    setResumeData({ ...resumeData, languages: l })
                  }}
                />
              </Field>
            </View>
          </View>
          <Field
            label="Proficiency details"
            help="Optional certifications or context."
          >
            <Textarea
              placeholder="IELTS 8.0, 10 years professional use"
              value={lang.highlights}
              onChangeText={(v) => {
                const l = [...resumeData.languages]
                l[i] = { ...l[i], highlights: v }
                setResumeData({ ...resumeData, languages: l })
              }}
            />
          </Field>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => {
              const l = resumeData.languages.filter((_, idx) => idx !== i)
              setResumeData({ ...resumeData, languages: l })
            }}
          >
            <Ionicons name="trash-outline" size={14} color={colors.onError} />
            <Text style={entryStyles.errorChip}>
              Remove language
            </Text>
          </Button>
        </EntryPanel>
      ))}
      <Button
        variant="secondary"
        onPress={() =>
          setResumeData({
            ...resumeData,
            languages: [
              ...resumeData.languages,
              { name: '', fluency: '', highlights: '', startDate: '' },
            ],
          })
        }
      >
        <Ionicons name="add" size={14} color={colors.onSecondaryContainer} />
        <Text
          style={entryStyles.secondaryChip}
        >
          Add Language
        </Text>
      </Button>
    </CollapsibleSection>
  )

  const resumeForm = (
    <View style={{ gap: 16 }}>
      <CollapsibleSection
        title="Layout & Style"
        icon="options-outline"
        defaultOpen={true}
      >
        <SegmentedControl
          label="Template style"
          description="Modern is accent-led, Professional is classic, Minimal keeps density high."
          value={settings.template}
          options={['modern', 'professional', 'minimal'] as const}
          onChange={(template) =>
            setSettings((prev) => ({
              ...prev,
              template: template as ResumeSettings['template'],
            }))
          }
        />
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontSize: Typography.label.sm,
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: hexa(colors.primary, 0.60),
              fontFamily: Fonts.body,
            }}
          >
            Accent Color
          </Text>
          <View style={entryStyles.colorPickerRow}>
            {COLOR_PRESETS.map((color) => (
              <Pressable
                key={color}
                onPress={() =>
                  setSettings((prev) => ({ ...prev, color }))
                }
                accessibilityRole="button"
                style={[
                  entryStyles.colorSwatch,
                  { backgroundColor: color },
                  settings.color === color && [
                    entryStyles.colorSwatchActive,
                    {
                      shadowColor: color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 6,
                    },
                  ],
                ]}
              />
            ))}
          </View>
        </View>
        <SegmentedControl
          label="Text size"
          description="Use small for dense resumes, large for senior profiles."
          value={settings.fontSize}
          options={['small', 'medium', 'large'] as const}
          onChange={(fontSize) =>
            setSettings((prev) => ({
              ...prev,
              fontSize: fontSize as ResumeSettings['fontSize'],
            }))
          }
        />
        <SegmentedControl
          label="Line spacing"
          description="Controls vertical rhythm inside paragraphs and bullets."
          value={settings.lineSpacing}
          options={['compact', 'normal', 'relaxed'] as const}
          onChange={(lineSpacing) =>
            setSettings((prev) => ({
              ...prev,
              lineSpacing: lineSpacing as ResumeSettings['lineSpacing'],
            }))
          }
        />
        <SegmentedControl
          label="Page margins"
          description="Narrow fits more content; wide creates editorial look."
          value={settings.margin}
          options={['narrow', 'normal', 'wide'] as const}
          onChange={(margin) =>
            setSettings((prev) => ({
              ...prev,
              margin: margin as ResumeSettings['margin'],
            }))
          }
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Basics"
        icon="person-outline"
        defaultOpen={true}
      >
        {basicsContent}
      </CollapsibleSection>

      {renderWorkSection()}
      {renderEducationSection()}
      {renderSkillsSection()}
      {renderProjectsSection()}
      {renderCertificationsSection()}
      {renderVolunteerSection()}
      {renderLanguagesSection()}
    </View>
  )

  const coverLetterForm = (
    <View style={{ gap: 16 }}>
      <CollapsibleSection
        title="Recipient Details"
        icon="person-outline"
        defaultOpen={true}
      >
        <Field label="Your Name" help="Shown under the sign-off.">
          <Input
            placeholder="e.g. Jane Smith"
            value={coverLetterData.senderName}
            onChangeText={(v) =>
              setCoverLetterData({ ...coverLetterData, senderName: v })
            }
          />
        </Field>
        <Field
          label="Recipient Name"
          help="Leave blank if you don't know the hiring manager."
        >
          <Input
            placeholder="e.g. John Doe"
            value={coverLetterData.recipientName}
            onChangeText={(v) =>
              setCoverLetterData({ ...coverLetterData, recipientName: v })
            }
          />
        </Field>
        <View style={entryStyles.rowGap12}>
          <View style={entryStyles.flex1}>
            <Field label="Recipient Title">
              <Input
                placeholder="Hiring Manager"
                value={coverLetterData.recipientTitle}
                onChangeText={(v) =>
                  setCoverLetterData({ ...coverLetterData, recipientTitle: v })
                }
              />
            </Field>
          </View>
          <View style={entryStyles.flex1}>
            <Field label="Company">
              <Input
                placeholder="Acme Inc."
                value={coverLetterData.company}
                onChangeText={(v) =>
                  setCoverLetterData({ ...coverLetterData, company: v })
                }
              />
            </Field>
          </View>
        </View>
        <Field label="Company Address" help="Optional formal letter layout.">
          <Input
            placeholder="123 Tech Lane, San Francisco, CA"
            value={coverLetterData.address}
            onChangeText={(v) =>
              setCoverLetterData({ ...coverLetterData, address: v })
            }
          />
        </Field>
        <Field label="Recipient Email" help="Optional internal reference.">
          <Input
            placeholder="hiring@acme.com"
            value={coverLetterData.email}
            onChangeText={(v) =>
              setCoverLetterData({ ...coverLetterData, email: v })
            }
          />
        </Field>
      </CollapsibleSection>

      <CollapsibleSection
        title="Letter Content"
        icon="mail-outline"
        defaultOpen={true}
      >
        <Field
          label="Opening Paragraph"
          help="Name the role and state why this company interests you."
        >
          <Textarea
            placeholder="I am writing to express my interest..."
            value={coverLetterData.opening}
            onChangeText={(v) =>
              setCoverLetterData({ ...coverLetterData, opening: v })
            }
          />
        </Field>
        <Field
          label="Body Paragraphs"
          help="One paragraph per proof point."
        >
          <Textarea
            placeholder="Highlight your relevant experience..."
            value={coverLetterData.body}
            onChangeText={(v) =>
              setCoverLetterData({ ...coverLetterData, body: v })
            }
          />
        </Field>
        <Field
          label="Closing Paragraph"
          help="Close with confidence and a clear next step."
        >
          <Textarea
            placeholder="Thank you for considering my application..."
            value={coverLetterData.closing}
            onChangeText={(v) =>
              setCoverLetterData({ ...coverLetterData, closing: v })
            }
          />
        </Field>
        <Field label="Sign-off" help="e.g. Best regards, Sincerely.">
          <Input
            placeholder="Best regards,"
            value={coverLetterData.signature}
            onChangeText={(v) =>
              setCoverLetterData({ ...coverLetterData, signature: v })
            }
          />
        </Field>
      </CollapsibleSection>
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <View style={entryStyles.flex1}>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Untitled Document"
            containerStyle={entryStyles.nameInput}
          />
          <Text style={styles.docType}>
            {docType === 'COVER_LETTER' ? 'Cover Letter' : 'Resume'}
            {updateResume.isPending ? ' · Saving...' : ''}
          </Text>
        </View>
        <Button
          size="sm"
          onPress={handleExportPdf}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Ionicons
              name="download-outline"
              size={16}
              color={colors.onPrimary}
            />
          )}
          <Text
            style={{
              color: colors.onPrimary,
              fontWeight: '600',
              fontSize: Typography.label.md,
              marginLeft: 4,
              fontFamily: Fonts.body,
            }}
          >
            PDF
          </Text>
        </Button>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {docType === 'COVER_LETTER' ? coverLetterForm : resumeForm}
      </ScrollView>
    </View>
  )
}

function getSkillStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: c.surfaceContainer,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: c.outline,
    },
    chipText: {
      fontSize: Typography.body.sm,
      color: c.onSurface,
      fontFamily: Fonts.body,
    },
  })
}

function getBuilderStyles(c: typeof Colors.light) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    emptyLoading: {
      flex: 1,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 1,
      borderBottomColor: c.outlineVariant,
      backgroundColor: c.surface,
    },
    backButton: {
      padding: 4,
    },

    docType: {
      fontSize: Typography.body.sm,
      color: c.onSurfaceVariant,
      marginTop: 1,
      fontFamily: Fonts.body,
    },
    scrollArea: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
      gap: 16,
    },
  })
}
