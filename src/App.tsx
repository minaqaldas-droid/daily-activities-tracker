import React, { useState, useEffect } from 'react'
import { ActivityForm } from './components/ActivityForm'
import { ActivityList } from './components/ActivityList'
import {
  Activity,
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from './supabaseClient'

function App() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Activity | undefined>(undefined)

  useEffect(() => {
    loadActivities()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadActivities = async () => {
    try {
      setIsLoading(true)
      const data = await getActivities()
      setActivities(data)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to load activities. Make sure Supabase is configured.',
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddOrUpdateActivity = async (activity: Activity) => {
    try {
      setIsLoading(true)
      if (editingId) {
        await updateActivity(editingId, activity)
        setMessage({ type: 'success', text: 'Activity updated successfully!' })
        setEditingId(null)
        setEditingData(undefined)
      } else {
        await createActivity(activity)
        setMessage({ type: 'success', text: 'Activity added successfully!' })
      }
      await loadActivities()
    } catch (error) {
      setMessage({
        type: 'error',
        text: editingId ? 'Failed to update activity' : 'Failed to add activity',
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingId(activity.id!)
    setEditingData(activity)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteActivity = async (id: string) => {
    try {
      setIsLoading(true)
      await deleteActivity(id)
      setMessage({ type: 'success', text: 'Activity deleted successfully!' })
      await loadActivities()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete activity' })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>📋 Daily Activities Tracker</h1>
        <p>Track your daily work activities with problems, actions, and comments</p>
      </div>

      {message && (
        <div className={`${message.type === 'success' ? 'success-message' : 'error-message'}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        <h2>
          {editingId ? '✏️ Edit Activity' : '➕ Add New Activity'}
        </h2>
        <ActivityForm
          onSubmit={handleAddOrUpdateActivity}
          initialData={editingData}
          isLoading={isLoading}
        />
        {editingId && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setEditingId(null)
              setEditingData(undefined)
            }}
            style={{ marginTop: '10px' }}
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div className="list-section">
        <h2>📝 All Activities ({activities.length})</h2>
        <ActivityList
          activities={activities}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default App
