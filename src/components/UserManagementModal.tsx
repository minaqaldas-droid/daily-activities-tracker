import React, { useEffect, useMemo, useState } from 'react'
import {
  ADMIN_PERMISSIONS,
  DEFAULT_USER_PERMISSIONS,
  type AdminManagedUser,
  type FeatureKey,
  createManagedUser,
  deleteManagedUser,
  getManagedUsers,
  normalizePermissions,
  updateManagedUser,
} from '../supabaseClient'

interface UserManagementModalProps {
  onClose: () => void
}

const FEATURE_LABELS: Array<{ key: FeatureKey; label: string }> = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'add', label: 'Add Activity' },
  { key: 'edit', label: 'Edit Activity' },
  { key: 'search', label: 'Search' },
  { key: 'import', label: 'Import' },
  { key: 'export', label: 'Export' },
  { key: 'edit_action', label: 'Edit' },
  { key: 'delete_action', label: 'Delete' },
]

export const UserManagementModal: React.FC<UserManagementModalProps> = ({ onClose }) => {
  const [users, setUsers] = useState<AdminManagedUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [newUserId, setNewUserId] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user')

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await getManagedUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return users
    }

    const keyword = search.toLowerCase()
    return users.filter((item) =>
      [item.id, item.email, item.name, item.role].join(' ').toLowerCase().includes(keyword)
    )
  }, [search, users])

  const handleCreate = async () => {
    setError('')
    setSuccess('')

    if (!newUserId.trim() || !newUserEmail.trim() || !newUserName.trim()) {
      setError('ID, Email, and Name are required.')
      return
    }

    try {
      setIsMutating(true)
      const permissions = newUserRole === 'admin' ? ADMIN_PERMISSIONS : DEFAULT_USER_PERMISSIONS
      const created = await createManagedUser({
        id: newUserId.trim(),
        email: newUserEmail.trim(),
        name: newUserName.trim(),
        role: newUserRole,
        permissions,
      })
      setUsers((previous) => [...previous.filter((item) => item.id !== created.id), created])
      setSuccess('User profile inserted/updated in database.')
      setNewUserId('')
      setNewUserEmail('')
      setNewUserName('')
      setNewUserRole('user')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user.')
    } finally {
      setIsMutating(false)
    }
  }

  const handleRoleChange = async (managedUser: AdminManagedUser, role: 'user' | 'admin') => {
    try {
      setIsMutating(true)
      const permissions = normalizePermissions(managedUser.permissions, role)
      const updated = await updateManagedUser(managedUser.id, { role, permissions })
      setUsers((previous) => previous.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role.')
    } finally {
      setIsMutating(false)
    }
  }

  const handlePermissionToggle = async (managedUser: AdminManagedUser, key: FeatureKey, enabled: boolean) => {
    try {
      setIsMutating(true)
      const nextPermissions = {
        ...managedUser.permissions,
        [key]: enabled,
      }
      const updated = await updateManagedUser(managedUser.id, {
        role: managedUser.role,
        permissions: nextPermissions,
      })
      setUsers((previous) => previous.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permissions.')
    } finally {
      setIsMutating(false)
    }
  }

  const handleDelete = async (managedUser: AdminManagedUser) => {
    if (!confirm(`Delete user profile "${managedUser.name}"?`)) {
      return
    }

    try {
      setIsMutating(true)
      await deleteManagedUser(managedUser.id)
      setUsers((previous) => previous.filter((item) => item.id !== managedUser.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user.')
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="settings-modal user-management-modal">
        <div className="modal-header">
          <h2>User Management</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label>Create New User (DB Profile)</label>
          <div className="form-row form-row-two-up">
            <input
              type="text"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="ID (Auth User UUID)"
              disabled={isMutating}
            />
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Email"
              disabled={isMutating}
            />
          </div>
          <div className="form-row form-row-two-up">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Name"
              disabled={isMutating}
            />
            <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-row">
            <button type="button" className="btn btn-primary" onClick={() => void handleCreate()} disabled={isMutating}>
              Create User
            </button>
          </div>
        </div>

        <div className="form-group">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            disabled={isLoading}
          />
        </div>

        <div className="table-container">
          <table className="activities-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((managedUser) => (
                <tr key={managedUser.id}>
                  <td data-label="ID">
                    <code>{managedUser.id}</code>
                  </td>
                  <td data-label="Email">{managedUser.email}</td>
                  <td data-label="Name">{managedUser.name}</td>
                  <td data-label="Role">
                    <select
                      value={managedUser.role}
                      onChange={(e) => void handleRoleChange(managedUser, e.target.value as 'user' | 'admin')}
                      disabled={isMutating}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td data-label="Delete">
                    <button type="button" className="btn btn-danger" onClick={() => void handleDelete(managedUser)} disabled={isMutating}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="form-group">
          <label>Role-based Access Control</label>
          {filteredUsers.map((managedUser) => (
            <div key={`permissions-${managedUser.id}`} className="rbac-row">
              <div className="rbac-user-meta">
                <strong>{managedUser.name}</strong>
                <span>{managedUser.email}</span>
              </div>
              <div className="rbac-checkbox-grid">
                {FEATURE_LABELS.map((feature) => (
                  <label key={`${managedUser.id}-${feature.key}`} className="rbac-permission-item">
                    <span>{feature.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(managedUser.permissions[feature.key])}
                      onChange={(event) =>
                        void handlePermissionToggle(managedUser, feature.key, event.target.checked)
                      }
                      disabled={isMutating}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
          <small className="form-hint">
            Default user access: Dashboard, Search, Export.
          </small>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={() => void loadUsers()} disabled={isMutating}>
            Refresh
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
