import React, { useState, useEffect } from 'react'
import { Activity } from '../supabaseClient'

interface ActivityFormProps {
  onSubmit: (activity: Activity) => Promise<void>
  initialData?: Activity
  isLoading?: boolean
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Activity>({
    date: new Date().toISOString().split('T')[0],
    performer: '',
    problem: '',
    action: '',
    comments: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    if (!initialData) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        performer: '',
        problem: '',
        action: '',
        comments: '',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="date">Date *</label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="performer">Performer *</label>
        <input
          type="text"
          id="performer"
          name="performer"
          value={formData.performer}
          onChange={handleChange}
          placeholder="Enter performer name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="problem">Problem *</label>
        <textarea
          id="problem"
          name="problem"
          value={formData.problem}
          onChange={handleChange}
          placeholder="Describe the problem encountered"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="action">Action Taken *</label>
        <textarea
          id="action"
          name="action"
          value={formData.action}
          onChange={handleChange}
          placeholder="Describe the action taken"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="comments">Comments</label>
        <textarea
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          placeholder="Any additional comments (optional)"
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Activity' : 'Add Activity'}
        </button>
        {initialData && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setFormData({
                date: new Date().toISOString().split('T')[0],
                performer: '',
                problem: '',
                action: '',
                comments: '',
              })
            }}
          >
            Clear
          </button>
        )}
      </div>
    </form>
  )
}
