"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { 
  useScrollIntoView, 
  useBodyScrollLock, 
  useFocusTrap,
  useScrollPositionMemory,
  useJobListKeyboardNav 
} from '@/hooks/useScrollBehavior'

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  Clock, 
  Building2, 
  DollarSign, 
  X, 
  Eye, 
  LogIn,
  Heart,
  Share2,
  ChevronRight,
  ChevronDown,
  Filter,
  Sliders,
  Calendar,
  Briefcase,
  Users,
  Globe,
  BookmarkIcon,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Award
} from 'lucide-react'
import { MOCK_SOFTWARE_ENGINEER_JOBS } from './mockSoftwareEngineerJobs'

// API Job interface from backend
interface ApiJob {
  _id: string
  title: string
  company: string
  location: string
  employmentType: string
  experience: string
  salaryMin?: number
  salaryMax?: number
  salaryPeriod?: string
  description: string
  requirements: string[]
  skills: string[]
  remote: boolean
  status: string
  employer?: { firstName: string; lastName: string; company: string }
  stats?: { views: number; applications: number }
  tags?: string[]
  customSections?: { title: string; content: string; _id: string }[]
  industry?: string
  category?: string
  currency?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  employmentType: string
  experience: string
  salaryMin?: number
  salaryMax?: number
  salaryPeriod?: string
  postedTime: string
  expiryDate?: string
  jobType: string
  salary?: string
  description: string
  fullDescription?: string
  requirements: string[]
  benefits: string[]
  badges: string[]
  skills: string[]
  customSections: { title: string; content: string; _id: string }[]
  industry?: string
  category?: string
  isRemote: boolean
  hasVisaSupport: boolean
  isEntryLevel: boolean
  isNew: boolean
  applicationInstructions: string
  isBookmarked?: boolean
}

interface FilterState {
  datePosted: string
  salaryMin: number | null
  salaryMax: number | null
  jobType: string[]
  isRemote: boolean | null
  visaSupport: boolean | null
}

interface LocationSuggestion {
  city: string
  province: string
}

const LOCATION_SUGGESTIONS: LocationSuggestion[] = [
  { city: 'Toronto', province: 'ON' },
  { city: 'Vancouver', province: 'BC' },
  { city: 'Montreal', province: 'QC' },
  { city: 'Calgary', province: 'AB' },
  { city: 'Edmonton', province: 'AB' },
  { city: 'Ottawa', province: 'ON' },
  { city: 'Winnipeg', province: 'MB' },
  { city: 'Quebec City', province: 'QC' },
]

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'temporary']

// Convert API job to frontend Job interface
const convertApiJobToJob = (apiJob: ApiJob): Job => {
  console.log('Converting API job:', apiJob)
  console.log('Skills:', apiJob.skills)
  console.log('Custom sections:', apiJob.customSections)
  console.log('Tags:', apiJob.tags)
  
  // Calculate days since posted
  const createdDate = new Date(apiJob.createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createdDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let postedTimeText = ''
  if (diffDays === 0) {
    postedTimeText = 'today'
  } else if (diffDays === 1) {
    postedTimeText = '1 day ago'
  } else {
    postedTimeText = `${diffDays} days ago`
  }
  
  // Create badges based on job properties
  const badges: string[] = []
  if (apiJob.remote) badges.push('Remote')
  if (apiJob.experience === 'entry') badges.push('Entry-level')
  if (diffDays <= 3) badges.push('New')
  
  console.log('=== CONVERSION DEBUG ===')
  console.log('API Job ID:', apiJob._id)
  console.log('API Job Title:', apiJob.title)
  console.log('API Skills:', apiJob.skills, 'Type:', typeof apiJob.skills, 'Is Array:', Array.isArray(apiJob.skills))
  console.log('API Custom Sections:', apiJob.customSections, 'Type:', typeof apiJob.customSections, 'Is Array:', Array.isArray(apiJob.customSections))
  console.log('API Tags:', apiJob.tags, 'Type:', typeof apiJob.tags, 'Is Array:', Array.isArray(apiJob.tags))
  console.log('API Requirements:', apiJob.requirements, 'Type:', typeof apiJob.requirements, 'Is Array:', Array.isArray(apiJob.requirements))
  console.log('======================')
  
  const converted: Job = {
    id: apiJob._id,
    title: apiJob.title || '',
    company: apiJob.company || '',
    location: apiJob.location || '',
    employmentType: apiJob.employmentType || 'full-time',
    experience: apiJob.experience || 'mid',
    salaryMin: apiJob.salaryMin,
    salaryMax: apiJob.salaryMax,
    salaryPeriod: apiJob.salaryPeriod === 'yearly' ? 'year' : apiJob.salaryPeriod === 'hourly' ? 'hour' : apiJob.salaryPeriod,
    postedTime: postedTimeText,
    expiryDate: apiJob.expiresAt ? new Date(apiJob.expiresAt).toLocaleDateString() : undefined,
    jobType: apiJob.employmentType ? apiJob.employmentType.charAt(0).toUpperCase() + apiJob.employmentType.slice(1) : 'Full-time',
    salary: (apiJob.salaryMin && apiJob.salaryMax) ? `$${apiJob.salaryMin.toLocaleString()} - $${apiJob.salaryMax.toLocaleString()}` : undefined,
    description: apiJob.description || '',
    fullDescription: apiJob.description || '',
    requirements: Array.isArray(apiJob.requirements) ? apiJob.requirements : [],
    benefits: Array.isArray(apiJob.tags) ? apiJob.tags : [],
    badges: badges,
    skills: Array.isArray(apiJob.skills) ? apiJob.skills : [],
    customSections: Array.isArray(apiJob.customSections) ? apiJob.customSections : [],
    industry: apiJob.industry,
    category: apiJob.category,
    isRemote: apiJob.remote || false,
    hasVisaSupport: false,
    isEntryLevel: apiJob.experience === 'entry',
    isNew: diffDays <= 3,
    applicationInstructions: 'Click Apply Now to submit your application.',
    isBookmarked: false
  }
  
  console.log('=== CONVERTED JOB ===')
  console.log('Converted Job ID:', converted.id)
  console.log('Converted Skills:', converted.skills, 'Length:', converted.skills.length)
  console.log('Converted Custom Sections:', converted.customSections, 'Length:', converted.customSections.length)
  console.log('Converted Benefits:', converted.benefits, 'Length:', converted.benefits.length)
  console.log('Converted Requirements:', converted.requirements, 'Length:', converted.requirements.length)
  console.log('=====================')
  
  return converted
}

export default function AdvancedJobSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jobListRef = useRef<HTMLDivElement>(null)
  const detailPanelRef = useRef<HTMLDivElement>(null)
  const jobCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Search State
  const [jobQuery, setJobQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)

  // Jobs State
  const [allJobs, setAllJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set())
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [showSavedJobs, setShowSavedJobs] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    datePosted: 'all',
    salaryMin: null,
    salaryMax: null,
    jobType: [],
    isRemote: null,
    visaSupport: null,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  // Analytics
  const [scrollPosition, setScrollPosition] = useState(0)

  // Hooks for scroll management (AFTER all state declarations)
  const { saveScrollPosition, restoreScrollPosition } = useScrollPositionMemory('jobListScroll')
  const detailScrollRef = useScrollIntoView(!!selectedJobId, 50)
  const { ref: modalRef } = useFocusTrap(false) // Focus trap for future modal implementation
  
  // Lock body scroll when needed (future: for mobile modal)
  useBodyScrollLock(false)

  // Fetch all jobs from database
  const fetchAllJobs = useCallback(async () => {
    setLoading(true)
    try {
      console.log('Fetching jobs from API...')
      const response = await axios.get('/api/v1/jobs', {
        params: { page: 1, limit: 50 }
      })
      
      console.log('API Response:', response.data)
      
      let jobs: Job[] = []
      
      if (Array.isArray(response.data)) {
        jobs = response.data.map(convertApiJobToJob)
      } else if (response.data.jobs && Array.isArray(response.data.jobs)) {
        jobs = response.data.jobs.map(convertApiJobToJob)
      } else if (response.data.data && Array.isArray(response.data.data)) {
        jobs = response.data.data.map(convertApiJobToJob)
      } else {
        console.log('Unexpected API response format:', response.data)
        jobs = []
      }
      
      console.log('Converted jobs:', jobs)
      
      setAllJobs(jobs)
      setFilteredJobs(jobs)
      setTotalResults(jobs.length)
      
      if (jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(jobs[0].id)
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      setAllJobs([])
      setFilteredJobs([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load saved jobs from localStorage and fetch jobs on mount
  useEffect(() => {
    const savedJobIds = localStorage.getItem('savedJobs')
    if (savedJobIds) {
      const ids = JSON.parse(savedJobIds) as string[]
      setBookmarkedJobs(new Set(ids))
    }
    fetchAllJobs()
  }, [fetchAllJobs])

  // Get selected job
  const selectedJob = selectedJobId 
    ? allJobs.find(job => job.id === selectedJobId) 
    : filteredJobs[0] || null

  // Update selected job on page load
  useEffect(() => {
    if (filteredJobs.length > 0 && !selectedJobId) {
      setSelectedJobId(filteredJobs[0].id)
    }
  }, [filteredJobs])

  // Keyboard navigation for job list
  useJobListKeyboardNav(
    filteredJobs,
    selectedJobId,
    (id) => setSelectedJobId(id),
    true
  )

  // Initialize from URL params and fetch jobs
  useEffect(() => {
    const job = searchParams.get('job') || ''
    const location = searchParams.get('location') || ''
    
    setJobQuery(job)
    setLocationQuery(location)

    if (job || location) {
      handleSearch(job, location, false)
    } else {
      // Always fetch all jobs on initial load
      fetchAllJobs()
    }
  }, [fetchAllJobs])

  // Handle location suggestions
  const handleLocationChange = (value: string) => {
    setLocationQuery(value)
    if (value.length > 0) {
      const suggestions = LOCATION_SUGGESTIONS.filter(loc =>
        loc.city.toLowerCase().includes(value.toLowerCase()) ||
        loc.province.toLowerCase().includes(value.toLowerCase())
      )
      setLocationSuggestions(suggestions)
      setShowLocationSuggestions(true)
    } else {
      setShowLocationSuggestions(false)
    }
  }

  const selectLocationSuggestion = (suggestion: LocationSuggestion) => {
    setLocationQuery(`${suggestion.city}, ${suggestion.province}`)
    setShowLocationSuggestions(false)
  }

  // Advanced filtering logic
  const applyFilters = useCallback((jobs: Job[], filterState: FilterState): Job[] => {
    let filtered = jobs

    // Date posted filter
    if (filterState.datePosted !== 'all') {
      const now = new Date()
      filtered = filtered.filter(job => {
        // Parse "X days ago" format
        const match = job.postedTime.match(/(\d+)/)
        if (!match) return true
        const days = parseInt(match[1])
        
        switch (filterState.datePosted) {
          case '7':
            return days <= 7
          case '30':
            return days <= 30
          case '90':
            return days <= 90
          default:
            return true
        }
      })
    }

    // Salary filter
    if (filterState.salaryMin !== null || filterState.salaryMax !== null) {
      filtered = filtered.filter(job => {
        if (!job.salary) return false
        // Parse salary like "$120,000 - $160,000"
        const match = job.salary.match(/\$?([\d,]+)/g)
        if (!match || match.length < 1) return false
        const jobMin = parseInt(match[0].replace(/\$|,/g, ''))
        const jobMax = match[1] ? parseInt(match[1].replace(/\$|,/g, '')) : jobMin

        if (filterState.salaryMin && jobMin < filterState.salaryMin) return false
        if (filterState.salaryMax && jobMax > filterState.salaryMax) return false
        return true
      })
    }

    // Job type filter
    if (filterState.jobType.length > 0) {
      filtered = filtered.filter(job => filterState.jobType.includes(job.employmentType))
    }

    // Remote filter
    if (filterState.isRemote !== null) {
      filtered = filtered.filter(job => job.isRemote === filterState.isRemote)
    }

    // Visa support filter
    if (filterState.visaSupport !== null) {
      filtered = filtered.filter(job => job.hasVisaSupport === filterState.visaSupport)
    }

    return filtered
  }, [])

  // Enhanced client-side search for skills and job details
  const enhancedJobSearch = useCallback((jobs: Job[], searchQuery: string): Job[] => {
    if (!searchQuery.trim()) return jobs

    const query = searchQuery.toLowerCase().trim()
    
    return jobs.filter(job => {
      // Search in job title
      if (job.title.toLowerCase().includes(query)) return true
      
      // Search in company name
      if (job.company.toLowerCase().includes(query)) return true
      
      // Search in skills array (e.g., "java", "react", "python")
      if (job.skills.some(skill => skill.toLowerCase().includes(query))) return true
      
      // Search in requirements
      if (job.requirements.some(req => req.toLowerCase().includes(query))) return true
      
      // Search in job description
      if (job.description.toLowerCase().includes(query)) return true
      
      // Search in benefits
      if (job.benefits.some(benefit => benefit.toLowerCase().includes(query))) return true
      
      // Search in custom sections content
      if (job.customSections.some(section => 
        section.title.toLowerCase().includes(query) || 
        section.content.toLowerCase().includes(query)
      )) return true
      
      // Search in category and industry
      if (job.category?.toLowerCase().includes(query)) return true
      if (job.industry?.toLowerCase().includes(query)) return true
      
      // Search in employment type
      if (job.employmentType.toLowerCase().includes(query)) return true
      
      return false
    })
  }, [])

  // Main search handler
  const handleSearch = useCallback(async (jobQ: string, locationQ: string, updateUrl = true) => {
    setLoading(true)

    try {
      let jobs: Job[] = []
      let useClientSideSearch = false
      
      if (jobQ.trim() || locationQ.trim()) {
        console.log('Searching with params:', { keyword: jobQ.trim(), location: locationQ.trim() })
        // Call search API
        const response = await axios.get('/api/v1/jobs/search', {
          params: {
            keyword: jobQ.trim(),
            location: locationQ.trim(),
            page: 1,
            limit: 50
          }
        })
        
        console.log('Search API Response:', response.data)
        
        if (Array.isArray(response.data)) {
          jobs = response.data.map(convertApiJobToJob)
        } else if (response.data.jobs && Array.isArray(response.data.jobs)) {
          jobs = response.data.jobs.map(convertApiJobToJob)
        } else if (response.data.data && Array.isArray(response.data.data)) {
          jobs = response.data.data.map(convertApiJobToJob)
        }
        
        // If API search returns no results but we have a search query, 
        // fall back to fetching all jobs and use client-side search
        if (jobs.length === 0 && jobQ.trim()) {
          console.log('API search returned no results, falling back to client-side search')
          const allJobsResponse = await axios.get('/api/v1/jobs', {
            params: { page: 1, limit: 50 }
          })
          
          let allJobsData: Job[] = []
          if (Array.isArray(allJobsResponse.data)) {
            allJobsData = allJobsResponse.data.map(convertApiJobToJob)
          } else if (allJobsResponse.data.jobs && Array.isArray(allJobsResponse.data.jobs)) {
            allJobsData = allJobsResponse.data.jobs.map(convertApiJobToJob)
          } else if (allJobsResponse.data.data && Array.isArray(allJobsResponse.data.data)) {
            allJobsData = allJobsResponse.data.data.map(convertApiJobToJob)
          }
          
          setAllJobs(allJobsData)
          jobs = allJobsData
          useClientSideSearch = true
        } else {
          setAllJobs(jobs)
        }
      } else {
        // If no search terms, fetch all jobs
        await fetchAllJobs()
        return
      }

      // Apply enhanced search and filters
      let searchAndFilteredResults: Job[]
      
      if (useClientSideSearch && jobQ.trim()) {
        // Use client-side search on all jobs
        searchAndFilteredResults = applyFilters(enhancedJobSearch(jobs, jobQ), filters)
        console.log('Applied client-side search for:', jobQ, 'Results:', searchAndFilteredResults.length)
      } else if (jobQ.trim()) {
        // Use API results with additional client-side search enhancement
        searchAndFilteredResults = applyFilters(enhancedJobSearch(jobs, jobQ), filters)
      } else {
        // No search query, just apply filters
        searchAndFilteredResults = applyFilters(jobs, filters)
      }
      
      setFilteredJobs(searchAndFilteredResults)
      setTotalResults(searchAndFilteredResults.length)
      setSelectedJobId(searchAndFilteredResults.length > 0 ? searchAndFilteredResults[0].id : null)

      if (updateUrl) {
        const params = new URLSearchParams()
        if (jobQ.trim()) params.set('job', jobQ.trim())
        if (locationQ.trim()) params.set('location', locationQ.trim())
        const queryString = params.toString()
        router.push(queryString ? `?${queryString}` : '/', { scroll: false })
      }
    } catch (err) {
      console.error('Search error:', err)
      // Fallback to fetch all jobs
      await fetchAllJobs()
    } finally {
      setLoading(false)
    }
  }, [applyFilters, filters, router, fetchAllJobs])

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)

    // Apply both search and filters
    const searchAndFiltered = jobQuery.trim() ? 
      applyFilters(enhancedJobSearch(allJobs, jobQuery), newFilters) : 
      applyFilters(allJobs, newFilters)
    
    setFilteredJobs(searchAndFiltered)

    // Calculate active filters
    const activeCount = [
      newFilters.datePosted !== 'all',
      newFilters.salaryMin !== null,
      newFilters.salaryMax !== null,
      newFilters.jobType.length > 0,
      newFilters.isRemote !== null,
      newFilters.visaSupport !== null,
    ].filter(Boolean).length

    setActiveFilterCount(activeCount)
  }, [applyFilters, enhancedJobSearch, allJobs, jobQuery])

  const handleBookmark = (jobId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()

    const job = allJobs.find(j => j.id === jobId)
    if (!job) return

    setBookmarkedJobs(prev => {
      const newSet = new Set(prev)
      const isCurrentlyBookmarked = newSet.has(jobId)

      if (isCurrentlyBookmarked) {
        // Remove from saved jobs
        newSet.delete(jobId)
        setSavedJobs(prevSaved => prevSaved.filter(j => j.id !== jobId))
      } else {
        // Add to saved jobs (only if not already there)
        newSet.add(jobId)
        setSavedJobs(prevSaved => {
          // Check if job is already saved to prevent duplicates
          const isAlreadySaved = prevSaved.some(j => j.id === jobId)
          return isAlreadySaved ? prevSaved : [...prevSaved, job]
        })
      }

      // Save to localStorage
      const savedJobIds = Array.from(newSet)
      localStorage.setItem('savedJobs', JSON.stringify(savedJobIds))

      return newSet
    })
  }

  const handleJobSelect = useCallback((jobId: string) => {
    // Save current scroll position before switching jobs
    saveScrollPosition()
    
    // Update selected job
    setSelectedJobId(jobId)

    // Scroll detail panel into view on desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100)
    }
  }, [saveScrollPosition])

  const handleShare = (job: Job, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: window.location.href,
      })
    }
  }

  const handleApply = (job: Job) => {
    router.push('/login')
  }

  const handleClearFilters = () => {
    const resetFilters: FilterState = {
      datePosted: 'all',
      salaryMin: null,
      salaryMax: null,
      jobType: [],
      isRemote: null,
      visaSupport: null,
    }
    handleFilterChange(resetFilters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(jobQuery, locationQuery)
    }
  }

  // Calculate days since posted
  const getDaysSincePosted = (postedTime: string): number => {
    const match = postedTime.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ==================== SEARCH BAR ==================== */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Logo/Title */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold bg-linear-to-r from-slate-800 to-amber-900 bg-clip-text text-transparent">
              Find Your Dream Job in Canada
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Discover top opportunities tailored to your skills
            </p>
          </div>

          {/* Search Inputs */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Job Title Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Job title, skills (e.g., Java, Python), company, or keywords"
                value={jobQuery}
                onChange={(e) => setJobQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
              />
            </div>

            {/* Location Input */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                placeholder="City, Province (e.g., Toronto, ON)"
                value={locationQuery}
                onChange={(e) => handleLocationChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-700 focus:border-transparent"
              />

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-50">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectLocationSuggestion(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{suggestion.city}</span>
                      <span className="text-gray-500 text-sm">{suggestion.province}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <Button
              onClick={() => handleSearch(jobQuery, locationQuery)}
              disabled={loading}
              className="h-12 px-8 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Find Jobs
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[calc(100vh-200px)]">
          
          {/* ========== LEFT PANEL: JOB LIST ========== */}
          <div className={`${selectedJobId ? 'hidden lg:flex' : 'flex'} lg:col-span-1 flex-col`}>
            {/* ===== JOB COUNT (LEFT) ===== */}
            <div className="mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600 shrink-0" />
              <span className="text-sm font-semibold text-gray-900">
                {filteredJobs.length} Jobs
              </span>
              {activeFilterCount > 0 && (
                <Badge className="bg-slate-100 text-slate-700 animate-pulse ml-2 shrink-0">
                  {activeFilterCount}
                </Badge>
              )}
            </div>

            {/* ===== FLOATING BUTTONS (RIGHT BOTTOM CORNER) ===== */}
            <div className="fixed bottom-6 right-6 z-20 flex flex-col gap-3">
              {/* Saved Jobs Button */}
              <button
                onClick={() => setShowSavedJobs(!showSavedJobs)}
                aria-expanded={showSavedJobs}
                aria-controls="saved-jobs-panel"
                className="flex items-center gap-2 px-4 py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <Heart className={`h-5 w-5 ${savedJobs.length > 0 ? 'fill-white' : ''}`} />
                {savedJobs.length > 0 && (
                  <span className="bg-white text-amber-700 text-xs font-bold rounded-full px-2 py-0.5">
                    {savedJobs.length}
                  </span>
                )}
              </button>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="filter-panel"
                className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <Sliders className="h-5 w-5" />
                <ChevronDown
                  className={`h-5 w-5 transition-transform duration-300 ${
                    showFilters ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
            </div>

            {/* ===== EXPANDABLE FILTER PANEL (RIGHT SIDE) ===== */}
            {showFilters && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 z-20"
                  onClick={() => setShowFilters(false)}
                />

                {/* Filter Panel Modal - Right Side Below Header */}
                <div className="fixed top-48 right-6 z-30 w-96 max-h-[calc(100vh-200px)] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
                  <Card className="p-6 border-l-4 border-l-slate-700 border-gray-200 bg-white shadow-2xl">
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900">Filter Jobs</h2>
                      <button
                        onClick={() => setShowFilters(false)}
                        aria-label="Close filter panel"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-6 w-6 text-gray-600 hover:text-gray-900" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Live Preview Counter */}
                      {activeFilterCount > 0 && (
                        <div className="bg-slate-100 text-slate-900 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                          <span>✓ {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
                        </div>
                      )}

                      {/* Filter Panel Content */}
                      <FilterPanel 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        jobTypes={JOB_TYPES}
                      />

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-gray-300 flex gap-2 sticky bottom-0 bg-white py-3">
                        <Button
                          onClick={() => setShowFilters(false)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          Close
                        </Button>
                        {activeFilterCount > 0 && (
                          <Button
                            onClick={handleClearFilters}
                            variant="outline"
                            className="flex-1 text-gray-700 hover:text-gray-900"
                          >
                            Reset All
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* ===== EXPANDABLE SAVED JOBS PANEL (RIGHT SIDE) ===== */}
            {showSavedJobs && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 z-20"
                  onClick={() => setShowSavedJobs(false)}
                />

                {/* Saved Jobs Panel - Right Side */}
                <div className="fixed top-48 right-6 z-30 w-96 max-h-[calc(100vh-200px)] overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-300">
                  <Card className="p-6 border-l-4 border-l-amber-700 border-gray-200 bg-white shadow-2xl">
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Heart className="h-6 w-6 text-amber-700" />
                        Schedule ({savedJobs.length})
                      </h2>
                      <button
                        onClick={() => setShowSavedJobs(false)}
                        aria-label="Close schedule panel"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="h-6 w-6 text-gray-600 hover:text-gray-900" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {savedJobs.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {savedJobs.map((job) => (
                            <div
                              key={job.id}
                              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => {
                                setSelectedJobId(job.id)
                                setShowSavedJobs(false)
                              }}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                    {job.title}
                                  </h3>
                                  <p className="text-xs text-gray-600 line-clamp-1">
                                    {job.company}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBookmark(job.id, e)
                                  }}
                                  className="p-1 hover:bg-red-50 rounded transition-colors shrink-0"
                                  title="Remove from schedule"
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </button>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                <span className="line-clamp-1">{job.location}</span>
                                <span className="text-gray-400">•</span>
                                <Badge variant="outline" className="text-xs py-0">
                                  {job.jobType}
                                </Badge>
                              </div>

                              {job.salary && (
                                <div className="flex items-center gap-1 text-xs text-amber-700 mt-1">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  <span className="font-semibold">{job.salary}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-gray-900 font-semibold mb-1">No scheduled jobs yet</h3>
                          <p className="text-gray-600 text-sm">Click the bookmark icon on jobs to schedule them here</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-gray-300 flex gap-2">
                        <Button
                          onClick={() => setShowSavedJobs(false)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          Close
                        </Button>
                        {savedJobs.length > 0 && (
                          <Button
                            onClick={() => {
                              // Clear all saved jobs
                              setSavedJobs([])
                              setBookmarkedJobs(new Set())
                              localStorage.removeItem('savedJobs')
                            }}
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            Clear All
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* Results Summary */}
            <div className="text-xs text-gray-600 mb-4">
              Showing <span className="font-semibold text-gray-900">{filteredJobs.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalResults}</span> jobs
            </div>

            {/* Scrollable Job List */}
            <div
              ref={jobListRef}
              className="flex-1 overflow-y-auto pr-2 space-y-3"
              style={{
                scrollBehavior: 'smooth',
              }}
            >
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCardItem
                    key={job.id}
                    job={job}
                    isSelected={selectedJobId === job.id}
                    isBookmarked={bookmarkedJobs.has(job.id)}
                    onClick={() => handleJobSelect(job.id)}
                    onBookmark={() => handleBookmark(job.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Search className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-gray-900 font-semibold mb-1">No jobs found</h3>
                  <p className="text-gray-600 text-sm">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </div>

          {/* ========== RIGHT PANEL: JOB DETAIL ========== */}
          <div 
            ref={detailPanelRef}
            className={`${selectedJobId ? 'flex col-span-1' : 'hidden lg:flex'} lg:col-span-2 flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden`}
          >
            {selectedJob ? (
              <>
                {/* Mobile Back Button */}
                <div className="lg:hidden border-b border-gray-200 px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedJobId(null)}
                    className="flex items-center gap-2 text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Jobs
                  </Button>
                </div>
                
                {/* Detail Header */}
                <div className="bg-linear-to-r from-slate-50 to-amber-50 border-b border-gray-200 px-6 py-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                          {selectedJob.title}
                        </h1>
                        {selectedJob.isNew && (
                          <Badge className="bg-amber-700 text-white text-xs font-bold">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg text-gray-600">{selectedJob.company}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => handleBookmark(selectedJob.id, e)}
                        variant="outline"
                        size="icon"
                        className={bookmarkedJobs.has(selectedJob.id) ? 'text-red-500 border-red-500' : ''}
                      >
                        <Heart
                          className={`h-5 w-5 ${bookmarkedJobs.has(selectedJob.id) ? 'fill-red-500' : ''}`}
                        />
                      </Button>
                      <Button
                        onClick={(e) => handleShare(selectedJob, e)}
                        variant="outline"
                        size="icon"
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Job Meta Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span>Posted {selectedJob.postedTime}</span>
                    </div>
                    {selectedJob.salary && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-5 w-5 text-amber-700" />
                        <span className="font-semibold text-amber-700">{selectedJob.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedJob.jobType}</Badge>
                    </div>
                  </div>

                  {/* Badges */}
                  {selectedJob.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedJob.badges.map((badge) => (
                        <Badge
                          key={badge}
                          className="bg-slate-100 text-slate-700 border-slate-200"
                          variant="outline"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Detail Content - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                  {/* Job Description */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Job Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedJob.fullDescription || selectedJob.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Key Requirements</h2>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Benefits & Perks</h2>
                      <ul className="space-y-2">
                        {selectedJob.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-slate-700 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Required Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map((skill, index) => (
                          <Badge
                            key={index}
                            className="bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Sections */}
                  {selectedJob.customSections && selectedJob.customSections.length > 0 && (
                    <>
                      {selectedJob.customSections.map((section, index) => (
                        <div key={section._id || index}>
                          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            {section.title.includes('Perks') && <TrendingUp className="h-5 w-5 text-green-600" />}
                            {section.title.includes('🔧') && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                            {section.title.includes('🧠') && <Award className="h-5 w-5 text-purple-600" />}
                            {!section.title.includes('Perks') && !section.title.includes('🔧') && !section.title.includes('🧠') && <CheckCircle2 className="h-5 w-5 text-amber-700" />}
                            {section.title}
                          </h2>
                          <div className="space-y-3">
                            {section.content.split('\n\n').filter(item => item.trim()).map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-start gap-3">
                                <div className="h-2 w-2 bg-amber-700 rounded-full shrink-0 mt-2.5"></div>
                                <span className="text-gray-700 leading-relaxed">{item.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {/* Application Instructions */}
                  {selectedJob.applicationInstructions && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3">How to Apply</h2>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-gray-700">{selectedJob.applicationInstructions}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Detail Footer - CTA */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
                  <Button
                    onClick={() => handleApply(selectedJob)}
                    className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold h-12 rounded-lg flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In to Apply
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 px-6 rounded-lg"
                  >
                    Learn More
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Eye className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">Select a job to view details</h3>
                <p className="text-gray-600">Choose a job from the list to see full details and apply</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==================== JOB CARD COMPONENT ====================
interface JobCardItemProps {
  job: Job
  isSelected: boolean
  isBookmarked: boolean
  onClick: () => void
  onBookmark: () => void
}

function JobCardItem({ job, isSelected, isBookmarked, onClick, onBookmark }: JobCardItemProps) {
  const daysSince = parseInt(job.postedTime.match(/(\d+)/)?.[1] || '0')
  const isRecent = daysSince <= 3
  const cardRef = useRef<HTMLDivElement>(null)

  // Scroll card into view when selected (for mobile responsiveness)
  useEffect(() => {
    if (isSelected && cardRef.current) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 50)
    }
  }, [isSelected])

  return (
    <Card
      ref={cardRef}
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? 'border-slate-700 bg-slate-50 shadow-md'
          : 'border-transparent hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <CardContent className="p-0 space-y-3">
        {/* Title & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 text-sm line-clamp-2">
                {job.title}
              </h3>
              {isRecent && (
                <Badge className="bg-amber-700 text-white text-xs font-bold shrink-0">
                  NEW
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 line-clamp-1">
              {job.company}
            </p>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onBookmark()
            }}
            variant="ghost"
            size="sm"
            className="p-1 shrink-0"
          >
            <BookmarkIcon
              className={`h-5 w-5 ${
                isBookmarked
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
            />
          </Button>
        </div>

        {/* Location & Job Type */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="line-clamp-1">{job.location}</span>
          <span className="text-gray-400">•</span>
          <Badge variant="outline" className="text-xs py-0">
            {job.jobType}
          </Badge>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span>{job.postedTime}</span>
          {job.salary && (
            <>
              <span className="text-gray-400">•</span>
              <DollarSign className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span className="text-amber-700 font-semibold line-clamp-1">{job.salary}</span>
            </>
          )}
        </div>

        {/* Badges */}
        {job.badges.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.badges.slice(0, 2).map((badge) => (
              <Badge
                key={badge}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700"
              >
                {badge}
              </Badge>
            ))}
            {job.badges.length > 2 && (
              <Badge variant="outline" className="text-xs text-gray-600">
                +{job.badges.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          {job.isRemote && (
            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
              <Globe className="h-3 w-3" />
              Remote
            </div>
          )}
          {job.hasVisaSupport && (
            <div className="flex items-center gap-1 text-xs text-slate-700 bg-slate-50 px-2 py-1 rounded">
              <Users className="h-3 w-3" />
              Visa
            </div>
          )}
          {job.isEntryLevel && (
            <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
              <Briefcase className="h-3 w-3" />
              Entry-Level
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== FILTER PANEL COMPONENT ====================
interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  jobTypes: string[]
}

function FilterPanel({ filters, onFilterChange, jobTypes }: FilterPanelProps) {
  const handleDateChange = (date: string) => {
    onFilterChange({ ...filters, datePosted: date })
  }

  const handleJobTypeToggle = (type: string) => {
    const newTypes = filters.jobType.includes(type)
      ? filters.jobType.filter(t => t !== type)
      : [...filters.jobType, type]
    onFilterChange({ ...filters, jobType: newTypes })
  }

  const handleRemoteToggle = () => {
    onFilterChange({
      ...filters,
      isRemote: filters.isRemote === true ? null : true,
    })
  }

  const handleVisaToggle = () => {
    onFilterChange({
      ...filters,
      visaSupport: filters.visaSupport === true ? null : true,
    })
  }

  return (
    <div className="space-y-4">
      {/* Date Posted */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Date Posted
        </label>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All Time' },
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleDateChange(option.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.datePosted === option.value
                  ? 'bg-slate-100 text-slate-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Job Type
        </label>
        <div className="space-y-2">
          {jobTypes.map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.jobType.includes(type)}
                onChange={() => handleJobTypeToggle(type)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Remote */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.isRemote === true}
            onChange={handleRemoteToggle}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-semibold text-gray-700">Remote Only</span>
        </label>
      </div>

      {/* Visa Support */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.visaSupport === true}
            onChange={handleVisaToggle}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-semibold text-gray-700">Visa Support</span>
        </label>
      </div>
    </div>
  )
}
