import React, { useState } from 'react'
import { SYSTEM_OPTIONS } from '../constants/systems'
import { type SearchFilters } from '../supabaseClient'

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void | Promise<void>
  isLoading?: boolean
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, isLoading = false }) => {
  const [keyword, setKeyword] = useState('')
  const [singleDate, setSingleDate] = useState('')
  const [useDateRange, setUseDateRange] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [performer, setPerformer] = useState('')
  const [system, setSystem] = useState('')
  const [instrument, setInstrument] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    const filters: SearchFilters = {
      keyword: keyword || undefined,
      performer: performer || undefined,
      instrument: instrument || undefined,
      system: system || undefined,
    }

    if (useDateRange) {
      filters.startDate = startDate || undefined
      filters.endDate = endDate || undefined
    } else {
      filters.date = singleDate || undefined
    }

    await onSearch(filters)
  }

  const handleReset = async () => {
    setKeyword('')
    setSingleDate('')
    setStartDate('')
    setEndDate('')
    setPerformer('')
    setSystem('')
    setInstrument('')
    setUseDateRange(false)
    await onSearch({})
  }

  const hasActiveFilters = Boolean(
    keyword || singleDate || startDate || endDate || performer || system || instrument
  )

  return (
    <form onSubmit={handleSearch} className="search-filter">
      <h3>Search & Filter Activities</h3>

      <div className="search-section-group">
        <h4>Search by Keyword</h4>
        <div className="form-group">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search any word in activities..."
            disabled={isLoading}
            className="keyword-input"
          />
          <small>Searches across date, performer, system, instrument, problem, action, and comments.</small>
        </div>
      </div>

      <div className="search-section-group">
        <h4>Search by Date</h4>
        <div className="date-toggle">
          <label>
            <input
              type="radio"
              checked={!useDateRange}
              onChange={() => setUseDateRange(false)}
              disabled={isLoading}
            />
            Single Date
          </label>
          <label>
            <input
              type="radio"
              checked={useDateRange}
              onChange={() => setUseDateRange(true)}
              disabled={isLoading}
            />
            Date Range
          </label>
        </div>

        {!useDateRange ? (
          <div className="form-group">
            <label htmlFor="singleDate">Date</label>
            <input
              type="date"
              id="singleDate"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="date-range-grid">
            <div className="form-group">
              <label htmlFor="startDate">From</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">To</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </div>

      <div className="search-grid">
        <div className="form-group">
          <label htmlFor="filterSystem">By System</label>
          <select
            id="filterSystem"
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            disabled={isLoading}
          >
            <option value="">All Systems</option>
            {SYSTEM_OPTIONS.map((systemOption) => (
              <option key={systemOption} value={systemOption}>
                {systemOption}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="filterPerformer">By Performer</label>
          <input
            type="text"
            id="filterPerformer"
            value={performer}
            onChange={(e) => setPerformer(e.target.value)}
            placeholder="Search performer name..."
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="filterInstrument">By Instrument/Tag</label>
          <input
            type="text"
            id="filterInstrument"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value)}
            placeholder="Search instrument..."
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="search-actions">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
        {hasActiveFilters && (
          <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={isLoading}>
            Clear All
          </button>
        )}
      </div>
    </form>
  )
}
