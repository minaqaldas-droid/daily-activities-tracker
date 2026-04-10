import React, { useState } from 'react'

interface SearchFilters {
  date?: string
  startDate?: string
  endDate?: string
  performer?: string
  instrument?: string
  system?: string
  keyword?: string
}

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
}

const SYSTEMS = [
  'DCS',
  'ESD',
  'FGS',
  'ACCS',
  'LCS',
  '200K1A',
  '200K1B',
  '200K2A',
  '200K2B',
  '400K1',
  '923K1A',
  '923K1B',
  '923K1C',
  'Demi',
  'Sanitary',
  'Steam Boiler',
  'Air Dryer A/B',
  'Air Dryer C/D',
  '400CEMS',
]

export const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, isLoading = false }) => {
  const [keyword, setKeyword] = useState('')
  const [singleDate, setSingleDate] = useState('')
  const [useDateRange, setUseDateRange] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [performer, setPerformer] = useState('')
  const [system, setSystem] = useState('')
  const [instrument, setInstrument] = useState('')

  const handleSearch = (e: React.FormEvent) => {
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

    onSearch(filters)
  }

  const handleReset = () => {
    setKeyword('')
    setSingleDate('')
    setStartDate('')
    setEndDate('')
    setPerformer('')
    setSystem('')
    setInstrument('')
    setUseDateRange(false)
    onSearch({})
  }

  const hasActiveFilters = keyword || singleDate || startDate || endDate || performer || system || instrument

  return (
    <form onSubmit={handleSearch} className="search-filter">
      <h3>🔍 Search & Filter Activities</h3>
      
      {/* Keyword Search */}
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
          <small>Searches across date, performer, system, instrument, problem, action, and comments</small>
        </div>
      </div>

      {/* Date Search */}
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

      {/* Other Filters */}
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
            {SYSTEMS.map((sys) => (
              <option key={sys} value={sys}>
                {sys}
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
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : '🔍 Search'}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={isLoading}
          >
            ✕ Clear All
          </button>
        )}
      </div>
    </form>
  )
}
