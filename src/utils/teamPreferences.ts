const ACTIVE_TEAM_STORAGE_PREFIX = 'app-active-team'

export function getActiveTeamStorageKey(userId: string) {
  return `${ACTIVE_TEAM_STORAGE_PREFIX}:${userId}`
}

export function readPersistedActiveTeamId(userId: string) {
  if (typeof window === 'undefined' || !userId) {
    return null
  }

  const raw = window.localStorage.getItem(getActiveTeamStorageKey(userId))
  return raw?.trim() || null
}

export function writePersistedActiveTeamId(userId: string, teamId: string) {
  if (typeof window === 'undefined' || !userId || !teamId) {
    return
  }

  window.localStorage.setItem(getActiveTeamStorageKey(userId), teamId)
}
