import { applyDashboardChartDisplayCountOverrides, getDashboardChartDisplayCountStorageKey } from './dashboardChartPreferences'
import { type Settings } from '../supabaseClient'

describe('dashboard chart display count preferences', () => {
  it('builds a user-and-team-scoped storage key', () => {
    expect(getDashboardChartDisplayCountStorageKey('user-1', 'team-7')).toBe(
      'dashboard-chart-display-counts:user-1:team-7'
    )
  })

  it('overrides maxItems without mutating unrelated chart settings', () => {
    const settings: Settings = {
      webapp_name: 'Daily Activities Tracker',
      logo_url: '',
      dashboard_chart_definitions: [
        {
          key: 'activityType',
          label: 'Activities by Type',
          fieldKey: 'activityType',
          chartType: 'pie',
          maxItems: 6,
          includeEmpty: false,
        },
        {
          key: 'topTags',
          label: 'Top Tags',
          fieldKey: 'tag',
          chartType: 'bar',
          maxItems: 8,
          includeEmpty: false,
        },
      ],
    }

    const result = applyDashboardChartDisplayCountOverrides(settings, { activityType: 20 })

    expect(result.dashboard_chart_definitions?.find((chart) => chart.key === 'activityType')?.maxItems).toBe(20)
    expect(result.dashboard_chart_definitions?.find((chart) => chart.key === 'topTags')?.maxItems).toBe(8)
  })
})
