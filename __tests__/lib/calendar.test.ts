import { openInGoogleCalendar } from '@/lib/calendar'
import { Linking } from 'react-native'

describe('openInGoogleCalendar', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.spyOn(Linking, 'openURL').mockReset().mockResolvedValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('calls Linking.openURL with correct URL', () => {
    openInGoogleCalendar({
      title: 'Interview at Acme',
      date: '2026-05-15T10:00:00Z',
    })

    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('https://calendar.google.com/calendar/render?')
    )
    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('action=TEMPLATE')
    )
    expect(Linking.openURL).toHaveBeenCalledWith(
      expect.stringContaining('text=Interview')
    )
  })

  it('includes description and location when provided', () => {
    openInGoogleCalendar({
      title: 'Tech Screen',
      date: '2026-06-01T14:00:00Z',
      description: 'Technical interview with hiring manager',
      location: 'Remote',
    })

    expect(Linking.openURL).toHaveBeenCalledTimes(1)
    const url = (Linking.openURL as jest.Mock).mock.calls[0][0] as string
    expect(url).toContain('details=Technical')
    expect(url).toContain('location=Remote')
  })

  it('handles linking error gracefully', () => {
    jest.restoreAllMocks()
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('fail'))

    expect(() => {
      openInGoogleCalendar({ title: 'Test', date: '2026-07-01T10:00:00Z' })
    }).not.toThrow()
  })
})
