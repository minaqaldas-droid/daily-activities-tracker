import React from 'react'
import { Activity } from '../supabaseClient'

interface ActivityListProps {
  activities: Activity[]
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      await onDelete(id)
    }
  }

  if (activities.length === 0) {
    return (
      <div className="empty-state">
        <p>No activities recorded yet. Start by adding your first activity!</p>
      </div>
    )
  }

  return (
    <div className="activities-grid">
      {activities.map((activity) => (
        <div key={activity.id} className="activity-card">
          <h3>📅 {activity.date}</h3>
          
          <div className="activity-detail">
            <strong>Performer:</strong> {activity.performer}
          </div>

          <div className="activity-detail">
            <strong>System:</strong>
            <span className="system-badge">{activity.system}</span>
          </div>

          <div className="activity-detail">
            <strong>Instrument/Tag:</strong> 
            <span className="instrument-tag">{activity.instrument}</span>
          </div>

          <div className="activity-detail">
            <strong>Problem:</strong>
            <p>{activity.problem}</p>
          </div>

          <div className="activity-detail">
            <strong>Action:</strong>
            <p>{activity.action}</p>
          </div>

          {activity.comments && (
            <div className="activity-detail">
              <strong>Comments:</strong>
              <p>{activity.comments}</p>
            </div>
          )}

          {activity.editedBy && (
            <div className="activity-detail edited-info">
              <strong>✏️ Edited by:</strong> {activity.editedBy}
            </div>
          )}

          <div className="activity-actions">
            <button
              className="btn btn-edit"
              onClick={() => onEdit(activity)}
              disabled={isLoading}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={() => handleDelete(activity.id!)}
              disabled={isLoading}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
