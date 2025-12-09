"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { X, Filter, RotateCcw } from 'lucide-react'

interface FilterBarProps {
  onFiltersChange: (filters: FilterState) => void
  activeFiltersCount: number
}

export interface FilterState {
  datePosted: string
  payRange: [number, number]
  distance: string
  jobType: string[]
  language: string[]
  company: string
  skills: string[]
  isRemote: boolean
  hasVisaSupport: boolean
  isEntryLevel: boolean
}

const DEFAULT_FILTERS: FilterState = {
  datePosted: 'any',
  payRange: [40000, 200000],
  distance: 'any',
  jobType: [],
  language: [],
  company: '',
  skills: [],
  isRemote: false,
  hasVisaSupport: false,
  isEntryLevel: false
}

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Temporary'
]

const LANGUAGES = [
  'English',
  'French',
  'Bilingual (EN/FR)'
]

const POPULAR_SKILLS = [
  'React',
  'Node.js',
  'Python',
  'AWS',
  'SQL',
  'JavaScript',
  'TypeScript',
  'Machine Learning',
  'Product Management',
  'Digital Marketing'
]

export default function FilterBar({ onFiltersChange, activeFiltersCount }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    onFiltersChange(DEFAULT_FILTERS)
  }

  const toggleArrayFilter = (filterType: 'jobType' | 'language' | 'skills', value: string) => {
    const currentArray = filters[filterType] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilters({ [filterType]: newArray })
  }

  return (
    <>
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          
          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-4 flex-wrap">
            
            {/* Date Posted */}
            <Select value={filters.datePosted} onValueChange={(value) => updateFilters({ datePosted: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Date Posted" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="3days">Last 3 days</SelectItem>
                <SelectItem value="week">Past week</SelectItem>
                <SelectItem value="month">Past month</SelectItem>
              </SelectContent>
            </Select>

            {/* Distance */}
            <Select value={filters.distance} onValueChange={(value) => updateFilters({ distance: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any distance</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="5km">Within 5 km</SelectItem>
                <SelectItem value="10km">Within 10 km</SelectItem>
                <SelectItem value="25km">Within 25 km</SelectItem>
                <SelectItem value="50km">Within 50 km</SelectItem>
              </SelectContent>
            </Select>

            {/* Job Type Badges */}
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map(type => (
                <Badge
                  key={type}
                  variant={filters.jobType.includes(type) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    filters.jobType.includes(type) 
                      ? 'bg-primary-500 text-white' 
                      : 'hover:bg-primary-50'
                  }`}
                  onClick={() => toggleArrayFilter('jobType', type)}
                >
                  {type}
                </Badge>
              ))}
            </div>

            {/* Language */}
            <Select 
              value={filters.language[0] || 'any'} 
              onValueChange={(value) => updateFilters({ language: value === 'any' ? [] : [value] })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any language</SelectItem>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <Badge
                variant={filters.isRemote ? "default" : "outline"}
                className={`cursor-pointer ${filters.isRemote ? 'bg-green-500' : 'hover:bg-green-50'}`}
                onClick={() => updateFilters({ isRemote: !filters.isRemote })}
              >
                Remote
              </Badge>
              <Badge
                variant={filters.hasVisaSupport ? "default" : "outline"}
                className={`cursor-pointer ${filters.hasVisaSupport ? 'bg-blue-500' : 'hover:bg-blue-50'}`}
                onClick={() => updateFilters({ hasVisaSupport: !filters.hasVisaSupport })}
              >
                Visa Support
              </Badge>
              <Badge
                variant={filters.isEntryLevel ? "default" : "outline"}
                className={`cursor-pointer ${filters.isEntryLevel ? 'bg-purple-500' : 'hover:bg-purple-50'}`}
                onClick={() => updateFilters({ isEntryLevel: !filters.isEntryLevel })}
              >
                Entry Level
              </Badge>
            </div>

          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600">
                {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}:
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Clear all
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Date Posted */}
              <div>
                <label className="block text-sm font-medium mb-2">Date Posted</label>
                <Select value={filters.datePosted} onValueChange={(value) => updateFilters({ datePosted: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="3days">Last 3 days</SelectItem>
                    <SelectItem value="week">Past week</SelectItem>
                    <SelectItem value="month">Past month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Salary Range: ${filters.payRange[0].toLocaleString()} - ${filters.payRange[1].toLocaleString()}
                </label>
                <Slider
                  value={filters.payRange}
                  onValueChange={(value) => updateFilters({ payRange: value as [number, number] })}
                  min={30000}
                  max={250000}
                  step={5000}
                  className="mt-3"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium mb-3">Job Type</label>
                <div className="space-y-3">
                  {JOB_TYPES.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.jobType.includes(type)}
                        onCheckedChange={() => toggleArrayFilter('jobType', type)}
                      />
                      <label className="text-sm">{type}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium mb-3">Language</label>
                <div className="space-y-3">
                  {LANGUAGES.map(lang => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.language.includes(lang)}
                        onCheckedChange={() => toggleArrayFilter('language', lang)}
                      />
                      <label className="text-sm">{lang}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <label className="block text-sm font-medium mb-3">Special Filters</label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.isRemote}
                      onCheckedChange={(checked) => updateFilters({ isRemote: checked as boolean })}
                    />
                    <label className="text-sm">Remote Jobs</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.hasVisaSupport}
                      onCheckedChange={(checked) => updateFilters({ hasVisaSupport: checked as boolean })}
                    />
                    <label className="text-sm">Visa Support</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.isEntryLevel}
                      onCheckedChange={(checked) => updateFilters({ isEntryLevel: checked as boolean })}
                    />
                    <label className="text-sm">Entry Level</label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" onClick={resetFilters} className="flex-1">
                  Clear All
                </Button>
                <Button onClick={() => setShowMobileFilters(false)} className="flex-1">
                  Apply Filters
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}