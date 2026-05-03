import { type Settings } from '../supabaseClient'
import { getDashboardChartDefinitions, normalizeStoredDashboardChartDefinitions } from './dashboardCharts'

const DASHBOARD_CHART_DISPLAY_COUNT_STORAGE_PREFIX = 'dashboard-chart-display-counts'

export type DashboardChartDisplayCountOverrides = Record<string, number>

export function getDashboardChartDisplayCountStorageKey(userId: string, teamId: string) {
  return `${DASHBOARD_CHART_DISPLAY_COUNT_STORAGE_PREFIX}:${userId}:${teamId || '__no-team__'}`
}

export function readDashboardChartDisplayCountOverrides(userId: string, teamId: string) {
  if (typeof window === 'undefined' || !userId) {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(getDashboardChartDisplayCountStorageKey(userId, teamId))
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>
    return Object.entries(parsed).reduce<DashboardChartDisplayCountOverrides>((accumulator, [chartKey, value]) => {
      const normalizedValue = Number(value)
      if (Number.isFinite(normalizedValue) && normalizedValue > 0) {
        accumulator[chartKey] = normalizedValue
      }
      return accumulator
    }, {})
  } catch (error) {
    console.warn('Failed to restore dashboard chart display counts:', error)
    return {}
  }
}

export function writeDashboardChartDisplayCountOverrides(
  userId: string,
  teamId: string,
  overrides: DashboardChartDisplayCountOverrides
) {
  if (typeof window === 'undefined' || !userId) {
    return
  }

  window.localStorage.setItem(getDashboardChartDisplayCountStorageKey(userId, teamId), JSON.stringify(overrides))
}

export function applyDashboardChartDisplayCountOverrides(
  settings: Settings,
  overrides: DashboardChartDisplayCountOverrides
): Settings {
  if (Object.keys(overrides).length === 0) {
    return settings
  }

  const normalizedDefinitions = normalizeStoredDashboardChartDefinitions(settings.dashboard_chart_definitions, settings)
  const definitionMap = new Map(normalizedDefinitions.map((definition) => [definition.key, definition]))

  getDashboardChartDefinitions(settings).forEach((chart) => {
    if (!definitionMap.has(chart.key)) {
      definitionMap.set(chart.key, {
        key: chart.key,
        label: chart.label,
        fieldKey: chart.fieldKey,
        chartType: chart.chartType,
        maxItems: chart.maxItems,
        includeEmpty: chart.includeEmpty,
        archived: false,
      })
    }
  })

  Object.entries(overrides).forEach(([chartKey, maxItems]) => {
    const existingDefinition = definitionMap.get(chartKey)
    if (!existingDefinition) {
      return
    }

    definitionMap.set(chartKey, {
      ...existingDefinition,
      maxItems,
    })
  })

  return {
    ...settings,
    dashboard_chart_definitions: Array.from(definitionMap.values()),
  }
}
