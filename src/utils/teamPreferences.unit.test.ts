import { getActiveTeamStorageKey, readPersistedActiveTeamId, writePersistedActiveTeamId } from './teamPreferences'
import { afterEach, vi } from 'vitest'

function createLocalStorageStub() {
  const store = new Map<string, string>()

  return {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  }
}

describe('team preferences', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds a user-scoped active team storage key', () => {
    expect(getActiveTeamStorageKey('user-1')).toBe('app-active-team:user-1')
  })

  it('persists the active team id for the current browser user', () => {
    vi.stubGlobal('window', {
      localStorage: createLocalStorageStub(),
    })

    writePersistedActiveTeamId('user-1', 'team-2')

    expect(readPersistedActiveTeamId('user-1')).toBe('team-2')
    expect(readPersistedActiveTeamId('user-2')).toBeNull()
  })
})
