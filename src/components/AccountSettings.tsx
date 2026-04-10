import React, { useState } from 'react'
import { User, updateUserDetails } from '../supabaseClient'

interface AccountSettingsProps {
  user: User
  onUpdateSuccess: (user: User) => void
  onClose: () => void
  isLoading?: boolean
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  user,
  onUpdateSuccess,
  onClose,
  isLoading = false,
}) => {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name || !email) {
      setError('Name and email are required')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    try {
      setIsSubmitting(true)
      const passwordToUpdate = newPassword || currentPassword || user.password || ''
      await updateUserDetails(user.id || '', name, email, passwordToUpdate)
      
      const updatedUser: User = {
        ...user,
        name,
        email,
        password: passwordToUpdate,
      }
      
      onUpdateSuccess(updatedUser)
      setSuccess('Account details updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
      
      setTimeout(onClose, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="settings-modal">
        <div className="modal-header">
          <h2>Account Settings</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              required
            />
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isLoading}
            >
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
