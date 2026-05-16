import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { APPLICATION_STATUSES, APPLICATION_STATUS_CONFIG } from '@/lib/status'

const applicationSchema = z.object({
  company: z.string().trim().min(1, 'Company name is required'),
  jobTitle: z.string().trim().min(1, 'Job title is required'),
  applicationStatus: z.enum(['SAVED', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'CLOSED']),
  jobURL: z.string().optional(),
  location: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  appliedDate: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpNote: z.string().optional(),
  source: z.string().optional(),
})

export type ApplicationFormValues = z.infer<typeof applicationSchema>

interface ApplicationFormProps {
  initialData?: {
    company?: string
    jobTitle?: string
    applicationStatus?: string
    jobURL?: string
    location?: string
    salaryMin?: number | null
    salaryMax?: number | null
    appliedDate?: string
    notes?: string
    followUpDate?: string
    followUpNote?: string
    source?: string
  }
  onSubmit: (data: ApplicationFormValues) => Promise<void>
  isSubmitting: boolean
  onDelete?: () => Promise<void>
  isDeleting?: boolean
}

function ApplicationForm({ initialData, onSubmit, isSubmitting, onDelete, isDeleting }: ApplicationFormProps) {
  const colors = useColors()
  const s = getStyles(colors)
  const { control, handleSubmit, formState: { errors } } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company: initialData?.company || '',
      jobTitle: initialData?.jobTitle || '',
      applicationStatus: (initialData?.applicationStatus || 'SAVED') as any,
      jobURL: initialData?.jobURL || '',
      location: initialData?.location || '',
      salaryMin: initialData?.salaryMin?.toString() || '',
      salaryMax: initialData?.salaryMax?.toString() || '',
      appliedDate: initialData?.appliedDate || '',
      notes: initialData?.notes || '',
      followUpDate: initialData?.followUpDate || '',
      followUpNote: initialData?.followUpNote || '',
      source: initialData?.source || '',
    },
  })

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.fields}>
        <View style={s.row}>
          <View style={s.half}>
            <Label required>Company</Label>
            <Controller name="company" control={control} render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Acme Corp" error={errors.company?.message} />
            )} />
          </View>
          <View style={s.half}>
            <Label required>Job Title</Label>
            <Controller name="jobTitle" control={control} render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Backend Engineer" error={errors.jobTitle?.message} />
            )} />
          </View>
        </View>

        <View>
          <Label required>Status</Label>
          <Controller name="applicationStatus" control={control} render={({ field: { onChange, value } }) => (
            <Select value={value} onValueChange={onChange} options={APPLICATION_STATUSES.map(s => ({ label: APPLICATION_STATUS_CONFIG[s].label, value: s }))} />
          )} />
        </View>

        <View>
          <Label>Job URL</Label>
          <Controller name="jobURL" control={control} render={({ field: { onChange, onBlur, value } }) => (
            <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="https://..." keyboardType="url" />
          )} />
        </View>

        <View style={s.row}>
          <View style={s.half}>
            <Label>Location</Label>
            <Controller name="location" control={control} render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Remote, New York..." />
            )} />
          </View>
          <View style={s.half}>
            <Label>Applied Date</Label>
            <Controller name="appliedDate" control={control} render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="YYYY-MM-DD" />
            )} />
          </View>
        </View>

        <View style={s.row}>
          <View style={s.half}>
            <Label>Min Salary</Label>
            <Controller name="salaryMin" control={control} render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="80000" keyboardType="numeric" />
            )} />
          </View>
          <View style={s.half}>
            <Label>Max Salary</Label>
            <Controller name="salaryMax" control={control} render={({ field: { onChange, onBlur, value } }) => (
              <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="120000" keyboardType="numeric" />
            )} />
          </View>
        </View>

        <View>
          <Label>Source</Label>
          <Controller name="source" control={control} render={({ field: { onChange, onBlur, value } }) => (
            <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="LinkedIn, Indeed, Referral..." />
          )} />
        </View>

        <View>
          <Label>Notes</Label>
          <Controller name="notes" control={control} render={({ field: { onChange, onBlur, value } }) => (
            <Textarea onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Any context, referrals, or interview details..." />
          )} />
        </View>

        <View style={s.divider} />

        <View>
          <Label>Follow-up Date</Label>
          <Controller name="followUpDate" control={control} render={({ field: { onChange, onBlur, value } }) => (
            <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="YYYY-MM-DD" />
          )} />
        </View>

        <View>
          <Label>Follow-up Note</Label>
          <Controller name="followUpNote" control={control} render={({ field: { onChange, onBlur, value } }) => (
            <Input onBlur={onBlur} onChangeText={onChange} value={value} placeholder="Ask about timeline..." />
          )} />
        </View>

        <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting} loading={isSubmitting}>
          {initialData ? 'Save Changes' : 'Create Application'}
        </Button>
      </View>

      {onDelete && (
        <View style={s.deleteSection}>
          <Button variant="destructive" onPress={onDelete} disabled={isDeleting} loading={isDeleting}>Delete Application</Button>
        </View>
      )}
    </ScrollView>
  )
}

const getStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 24, paddingBottom: 40 },
  fields: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  divider: { height: 1, backgroundColor: c.outline },
  deleteSection: { borderTopWidth: 1, borderTopColor: c.outline, paddingTop: 16 },
})

const styles = getStyles(Colors.light)

export { ApplicationForm }
