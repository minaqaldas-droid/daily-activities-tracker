import React, { useRef, useState } from 'react'
import { type Activity, createActivities, createActivity } from '../supabaseClient'

interface ExcelImportProps {
  onImportSuccess: (count: number) => void
  onImportError: (error: string) => void
  isLoading?: boolean
  currentUserName?: string
}

const IMPORT_CHUNK_SIZE = 100

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

function normalizeDate(value: unknown) {
  if (!value) {
    return formatDate(new Date())
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDate(value)
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30))
    excelEpoch.setUTCDate(excelEpoch.getUTCDate() + Math.floor(value))
    return excelEpoch.toISOString().split('T')[0]
  }

  const text = normalizeText(value)
  if (!text) {
    return formatDate(new Date())
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text
  }

  const parsedDate = new Date(text)
  if (!Number.isNaN(parsedDate.getTime())) {
    return formatDate(parsedDate)
  }

  return formatDate(new Date())
}

function getChunk<T>(items: T[], size: number) {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
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
      onImportError('Please select a valid Excel file (.xlsx or .xls).')
      return
    }

    try {
      setIsImporting(true)
      setImportProgress(0)

      const workbookData = await file.arrayBuffer()
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(workbookData, { type: 'array', cellDates: true })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: '',
        raw: false,
      })

      if (rows.length === 0) {
        onImportError('Excel file is empty or has no data rows.')
        return
      }

      const activities: Activity[] = []
      const errorRows: string[] = []

      rows.forEach((row, index) => {
        const activity: Activity = {
          date: normalizeDate(row.date ?? row.Date),
          performer:
            normalizeText(row.performer ?? row.Performer) || currentUserName || 'Unknown',
          system: normalizeText(row.system ?? row.System),
          instrument: normalizeText(
            row.instrument ?? row.Instrument ?? row['Instrument/Tag']
          ),
          problem: normalizeText(row.problem ?? row.Problem ?? row.Issue),
          action: normalizeText(row.action ?? row.Action ?? row.Resolution),
          comments: normalizeText(row.comments ?? row.Comments ?? row.Remarks),
        }

        if (
          !activity.date ||
          !activity.performer ||
          !activity.system ||
          !activity.instrument ||
          !activity.problem ||
          !activity.action
        ) {
          errorRows.push(`Row ${index + 2}: Missing required fields.`)
          return
        }

        activities.push(activity)
      })

      if (activities.length === 0) {
        onImportError(
          `No valid activities found. ${
            errorRows.length > 0 ? errorRows.slice(0, 3).join(' ') : ''
          }`.trim()
        )
        return
      }

      let processedCount = 0
      let successCount = 0

      for (const chunk of getChunk(activities, IMPORT_CHUNK_SIZE)) {
        try {
          const insertedRows = await createActivities(chunk)
          successCount += insertedRows.length
          processedCount += chunk.length
          setImportProgress(Math.round((processedCount / activities.length) * 100))
          continue
        } catch (bulkError) {
          console.warn('Bulk import chunk failed, retrying rows individually:', bulkError)
        }

        for (const activity of chunk) {
          try {
            await createActivity(activity)
            successCount++
          } catch (rowError) {
            errorRows.push(
              `${activity.date} / ${activity.instrument || 'Unknown'}: ${
                rowError instanceof Error ? rowError.message : 'Unknown error'
              }`
            )
          } finally {
            processedCount++
            setImportProgress(Math.round((processedCount / activities.length) * 100))
          }
        }
      }

      if (successCount === 0) {
        onImportError(
          `Import failed. ${errorRows.length > 0 ? errorRows.slice(0, 3).join(' ') : 'No rows were inserted.'}`.trim()
        )
        return
      }

      onImportSuccess(successCount)

      if (errorRows.length > 0) {
        console.warn('Import completed with warnings:', errorRows.slice(0, 10).join(' | '))
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process Excel file.'
      onImportError(message)
    } finally {
      setImportProgress(0)
      setIsImporting(false)
    }
  }

  return (
    <div className="excel-import-container">
      <div className="excel-import-section">
        <h3>Import Activities from Excel</h3>
        <p className="excel-hint">
          Upload an Excel file to bulk import activities. Expected columns: Date, Performer,
          System, Instrument, Problem, Action, Comments.
        </p>

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
              <div className="progress-fill" style={{ width: `${importProgress}%` }}></div>
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
