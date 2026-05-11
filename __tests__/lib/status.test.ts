import { APPLICATION_STATUSES, APPLICATION_STATUS_CONFIG, statusColors, STATUS_DASHBOARD_COLORS } from '@/lib/status'

describe('status config', () => {
  it('has all statuses in config map', () => {
    for (const status of APPLICATION_STATUSES) {
      expect(APPLICATION_STATUS_CONFIG[status]).toBeDefined()
      expect(APPLICATION_STATUS_CONFIG[status].label).toBeDefined()
      expect(APPLICATION_STATUS_CONFIG[status].variant).toBeDefined()
    }
  })

  it('has color config for each status', () => {
    for (const status of APPLICATION_STATUSES) {
      expect(statusColors[status]).toBeDefined()
      expect(statusColors[status].dot).toBeDefined()
      expect(statusColors[status].border).toBeDefined()
      expect(statusColors[status].bg).toBeDefined()
      expect(statusColors[status].text).toBeDefined()
    }
  })

  it('has dashboard color for each status', () => {
    for (const status of APPLICATION_STATUSES) {
      expect(STATUS_DASHBOARD_COLORS[status]).toBeDefined()
    }
  })

  it('has exactly the expected statuses', () => {
    expect(APPLICATION_STATUSES).toEqual([
      'SAVED',
      'APPLIED',
      'PHONE_SCREEN',
      'INTERVIEW',
      'OFFER',
      'CLOSED',
    ])
  })
})
