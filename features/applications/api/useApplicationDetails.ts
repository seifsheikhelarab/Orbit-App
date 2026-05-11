import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Contact {
  id: string
  applicationId: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  linkedinUrl: string | null
  createdAt: string
}

export interface InterviewRound {
  id: string
  applicationId: string
  roundType: 'PHONE_SCREEN' | 'TECHNICAL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'FINAL' | 'OTHER'
  scheduledAt: string | null
  interviewerName: string | null
  notes: string | null
  outcome: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | null
  createdAt: string
}

export interface StatusHistoryItem {
  id: string
  applicationId: string
  fromStatus: string | null
  toStatus: string
  note: string | null
  changedAt: string
}

export function useContacts(applicationId: string) {
  return useQuery({
    queryKey: ['contacts', applicationId],
    queryFn: async () => {
      const res = await api.get(`/applications/${applicationId}/contacts`)
      return (res.data?.data ?? res.data) ?? []
    },
    enabled: !!applicationId,
  })
}

export function useCreateContact(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (contact: { name: string; title?: string; email?: string; phone?: string; linkedinUrl?: string }) => {
      return api.post(`/applications/${applicationId}/contacts`, contact)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', applicationId] })
    },
  })
}

export function useUpdateContact(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ contactId, contact }: { contactId: string; contact: { name?: string; title?: string; email?: string; phone?: string; linkedinUrl?: string } }) => {
      return api.patch(`/applications/${applicationId}/contacts/${contactId}`, contact)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', applicationId] })
    },
  })
}

export function useDeleteContact(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (contactId: string) => {
      return api.delete(`/applications/${applicationId}/contacts/${contactId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', applicationId] })
    },
  })
}

export function useInterviewRounds(applicationId: string) {
  return useQuery({
    queryKey: ['interviewRounds', applicationId],
    queryFn: async () => {
      const res = await api.get(`/applications/${applicationId}/interviews`)
      return (res.data?.data ?? res.data) ?? []
    },
    enabled: !!applicationId,
  })
}

export function useCreateInterviewRound(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (round: { roundType: string; scheduledAt?: string; interviewerName?: string; notes?: string; outcome?: string }) => {
      return api.post(`/applications/${applicationId}/interviews`, round)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewRounds', applicationId] })
    },
  })
}

export function useUpdateInterviewRound(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ roundId, round }: { roundId: string; round: { roundType?: string; scheduledAt?: string; interviewerName?: string; notes?: string; outcome?: string } }) => {
      return api.patch(`/applications/${applicationId}/interviews/${roundId}`, round)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewRounds', applicationId] })
    },
  })
}

export function useDeleteInterviewRound(applicationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (roundId: string) => {
      return api.delete(`/applications/${applicationId}/interviews/${roundId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewRounds', applicationId] })
    },
  })
}

export function useUpcomingInterviews() {
  return useQuery({
    queryKey: ['interviews', 'upcoming'],
    queryFn: async () => {
      const res = await api.get('/applications/interviews/upcoming')
      return (res.data?.data ?? res.data) ?? []
    },
  })
}

export function useStatusHistory(applicationId: string) {
  return useQuery({
    queryKey: ['statusHistory', applicationId],
    queryFn: async () => {
      const res = await api.get(`/applications/${applicationId}/status-history`)
      return (res.data?.data ?? res.data) ?? []
    },
    enabled: !!applicationId,
  })
}

export const ROUND_TYPES = [
  { value: 'PHONE_SCREEN', label: 'Phone Screen' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'SYSTEM_DESIGN', label: 'System Design' },
  { value: 'BEHAVIORAL', label: 'Behavioral' },
  { value: 'FINAL', label: 'Final Round' },
  { value: 'OTHER', label: 'Other' },
]

export const OUTCOMES = [
  { value: 'POSITIVE', label: 'Positive' },
  { value: 'NEUTRAL', label: 'Neutral' },
  { value: 'NEGATIVE', label: 'Negative' },
]
