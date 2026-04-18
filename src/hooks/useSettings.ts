import { useCallback, useEffect, useState } from 'react'
import { type Settings, getSettings } from '../supabaseClient'

const DEFAULT_SETTINGS: Settings = {
  webapp_name: 'Daily Activities Tracker',
  logo_url: '',
  primary_color: '#667eea',
  performer_mode: 'manual',
}

export function useSettings(isEnabled: boolean) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

  const loadSettings = useCallback(async () => {
    const appSettings = await getSettings()
    setSettings(appSettings)
    return appSettings
  }, [])

  useEffect(() => {
    if (!isEnabled) {
      setSettings(DEFAULT_SETTINGS)
      return
    }

    void loadSettings().catch((error) => {
      console.error('Error loading settings:', error)
    })
  }, [isEnabled, loadSettings])

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--primary-color',
      settings.primary_color || DEFAULT_SETTINGS.primary_color || '#667eea'
    )
  }, [settings.primary_color])

  return {
    settings,
    setSettings,
    loadSettings,
  }
}
