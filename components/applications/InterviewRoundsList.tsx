import React, { useCallback, useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { Colors, Typography, Fonts } from '@/constants/theme'
import { useColors } from '@/hooks/useColors'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { ROUND_TYPES, OUTCOMES } from '@/features/applications/api/useApplicationDetails'

export interface InterviewRound {
  id: string
  applicationId: string
  roundType: 'PHONE_SCREEN' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'FINAL' | 'OTHER'
  scheduledAt: string | null
  interviewerName: string | null
  notes: string | null
  outcome: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null
}

interface InterviewRoundsListProps {
  rounds: InterviewRound[]
  isLoading?: boolean
  onAdd: (data: { roundType: string; scheduledAt?: string; interviewerName?: string; notes?: string; outcome?: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function InterviewRoundsList({ rounds, isLoading, onAdd, onDelete }: InterviewRoundsListProps) {
  const colors = useColors()
  const s = getStyles(colors)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [roundType, setRoundType] = useState('PHONE_SCREEN')
  const [scheduledAt, setScheduledAt] = useState('')
  const [interviewerName, setInterviewerName] = useState('')
  const [notes, setNotes] = useState('')
  const [outcome, setOutcome] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setRoundType('PHONE_SCREEN')
    setScheduledAt('')
    setInterviewerName('')
    setNotes('')
    setOutcome('')
  }

  const handleAdd = async () => {
    setIsSubmitting(true)
    try {
      await onAdd({ roundType, scheduledAt: scheduledAt || undefined, interviewerName: interviewerName || undefined, notes: notes || undefined, outcome: outcome || undefined })
      setIsAddOpen(false)
      resetForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddToCalendar = useCallback(async (round: InterviewRound) => {
    const label = ROUND_TYPES.find(r => r.value === round.roundType)?.label || 'Interview'
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(label)}&dates=${round.scheduledAt ? new Date(round.scheduledAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : ''}&details=${encodeURIComponent(round.notes || '')}`
    await WebBrowser.openBrowserAsync(url)
  }, [])

  if (isLoading) return <Spinner />

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Ionicons name="calendar-outline" size={16} color={colors.accent} />
        <Text style={s.title}>Interviews</Text>
        <View style={s.spacer} />
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger>
            <Button variant="outline" size="sm">Log Interview</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Interview Round</DialogTitle>
              <DialogDescription>Record details about an interview round</DialogDescription>
            </DialogHeader>
            <View style={s.formFields}>
              <View>
                <Text style={s.label}>Round Type *</Text>
                <Select value={roundType} onValueChange={setRoundType} options={ROUND_TYPES.map(r => ({ label: r.label, value: r.value }))} />
              </View>
              <View>
                <Text style={s.label}>Date</Text>
                <Input containerStyle={s.input} value={scheduledAt} onChangeText={setScheduledAt} placeholder="2025-03-15T10:00" />
              </View>
              <View>
                <Text style={s.label}>Interviewer</Text>
                <Input containerStyle={s.input} value={interviewerName} onChangeText={setInterviewerName} placeholder="John Doe" />
              </View>
              <View>
                <Text style={s.label}>Notes</Text>
                <Input containerStyle={s.input} value={notes} onChangeText={setNotes} placeholder="Notes about the interview..." multiline textAlignVertical="top" />
              </View>
              <View>
                <Text style={s.label}>Outcome</Text>
                <Select value={outcome} onValueChange={setOutcome} options={[{ label: 'Pending', value: '' }, ...OUTCOMES.map(o => ({ label: o.label, value: o.value }))]} />
              </View>
            </View>
            <DialogFooter>
              <Button variant="outline" onPress={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onPress={handleAdd} disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Log Interview'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </View>

      {rounds.length > 0 ? (
        <View style={s.list}>
          {rounds.map((round) => (
            <RoundItem key={round.id} round={round} onAddToCalendar={handleAddToCalendar} onDelete={onDelete} />
          ))}
        </View>
      ) : (
        <View style={s.empty}>
          <Ionicons name="calendar-outline" size={32} color={colors.onSurfaceVariant} />
          <Text style={s.emptyText}>No interview rounds logged yet</Text>
        </View>
      )}
    </View>
  )
}

const getStyles = (c: typeof Colors.light) => StyleSheet.create({
  container: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: c.outline, paddingBottom: 12 },
  title: { fontSize: Typography.label.lg, fontWeight: '700', fontFamily: Fonts.body, textTransform: 'uppercase', letterSpacing: 0.5, color: c.onSurface },
  spacer: { flex: 1 },
  formFields: { gap: 12 },
  label: { fontSize: Typography.label.md, fontWeight: '600', fontFamily: Fonts.body, color: c.onSurface, marginBottom: 4 },
  input: { borderRadius: 10, borderWidth: 1, borderColor: c.outline, paddingHorizontal: 12, fontSize: Typography.body.sm, fontFamily: Fonts.body, color: c.onSurface, backgroundColor: c.input },
  list: { gap: 8 },
  roundItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surface },
  roundLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roundIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: c.accentContainer, alignItems: 'center', justifyContent: 'center' },
  roundType: { fontSize: Typography.body.sm, fontWeight: '600', fontFamily: Fonts.body, color: c.onSurface },
  roundMeta: { flexDirection: 'row', gap: 4 },
  roundMetaText: { fontSize: Typography.label.md, fontFamily: Fonts.body, color: c.onSurfaceVariant },
  roundOutcome: { fontSize: Typography.label.sm, fontWeight: '600', fontFamily: Fonts.body, color: c.accent, marginTop: 2 },
  roundActions: { flexDirection: 'row', gap: 8 },
  empty: { alignItems: 'center', padding: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: c.outline, borderRadius: 12, gap: 8 },
  emptyText: { fontSize: Typography.body.sm, fontFamily: Fonts.body, color: c.onSurfaceVariant },
})

const styles = getStyles(Colors.light)

const RoundItem = React.memo(function RoundItem({
  round,
  onAddToCalendar,
  onDelete,
}: {
  round: InterviewRound
  onAddToCalendar: (round: InterviewRound) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const colors = useColors()
  const s = getStyles(colors)
  return (
    <View style={s.roundItem}>
      <View style={s.roundLeft}>
        <View style={s.roundIcon}>
          <Ionicons name="calendar-outline" size={18} color={colors.onAccentContainer} />
        </View>
        <View>
          <Text style={s.roundType}>{ROUND_TYPES.find(r => r.value === round.roundType)?.label || round.roundType}</Text>
          <View style={s.roundMeta}>
            {round.scheduledAt && <Text style={s.roundMetaText}>{new Date(round.scheduledAt).toLocaleDateString()}</Text>}
            {round.interviewerName && <Text style={s.roundMetaText}>· {round.interviewerName}</Text>}
          </View>
          {round.outcome && <Text style={s.roundOutcome}>{OUTCOMES.find(o => o.value === round.outcome)?.label}</Text>}
        </View>
      </View>
      <View style={s.roundActions}>
        {round.scheduledAt && (
          <Pressable onPress={() => onAddToCalendar(round)}>
            <Ionicons name="calendar-outline" size={16} color={colors.accent} />
          </Pressable>
        )}
        <Pressable onPress={() => onDelete(round.id)}>
          <Ionicons name="trash-outline" size={16} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>
    </View>
  )
})

export { InterviewRoundsList }
