import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import { Activity } from '../supabaseClient'

interface ExcelExportProps {
  activities: Activity[]
  isLoading?: boolean
}

export const ExcelExport: React.FC<ExcelExportProps> = ({
  activities,
  isLoading = false,
}) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [exportFormat, setExportFormat] = useState<'current' | 'dateRange'>('dateRange')

  const handleExport = () => {
    let dataToExport: Activity[] = []

    if (exportFormat === 'current') {
      dataToExport = activities
    } else {
      dataToExport = activities.filter((activity) => {
        const actDate = new Date(activity.date)
        const start = new Date(dateRange.startDate)
        const end = new Date(dateRange.endDate)
        return actDate >= start && actDate <= end
      })
    }

    if (dataToExport.length === 0) {
      alert('No activities found for the selected date range')
      return
    }

    // Prepare data for export
    const exportData = dataToExport.map((activity) => ({
      Date: activity.date,
      Performer: activity.performer,
      System: activity.system,
      Instrument: activity.instrument,
      Problem: activity.problem,
      Action: activity.action,
      Comments: activity.comments || '',
      'Edited By': activity.editedBy || '',
      'Created At': activity.created_at || '',
    }))

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Activities')

    // Set column widths
    const maxWidth = 20
    const wscols = [
      { wch: 12 }, // Date
      { wch: 15 }, // Performer
      { wch: 12 }, // System
      { wch: 15 }, // Instrument
      { wch: maxWidth }, // Problem
      { wch: maxWidth }, // Action
      { wch: maxWidth }, // Comments
      { wch: 15 }, // Edited By
      { wch: 18 }, // Created At
    ]
    worksheet['!cols'] = wscols

    // Generate filename
    const filename = `Activities_${exportFormat === 'dateRange' ? `${dateRange.startDate}_to_${dateRange.endDate}` : new Date().toISOString().split('T')[0]}.xlsx`

    // Write file
    XLSX.writeFile(workbook, filename)
  }

  return (
    <div className="excel-export-container">
      <div className="excel-export-section">
        <h3>📥 Export Activities to Excel</h3>
        <p className="excel-hint">Download activities log as an Excel file for backup or further analysis</p>

        <div className="export-options">
          <div className="export-option">
            <label>
              <input
                type="radio"
                name="export-format"
                value="current"
                checked={exportFormat === 'current'}
                onChange={() => setExportFormat('current')}
              />
              Export All Activities ({activities.length} total)
            </label>
          </div>

          <div className="export-option">
            <label>
              <input
                type="radio"
                name="export-format"
                value="dateRange"
                checked={exportFormat === 'dateRange'}
                onChange={() => setExportFormat('dateRange')}
              />
              Export Activities in Date Range
            </label>

            {exportFormat === 'dateRange' && (
              <div className="date-range-inputs">
                <div className="date-input-group">
                  <label htmlFor="start-date">Start Date:</label>
                  <input
                    id="start-date"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="date-input-group">
                  <label htmlFor="end-date">End Date:</label>
                  <input
                    id="end-date"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <p className="date-range-info">
                  {
                    activities.filter((activity) => {
                      const actDate = new Date(activity.date)
                      const start = new Date(dateRange.startDate)
                      const end = new Date(dateRange.endDate)
                      return actDate >= start && actDate <= end
                    }).length
                  }{' '}
                  activities in range
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleExport}
          disabled={isLoading || activities.length === 0}
        >
          {isLoading ? 'Preparing...' : '⬇️ Download Excel File'}
        </button>
      </div>
    </div>
  )
}
