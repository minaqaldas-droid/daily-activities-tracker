import { type Activity } from '../supabaseClient'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function normalizeFilename(filename: string) {
  const sanitized = filename.trim().replace(/[\\/:*?"<>|]+/g, '_')
  const fallback = `Activities_${new Date().toISOString().split('T')[0]}`
  const normalized = sanitized || fallback

  return normalized.toLowerCase().endsWith('.xlsx') ? normalized : `${normalized}.xlsx`
}

function buildExportRows(activities: Activity[]) {
  return activities.map((activity) => ({
    Date: formatExcelDate(activity.date),
    Performer: activity.performer,
    'Activity Type': activity.activityType || '',
    System: activity.system,
    Tag: activity.tag,
    Problem: activity.problem,
    Action: activity.action,
    Comments: activity.comments || '',
  }))
}

function formatExcelDate(value: string) {
  const trimmedValue = value.trim()
  const match = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) {
    return trimmedValue
  }

  const [, year, month, day] = match
  const monthIndex = Number(month) - 1

  if (monthIndex < 0 || monthIndex >= MONTH_NAMES.length) {
    return trimmedValue
  }

  return `${Number(day)}-${MONTH_NAMES[monthIndex]}-${year}`
}

export async function exportActivitiesToExcel(
  activities: Activity[],
  options: {
    filename?: string
    sheetName?: string
  } = {}
) {
  if (activities.length === 0) {
    throw new Error('No activities found to export.')
  }

  const XLSX = await import('xlsx')
  const worksheet = XLSX.utils.json_to_sheet(buildExportRows(activities))
  const workbook = XLSX.utils.book_new()

  worksheet['!cols'] = [
    { wch: 12 },
    { wch: 18 },
    { wch: 24 },
    { wch: 12 },
    { wch: 16 },
    { wch: 30 },
    { wch: 30 },
    { wch: 25 },
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Activities')

  const filename = normalizeFilename(options.filename || `Activities_${new Date().toISOString().split('T')[0]}`)
  XLSX.writeFile(workbook, filename)

  return filename
}
