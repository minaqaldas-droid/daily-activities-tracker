import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Activity, createActivity } from '../supabaseClient'

interface ExcelImportProps {
  onImportSuccess: (count: number) => void
  onImportError: (error: string) => void
  isLoading?: boolean
  currentUserName?: string
}

export const ExcelImport: React.FC<ExcelImportProps> = ({
  onImportSuccess,
  onImportError,
  isLoading = false,
  currentUserName = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().match(/\.(xlsx?|xls)$/)) {
      onImportError('Please select a valid Excel file (.xlsx or .xls)')
      return
    }

    try {
      setIsImporting(true)
      setImportProgress(0)

      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const data = event.target?.result
          if (!data) throw new Error('Failed to read file')

          const workbook = XLSX.read(data, { type: 'array' })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          if (jsonData.length === 0) {
            onImportError('Excel file is empty or has no data rows')
            setIsImporting(false)
            return
          }

          // Validate and transform the data
          const activities: Activity[] = []
          let errorRows: string[] = []

          jsonData.forEach((row: any, index: number) => {
            try {
              const activity: Activity = {
                date: row.date || row.Date || new Date().toISOString().split('T')[0],
                performer: row.performer || row.Performer || currentUserName || 'Unknown',
                system: row.system || row.System || '',
                instrument: row.instrument || row.Instrument || row['Instrument/Tag'] || '',
                problem: row.problem || row.Problem || row['Issue'] || '',
                action: row.action || row.Action || row['Resolution'] || '',
                comments: row.comments || row.Comments || row['Remarks'] || '',
              }

              // Validate required fields
              if (!activity.date || !activity.performer || !activity.system || !activity.instrument || !activity.problem || !activity.action) {
                errorRows.push(`Row ${index + 2}: Missing required fields`)
                return
              }

              activities.push(activity)
            } catch (err) {
              errorRows.push(`Row ${index + 2}: ${err instanceof Error ? err.message : 'Unknown error'}`)
            }
          })

          if (activities.length === 0) {
            onImportError(
              `No valid activities found. ${errorRows.length > 0 ? `Errors: ${errorRows.slice(0, 3).join('; ')}...` : ''}`
            )
            setIsImporting(false)
            return
          }

          // Import activities to database
          let successCount = 0
          for (let i = 0; i < activities.length; i++) {
            try {
              await createActivity(activities[i])
              successCount++
              setImportProgress(Math.round(((i + 1) / activities.length) * 100))
            } catch (err) {
              console.error(`Failed to create activity ${i + 1}:`, err)
            }
          }

          onImportSuccess(successCount)
          setImportProgress(0)
          setIsImporting(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }

          if (errorRows.length > 0) {
            console.warn('Import completed with warnings:', errorRows.slice(0, 5).join('; '))
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to process Excel file'
          onImportError(message)
          setIsImporting(false)
        }
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to read file'
      onImportError(message)
      setIsImporting(false)
    }
  }

  return (
    <div className="excel-import-container">
      <div className="excel-import-section">
        <h3>📤 Import Activities from Excel</h3>
        <p className="excel-hint">Upload an Excel file to bulk import activities. File should have columns: Date, Performer, System, Instrument, Problem, Action, Comments</p>

        <div className="excel-input-group">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            disabled={isImporting || isLoading}
            className="file-input"
            id="excel-file-input"
          />
          <label htmlFor="excel-file-input" className="btn btn-primary">
            {isImporting ? 'Importing...' : 'Choose Excel File'}
          </label>
        </div>

        {isImporting && (
          <div className="import-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">{importProgress}% - Importing activities...</p>
          </div>
        )}

        <div className="excel-template-hint">
          <p><strong>Expected Excel Format:</strong></p>
          <table className="template-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Performer</th>
                <th>System</th>
                <th>Instrument</th>
                <th>Problem</th>
                <th>Action</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-04-15</td>
                <td>John Doe</td>
                <td>DCS</td>
                <td>Sensor A</td>
                <td>Reading error</td>
                <td>Recalibrated sensor</td>
                <td>Normal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
