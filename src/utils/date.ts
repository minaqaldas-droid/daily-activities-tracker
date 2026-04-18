const MONTH_LOOKUP: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
}

const MONTH_ABBREVIATIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

function normalizeTwoDigitYear(year: number) {
  return year >= 70 ? 1900 + year : 2000 + year
}

function createIsoDate(year: number, month: number, day: number) {
  const candidate = new Date(Date.UTC(year, month - 1, day))

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return ''
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function parseImportedDate(value: unknown) {
  const text = normalizeText(value)
  if (!text) {
    return ''
  }

  const isoDate = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoDate) {
    return createIsoDate(Number(isoDate[1]), Number(isoDate[2]), Number(isoDate[3]))
  }

  const dayMonthNameYear = text.match(/^(\d{1,2})-([A-Za-z]{3,9})-(\d{4})$/)
  if (dayMonthNameYear) {
    const month = MONTH_LOOKUP[dayMonthNameYear[2].toLowerCase()]
    if (!month) {
      return ''
    }

    return createIsoDate(Number(dayMonthNameYear[3]), month, Number(dayMonthNameYear[1]))
  }

  // Numeric dates separated by hyphens are interpreted as M-D-Y:
  // 4-3-2026 -> 2026-04-03
  const monthDayYearHyphen = text.match(/^(\d{1,2})-(\d{1,2})-(\d{2}|\d{4})$/)
  if (monthDayYearHyphen) {
    const year =
      monthDayYearHyphen[3].length === 2
        ? normalizeTwoDigitYear(Number(monthDayYearHyphen[3]))
        : Number(monthDayYearHyphen[3])

    return createIsoDate(year, Number(monthDayYearHyphen[1]), Number(monthDayYearHyphen[2]))
  }

  // Numeric dates separated by slashes are interpreted as D/M/Y:
  // 3/4/2026 -> 2026-04-03
  const dayMonthYearSlash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/)
  if (dayMonthYearSlash) {
    const year =
      dayMonthYearSlash[3].length === 2
        ? normalizeTwoDigitYear(Number(dayMonthYearSlash[3]))
        : Number(dayMonthYearSlash[3])

    return createIsoDate(year, Number(dayMonthYearSlash[2]), Number(dayMonthYearSlash[1]))
  }

  return ''
}

export function normalizeDateForApp(value: unknown) {
  return parseImportedDate(value) || normalizeText(value)
}

export function formatDateForDisplay(value: unknown) {
  const normalizedDate = parseImportedDate(value)
  if (!normalizedDate) {
    return normalizeText(value)
  }

  const [year, month, day] = normalizedDate.split('-').map(Number)
  return `${day}-${MONTH_ABBREVIATIONS[month - 1]}-${year}`
}
