export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'PHONE_SCREEN' | 'INTERVIEW' | 'OFFER' | 'CLOSED'

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'PHONE_SCREEN',
  'INTERVIEW',
  'OFFER',
  'CLOSED',
]

export interface StatusConfig {
  label: string
  variant: 'saved' | 'applied' | 'phone_screen' | 'interview' | 'offer' | 'closed' | 'default' | 'secondary' | 'tertiary' | 'destructive'
}

export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  SAVED: { label: 'Saved', variant: 'saved' },
  APPLIED: { label: 'Applied', variant: 'applied' },
  PHONE_SCREEN: { label: 'Phone Screen', variant: 'phone_screen' },
  INTERVIEW: { label: 'Interview', variant: 'interview' },
  OFFER: { label: 'Offer', variant: 'offer' },
  CLOSED: { label: 'Closed', variant: 'closed' },
}

export const statusColors: Record<ApplicationStatus, { dot: string; border: string; bg: string; text: string }> = {
  SAVED: {
    dot: '#4f46e5',
    border: '#4f46e5',
    bg: '#e0e7ff',
    text: '#3730a3',
  },
  APPLIED: {
    dot: '#3b82f6',
    border: '#3b82f6',
    bg: '#dbeafe',
    text: '#1e40af',
  },
  PHONE_SCREEN: {
    dot: '#8b5cf6',
    border: '#8b5cf6',
    bg: '#f3e8ff',
    text: '#6b21a8',
  },
  INTERVIEW: {
    dot: '#f59e0b',
    border: '#f59e0b',
    bg: '#fef3c7',
    text: '#92400e',
  },
  OFFER: {
    dot: '#10b981',
    border: '#10b981',
    bg: '#dcfce7',
    text: '#166534',
  },
  CLOSED: {
    dot: '#64748b',
    border: '#64748b',
    bg: '#f1f5f9',
    text: '#475569',
  },
}

export const STATUS_DASHBOARD_COLORS: Record<ApplicationStatus, string> = {
  SAVED: '#4f46e5',
  APPLIED: '#3b82f6',
  PHONE_SCREEN: '#8b5cf6',
  INTERVIEW: '#f59e0b',
  OFFER: '#10b981',
  CLOSED: '#64748b',
}
