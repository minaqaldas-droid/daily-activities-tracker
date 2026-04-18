import React, { useEffect, useState } from 'react'
import { type User, updateUserDetails } from '../supabaseClient'

interface AccountSettingsProps {
  user: User
  onUpdateSuccess: (user: User) => void
  onClose: () => void
  isLoading?: boolean
}

function isValidImageSource(value: string) {
  return /^https?:\/\/.+/i.test(value) || /^data:image\/[a-z0-9.+-]+;base64,/i.test(value)
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  user,
  onUpdateSuccess,
  onClose,
  isLoading = false,
}) => {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatar_url || null)
  const [avatarInputType, setAvatarInputType] = useState<'url' | 'file'>('url')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
    setAvatarUrl(user.avatar_url || '')
    setPreviewUrl(user.avatar_url || null)
    setAvatarInputType('url')
    setUploadProgress(0)
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }, [user])

  const handleAvatarUrlChange = (value: string) => {
    const trimmedValue = value.trim()

    setAvatarUrl(value)
    setUploadProgress(0)

    if (!trimmedValue) {
      setPreviewUrl(null)
      setError('')
      return
    }

    if (!isValidImageSource(trimmedValue)) {
      setPreviewUrl(null)
      setError('Please enter a valid image URL starting with http:// or https://.')
      return
    }

    setPreviewUrl(trimmedValue)
    setError('')
  }

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (PNG, JPG, SVG, or WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.')
      return
    }

    setError('')
    setUploadProgress(0)

    const reader = new FileReader()
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100))
      }
    }
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setAvatarUrl(dataUrl)
      setPreviewUrl(dataUrl)
      setUploadProgress(100)
      window.setTimeout(() => setUploadProgress(0), 1000)
    }
    reader.onerror = () => {
      setError('Failed to read file.')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarUrl('')
    setPreviewUrl(null)
    setUploadProgress(0)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }

    if (avatarUrl.trim() && !isValidImageSource(avatarUrl.trim())) {
      setError('Please provide a valid profile picture URL or upload an image file.')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    try {
      setIsSubmitting(true)

      const result = await updateUserDetails(user.id, {
        name,
        email,
        password: newPassword || undefined,
        avatarUrl,
      })

      onUpdateSuccess(result.user)

      setSuccess(
        result.emailChangePending
          ? `Profile updated. Confirm the email change sent to ${result.pendingEmail}.`
          : 'Account details updated successfully.'
      )
      setNewPassword('')
      setConfirmPassword('')

      setTimeout(onClose, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const avatarInitial = name.trim().charAt(0).toUpperCase() || user.name.trim().charAt(0).toUpperCase() || 'U'

  return (
    <div className="modal-overlay">
      <div className="settings-modal account-settings-modal">
        <div className="modal-header">
          <h2>Account Settings</h2>
          <button type="button" className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Profile Picture</label>
            <div className="avatar-editor">
              <div className="avatar-preview-card">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="avatar-preview-image"
                    onError={() => {
                      setError('Could not load the selected profile picture.')
                      setPreviewUrl(null)
                    }}
                  />
                ) : (
                  <div className="avatar-preview-placeholder">{avatarInitial}</div>
                )}
              </div>

              <div className="avatar-editor-fields">
                <div className="logo-input-tabs">
                  <button
                    type="button"
                    className={`tab-option ${avatarInputType === 'url' ? 'active' : ''}`}
                    onClick={() => setAvatarInputType('url')}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    className={`tab-option ${avatarInputType === 'file' ? 'active' : ''}`}
                    onClick={() => setAvatarInputType('file')}
                  >
                    Upload File
                  </button>
                </div>

                {avatarInputType === 'url' ? (
                  <>
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => handleAvatarUrlChange(e.target.value)}
                      placeholder="https://example.com/profile-picture.png"
                      disabled={isSubmitting || isLoading}
                    />
                    <span className="form-hint">Use a public image URL, or leave blank to remove your picture.</span>
                  </>
                ) : (
                  <>
                    <label className="file-input-label">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                        onChange={handleAvatarFileSelect}
                        disabled={isSubmitting || isLoading}
                      />
                      <span className="file-input-button">
                        {uploadProgress > 0 && uploadProgress < 100
                          ? `Uploading... ${uploadProgress}%`
                          : 'Choose Profile Picture'}
                      </span>
                    </label>
                    <span className="form-hint">PNG, JPG, SVG, or WebP. Max 5MB.</span>
                  </>
                )}

                <div className="avatar-editor-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleRemoveAvatar}
                    disabled={isSubmitting || isLoading || (!avatarUrl && !previewUrl)}
                  >
                    Remove Picture
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting || isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || isLoading}
              required
            />
            <small className="form-hint">Changing the email may require confirmation through Supabase Auth.</small>
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep your current password"
              disabled={isSubmitting || isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={isSubmitting || isLoading}
            />
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || isLoading}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
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
