import { getActivityTypeLabel } from '../constants/activityTypes'
import { type Activity, type Settings } from '../supabaseClient'
import { getActivityFieldValue, getEnabledActivityFields } from './activityFields'
import { formatDateForDisplay } from './date'

export function getActivityKeywordSearchValues(activity: Activity, settings?: Settings | null) {
  const searchableFieldValues = getEnabledActivityFields(settings)
    .filter((field) => field.searchable !== false)
    .flatMap((field) => {
      const rawValue = getActivityFieldValue(activity, field.key)

      if (field.key === 'date') {
        return [activity.date, formatDateForDisplay(activity.date)]
      }

      if (field.key === 'activityType') {
        return [rawValue, getActivityTypeLabel(activity.activityType)]
      }

      return [rawValue]
    })

  return searchableFieldValues.filter((value) => String(value || '').trim())
}

export function matchesActivityKeyword(activity: Activity, keyword: string, settings?: Settings | null) {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) {
    return true
  }

  return getActivityKeywordSearchValues(activity, settings).some((value) =>
    String(value || '').toLowerCase().includes(normalizedKeyword)
  )
}
