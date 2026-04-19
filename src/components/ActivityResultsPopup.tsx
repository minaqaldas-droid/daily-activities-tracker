import React, { useState } from 'react'
import { type Activity } from '../supabaseClient'
import { exportActivitiesToExcel } from '../utils/excel'
import { ActivityList } from './ActivityList'

interface ActivityResultsPopupProps {
  isOpen: boolean
  title: string
  description?: string
  activities: Activity[]
  exportFilename?: string
  onClose: () => void
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => Promise<void>
  isLoading?: boolean
  canDelete?: boolean
  onDeleteDenied?: () => void
  onExportSuccess?: (message: string) => void
  onExportError?: (message: string) => void
}

export const ActivityResultsPopup: React.FC<ActivityResultsPopupProps> = ({
  isOpen,
  title,
  description,
  activities,
  exportFilename,
  onClose,
  onEdit,
  onDelete,
  isLoading = false,
  canDelete = true,
  onDeleteDenied,
  onExportSuccess,
  onExportError,
}) => {
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) {
    return null
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const filename = await exportActivitiesToExcel(activities, {
        filename: exportFilename || `${title.replace(/\s+/g, '_')}.xlsx`,
      })
      onExportSuccess?.(`Exported ${activities.length} activit${activities.length === 1 ? 'y' : 'ies'} to ${filename}.`)
    } catch (error) {
      onExportError?.(error instanceof Error ? error.message : 'Failed to export activities.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="modal-overlay results-popup-overlay" onClick={onClose}>
      <div
        className="results-popup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-results-popup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="results-popup-header">
          <div className="results-popup-header-copy">
            <p className="results-popup-kicker">Activity Results</p>
            <h2 id="activity-results-popup-title">{title}</h2>
            {description && <p className="results-popup-description">{description}</p>}
          </div>

          <button type="button" className="modal-close results-popup-close" onClick={onClose} aria-label="Close popup">
            ×
          </button>
        </div>

        <div className="results-popup-toolbar">
          <span className="results-popup-count">
            {activities.length} activit{activities.length === 1 ? 'y' : 'ies'}
          </span>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleExport()}
            disabled={isLoading || isExporting || activities.length === 0}
          >
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>

        <div className="results-popup-body">
          <ActivityList
            activities={activities}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoading={isLoading || isExporting}
            canDelete={canDelete}
            onDeleteDenied={onDeleteDenied}
            emptyMessage="No activities found for this view."
          />
        </div>
      </div>
    </div>
  )
}
