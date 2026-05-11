import { Linking } from 'react-native'

interface CalendarEvent {
  title: string
  date: string
  description?: string
  location?: string
}

export function openInGoogleCalendar(event: CalendarEvent): void {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.date)}/${formatDate(event.date)}`,
  })

  if (event.description) {
    params.set('details', event.description)
  }
  if (event.location) {
    params.set('location', event.location)
  }

  const url = `https://calendar.google.com/calendar/render?${params.toString()}`
  Linking.openURL(url).catch((err) =>
    console.error('Failed to open calendar link:', err)
  )
}
