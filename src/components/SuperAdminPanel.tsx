import React, { useState, useEffect } from 'react'
import { User, Settings, getSettings, updateSettings } from '../supabaseClient'

interface SuperAdminPanelProps {
  user: User
  currentSettings: Settings
  onClose: () => void
  onSettingsUpdate: (settings: Settings) => void
  isLoading?: boolean
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  user,
  currentSettings,
  onClose,
  onSettingsUpdate,
  isLoading = false,
}) => {
  const [webappName, setWebappName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#667eea')
  const [performerMode, setPerformerMode] = useState<'manual' | 'auto'>('manual')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [logoInputType, setLogoInputType] = useState<'url' | 'file'>('url')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    // Initialize with current settings passed from parent
    if (currentSettings) {
      setWebappName(currentSettings.webapp_name || 'Daily Activities Tracker')
      setLogoUrl(currentSettings.logo_url || '')
      setPrimaryColor(currentSettings.primary_color || '#667eea')
      setPerformerMode(currentSettings.performer_mode || 'manual')
      if (currentSettings.logo_url) {
        setPreviewUrl(currentSettings.logo_url)
      }
    }
  }, [currentSettings])

  const handleLogoUrlChange = (url: string) => {
    setLogoUrl(url)
    setUploadProgress(0)
    // Validate URL format
    if (url && !url.match(/^https?:\/\/.+/)) {
      setError('Please enter a valid URL starting with http:// or https://')
      setPreviewUrl(null)
    } else {
      setError('')
      if (url) {
        setPreviewUrl(url)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (PNG, JPG, SVG, or WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError('')
    setUploadProgress(0)

    // Convert file to base64 data URL
    const reader = new FileReader()
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setLogoUrl(dataUrl)
      setPreviewUrl(dataUrl)
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 1000)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!webappName.trim()) {
      setError('Webapp name is required')
      return
    }

    if (!logoUrl.trim()) {
      setError('Please provide a logo URL or upload a logo file')
      return
    }

    try {
      setIsSubmitting(true)
      const updatedSettings = await updateSettings(
        {
          webapp_name: webappName.trim(),
          logo_url: logoUrl.trim(),
          primary_color: primaryColor,
          performer_mode: performerMode,
        },
        user.id || ''
      )

      if (updatedSettings) {
        setSuccess('Settings updated successfully!')
        onSettingsUpdate(updatedSettings)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (err) {
      setError('Failed to update settings')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="settings-modal">
        <div className="modal-header">
          <h2>🔧 Superadmin Settings</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="webapp-name">Webapp Name</label>
            <input
              id="webapp-name"
              type="text"
              value={webappName}
              onChange={(e) => setWebappName(e.target.value)}
              placeholder="Enter your webapp name"
              disabled={isSubmitting || isLoading}
            />
            <span className="form-hint">This name will appear in the header</span>
          </div>

          <div className="form-group">
            <label>Logo Upload</label>
            <div className="logo-input-tabs">
              <button
                type="button"
                className={`tab-option ${logoInputType === 'url' ? 'active' : ''}`}
                onClick={() => setLogoInputType('url')}
              >
                🔗 URL
              </button>
              <button
                type="button"
                className={`tab-option ${logoInputType === 'file' ? 'active' : ''}`}
                onClick={() => setLogoInputType('file')}
              >
                📁 Upload File
              </button>
            </div>

            {logoInputType === 'url' ? (
              <>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  disabled={isSubmitting || isLoading}
                />
                <span className="form-hint">
                  Enter a public image URL (PNG, JPG, SVG, or WebP)
                </span>
              </>
            ) : (
              <>
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleFileSelect}
                    disabled={isSubmitting || isLoading}
                  />
                  <span className="file-input-button">
                    {uploadProgress > 0 && uploadProgress < 100
                      ? `Uploading... ${uploadProgress}%`
                      : 'Choose Logo File'}
                  </span>
                </label>
                <span className="form-hint">
                  PNG, JPG, SVG, or WebP (Max 5MB)
                </span>
              </>
            )}
          </div>

          {previewUrl && (
            <div className="form-group">
              <label>Logo Preview</label>
              <div className="logo-preview">
                <img
                  src={previewUrl}
                  alt="Logo preview"
                  onError={() => {
                    setError('Could not load image')
                    setPreviewUrl(null)
                  }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="primary-color">Primary Color</label>
            <div className="color-input-group">
              <input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                disabled={isSubmitting || isLoading}
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#667eea"
                disabled={isSubmitting || isLoading}
                className="color-hex-input"
              />
            </div>
            <span className="form-hint">Used for buttons, links, and highlighting</span>
          </div>

          <div className="form-group">
            <label>Performer Name Handling</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="performer-mode"
                  value="manual"
                  checked={performerMode === 'manual'}
                  onChange={() => setPerformerMode('manual')}
                  disabled={isSubmitting || isLoading}
                />
                <span className="radio-label">
                  <strong>👤 Manual Entry</strong> - Users can enter performer name manually
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="performer-mode"
                  value="auto"
                  checked={performerMode === 'auto'}
                  onChange={() => setPerformerMode('auto')}
                  disabled={isSubmitting || isLoading}
                />
                <span className="radio-label">
                  <strong>🔐 Auto-assign</strong> - Auto-fill with logged-in username
                </span>
              </label>
            </div>
            <span className="form-hint">
              Choose whether users can manually enter their name or it's auto-filled from their account
            </span>
          </div>

          <div className="form-group">
            <label className="info-box">
              <strong>Info:</strong> Changes will apply to all users after refresh
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
