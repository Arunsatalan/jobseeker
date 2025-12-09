"use client"

import { useState, useRef, useEffect } from 'react'
import { Search, MapPin, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  onSearch: (jobQuery: string, locationQuery: string) => void
  initialJob?: string
  initialLocation?: string
}

const POPULAR_ROLES = [
  'Software Engineer',
  'Product Manager',
  'Data Analyst',
  'UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Customer Service',
  'Project Manager'
]

const POPULAR_LOCATIONS = [
  'Toronto, ON',
  'Vancouver, BC',
  'Montreal, QC',
  'Calgary, AB',
  'Ottawa, ON',
  'Edmonton, AB',
  'Winnipeg, MB',
  'Halifax, NS'
]

export default function SearchBar({ onSearch, initialJob = '', initialLocation = '' }: SearchBarProps) {
  const [jobQuery, setJobQuery] = useState(initialJob)
  const [locationQuery, setLocationQuery] = useState(initialLocation)
  const [showJobSuggestions, setShowJobSuggestions] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [selectedJobIndex, setSelectedJobIndex] = useState(-1)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1)

  const jobInputRef = useRef<HTMLInputElement>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const jobSuggestionsRef = useRef<HTMLDivElement>(null)
  const locationSuggestionsRef = useRef<HTMLDivElement>(null)

  const filteredRoles = POPULAR_ROLES.filter(role =>
    role.toLowerCase().includes(jobQuery.toLowerCase())
  ).slice(0, 6)

  const filteredLocations = POPULAR_LOCATIONS.filter(location =>
    location.toLowerCase().includes(locationQuery.toLowerCase())
  ).slice(0, 6)

  const handleSearch = () => {
    onSearch(jobQuery, locationQuery)
    setShowJobSuggestions(false)
    setShowLocationSuggestions(false)
  }

  const handleJobKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedJobIndex >= 0 && filteredRoles[selectedJobIndex]) {
        setJobQuery(filteredRoles[selectedJobIndex])
        setShowJobSuggestions(false)
        locationInputRef.current?.focus()
      } else {
        handleSearch()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedJobIndex(prev => Math.min(prev + 1, filteredRoles.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedJobIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setShowJobSuggestions(false)
      setSelectedJobIndex(-1)
    }
  }

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedLocationIndex >= 0 && filteredLocations[selectedLocationIndex]) {
        setLocationQuery(filteredLocations[selectedLocationIndex])
        setShowLocationSuggestions(false)
        handleSearch()
      } else {
        handleSearch()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedLocationIndex(prev => Math.min(prev + 1, filteredLocations.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedLocationIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setShowLocationSuggestions(false)
      setSelectedLocationIndex(-1)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!jobSuggestionsRef.current?.contains(event.target as Node) && 
          !jobInputRef.current?.contains(event.target as Node)) {
        setShowJobSuggestions(false)
      }
      if (!locationSuggestionsRef.current?.contains(event.target as Node) && 
          !locationInputRef.current?.contains(event.target as Node)) {
        setShowLocationSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center">
          <div className="flex flex-1 flex-col lg:flex-row gap-3 w-full">
            {/* Job Search Input */}
            <div className="relative flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  ref={jobInputRef}
                  type="text"
                  placeholder="Job title, keyword, or company"
                  value={jobQuery}
                  onChange={(e) => {
                    setJobQuery(e.target.value)
                    setShowJobSuggestions(true)
                    setSelectedJobIndex(-1)
                  }}
                  onFocus={() => setShowJobSuggestions(true)}
                  onKeyDown={handleJobKeyDown}
                  className="pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-primary-500 transition-colors"
                />
              </div>
              
              {/* Job Suggestions Dropdown */}
              {showJobSuggestions && filteredRoles.length > 0 && (
                <div
                  ref={jobSuggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {filteredRoles.map((role, index) => (
                    <button
                      key={role}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        selectedJobIndex === index ? 'bg-primary-50 text-primary-600' : ''
                      }`}
                      onClick={() => {
                        setJobQuery(role)
                        setShowJobSuggestions(false)
                        locationInputRef.current?.focus()
                      }}
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span>{role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Input */}
            <div className="relative flex-1">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  ref={locationInputRef}
                  type="text"
                  placeholder="City, Province (e.g., Toronto, ON)"
                  value={locationQuery}
                  onChange={(e) => {
                    setLocationQuery(e.target.value)
                    setShowLocationSuggestions(true)
                    setSelectedLocationIndex(-1)
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  onKeyDown={handleLocationKeyDown}
                  className="pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && filteredLocations.length > 0 && (
                <div
                  ref={locationSuggestionsRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {filteredLocations.map((location, index) => (
                    <button
                      key={location}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        selectedLocationIndex === index ? 'bg-primary-50 text-primary-600' : ''
                      }`}
                      onClick={() => {
                        setLocationQuery(location)
                        setShowLocationSuggestions(false)
                        handleSearch()
                      }}
                    >
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{location}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-400 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            Find Jobs
          </Button>
        </div>

        {/* Search Tips */}
        <div className="mt-3 text-sm text-gray-500 flex items-center gap-2">
          <Command className="h-4 w-4" />
          <span>Press Enter to search • Use ↑↓ to navigate suggestions</span>
        </div>
      </div>
    </div>
  )
}