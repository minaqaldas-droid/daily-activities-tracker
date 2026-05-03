import { matchesActivityKeyword } from './activityKeywordSearch'
import { type Activity, type Settings } from '../supabaseClient'

describe('activity keyword search', () => {
  const activity: Activity = {
    date: '2026-05-03',
    performer: 'Ahmed',
    system: 'DCS',
    shift: 'A',
    permitNumber: '',
    instrumentType: '',
    activityType: 'PM',
    tag: '920TT305',
    problem: 'Loop tuning',
    action: 'Adjusted setpoint',
    comments: 'Checked and closed',
    customFields: {
      workOrder: 'WO-7788',
      hiddenField: 'Secret value',
    },
    editedBy: 'Internal Editor',
    created_at: '2026-05-03T10:00:00.000Z',
    edited_at: '2026-05-03T11:00:00.000Z',
  }

  const settings: Settings = {
    webapp_name: 'Daily Activities Tracker',
    logo_url: '',
    activity_field_definitions: [
      {
        key: 'workOrder',
        label: 'Work Order',
        type: 'text',
        searchable: true,
      },
      {
        key: 'hiddenField',
        label: 'Hidden Field',
        type: 'text',
        searchable: true,
      },
    ],
    activity_field_config: {
      workOrder: {
        enabled: true,
        required: false,
        order: 1000,
      },
      hiddenField: {
        enabled: false,
        required: false,
        order: 1010,
      },
    },
  }

  it('matches enabled custom fields and friendly labels', () => {
    expect(matchesActivityKeyword(activity, 'WO-7788', settings)).toBe(true)
    expect(matchesActivityKeyword(activity, 'preventive maintenance', settings)).toBe(true)
  })

  it('ignores hidden metadata and disabled fields', () => {
    expect(matchesActivityKeyword(activity, 'Internal Editor', settings)).toBe(false)
    expect(matchesActivityKeyword(activity, '2026-05-03T10:00:00.000Z', settings)).toBe(false)
    expect(matchesActivityKeyword(activity, 'Secret value', settings)).toBe(false)
  })
})
