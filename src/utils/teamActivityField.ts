import { SYSTEM_OPTIONS } from '../constants/systems'

const SHIFT_OPTIONS = ['Shift A', 'Shift B', 'Shift C', 'Shift D'] as const

type TeamLike = {
  id?: string | null
  slug?: string | null
  name?: string | null
} | null | undefined

function normalizeTeamToken(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function isInstrumentationTeam(team: TeamLike) {
  const tokens = [team?.id, team?.slug, team?.name].map(normalizeTeamToken)
  return tokens.some((token) => token.includes('instrument'))
}

export function getSystemFieldLabel(team: TeamLike) {
  return isInstrumentationTeam(team) ? 'Shift' : 'System'
}

export function getSystemFieldLabelPlural(team: TeamLike) {
  return isInstrumentationTeam(team) ? 'Shifts' : 'Systems'
}

export function getSystemFieldOptions(team: TeamLike) {
  return isInstrumentationTeam(team) ? [...SHIFT_OPTIONS] : [...SYSTEM_OPTIONS]
}

