"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import SearchBar from './SearchBar'
import FilterBar, { FilterState } from './FilterBar'
import JobCard, { Job } from './JobCard'
import JobDetail from './JobDetail'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

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
  createdAt: string
  updatedAt: string
}

// Convert API job to frontend Job interface
const convertApiJobToJob = (apiJob: ApiJob): Job => {
  return {
    id: apiJob._id,
    title: apiJob.title,
    company: apiJob.company,
    location: apiJob.location,
    employmentType: apiJob.employmentType,
    experience: apiJob.experience,
    salaryMin: apiJob.salaryMin,
    salaryMax: apiJob.salaryMax,
    salaryPeriod: apiJob.salaryPeriod,
    description: apiJob.description,
    requirements: apiJob.requirements || [],
    benefits: [],
    badges: [],
    isRemote: apiJob.remote || false,
    hasVisaSupport: false,
    isEntryLevel: apiJob.experience === 'entry',
    isNew: false,
    isBookmarked: false,
    applicationInstructions: 'Click Apply Now to submit your application.'
  }
}

export default function JobSearchInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
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
  })
  
  // Get initial search values from URL
  const initialJob = searchParams.get('job') || ''
  const initialLocation = searchParams.get('location') || ''
  const initialJobId = searchParams.get('jobId') || ''

  // Fetch all jobs from database
  const fetchAllJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get('/api/v1/jobs', {
        params: { page: 1, limit: 20 }
      })
      
      const jobs = Array.isArray(response.data) 
        ? response.data.map(convertApiJobToJob)
        : response.data.jobs?.map(convertApiJobToJob) || []
      
      setJobs(jobs)
      
      if (jobs.length > 0) {
        setSelectedJob(jobs[0])
      } else {
        setSelectedJob(null)
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      setError('Failed to load jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Search function
  const handleSearch = useCallback(async (jobQuery: string, locationQuery: string) => {
    setLoading(true)
    setError(null)
    
    try {
      // Update URL
      const params = new URLSearchParams()
      if (jobQuery) params.set('job', jobQuery)
      if (locationQuery) params.set('location', locationQuery)
      router.push(`?${params.toString()}`, { scroll: false })
      
      // Call search API
      const response = await axios.get('/api/v1/jobs/search', {
        params: {
          keyword: jobQuery,
          location: locationQuery,
          page: 1,
          limit: 20
        }
      })
      
      const jobs = Array.isArray(response.data) 
        ? response.data.map(convertApiJobToJob)
        : response.data.jobs?.map(convertApiJobToJob) || []
      
      setJobs(jobs)
      
      // Auto-select first job
      if (jobs.length > 0) {
        setSelectedJob(jobs[0])
        
        // Update URL with selected job
        const newParams = new URLSearchParams(params)
        newParams.set('jobId', jobs[0].id)
        router.push(`?${newParams.toString()}`, { scroll: false })
      } else {
        setSelectedJob(null)
      }
      
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [router])

  // Apply filters
  const applyFilters = useCallback((jobs: Job[], filters: FilterState): Job[] => {
    return jobs.filter(job => {
      // Job type filter - filter by employment type
      if (filters.jobType.length > 0 && !filters.jobType.includes(job.employmentType)) {
        return false
      }

      // Pay range filter
      if (job.salaryMax && (job.salaryMax < filters.payRange[0] || job.salaryMax > filters.payRange[1])) {
        return false
      }

      // Quick filters
      if (filters.isRemote && !job.isRemote) return false
      if (filters.hasVisaSupport && !job.hasVisaSupport) return false
      if (filters.isEntryLevel && !job.isEntryLevel) return false

      return true
    })
  }, [])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    const filteredJobs = applyFilters(jobs, newFilters)
    
    if (filteredJobs.length > 0) {
      setSelectedJob(filteredJobs[0])
    } else {
      setSelectedJob(null)
    }
  }, [jobs, applyFilters])

  // Job selection
  const handleJobSelect = useCallback((job: Job) => {
    setSelectedJob(job)
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    params.set('jobId', job.id)
    router.push(`?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Job actions
  const handleBookmark = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
    ))
    
    if (selectedJob?.id === jobId) {
      setSelectedJob(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null)
    }
  }, [selectedJob])

  const handleApply = useCallback((jobId: string) => {
    // Implement application logic
    console.log('Applying to job:', jobId)
    // Could open modal, navigate to application form, etc.
  }, [])

  const handleShare = useCallback((jobId: string) => {
    // Implement share logic
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      navigator.share?.({
        title: job.title,
        text: `Check out this job at ${job.company}`,
        url: window.location.href
      }) || navigator.clipboard.writeText(window.location.href)
    }
  }, [jobs])

  // Initial load
  useEffect(() => {
    if (initialJob || initialLocation) {
      handleSearch(initialJob, initialLocation)
    } else {
      // Load all jobs from database
      fetchAllJobs()
    }
  }, [initialJob, initialLocation, handleSearch, fetchAllJobs])

  // Select job from URL
  useEffect(() => {
    if (initialJobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === initialJobId)
      if (job) {
        setSelectedJob(job)
      }
    }
  }, [initialJobId, jobs])

  // Calculate active filters
  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'payRange') {
      return value[0] !== 40000 || value[1] !== 200000 ? count + 1 : count
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? count + 1 : count
    }
    if (typeof value === 'boolean') {
      return value ? count + 1 : count
    }
    return value !== 'any' && value !== '' ? count + 1 : count
  }, 0)

  const filteredJobs = applyFilters(jobs, filters)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <SearchBar
        onSearch={handleSearch}
        initialJob={initialJob}
        initialLocation={initialLocation}
      />
      
      {/* Filter Bar */}
      <FilterBar
        onFiltersChange={handleFiltersChange}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          
          {/* Left Panel - Job List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(initialJob, initialLocation)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto h-full">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Jobs</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <Button onClick={() => handleSearch(initialJob, initialLocation)}>
                    Try Again
                  </Button>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button variant="outline" onClick={() => setFilters({
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
                  })}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {filteredJobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJob?.id === job.id}
                      onClick={() => handleJobSelect(job)}
                      onBookmark={handleBookmark}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Job Detail */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hidden lg:block">
            <JobDetail
              job={selectedJob}
              onBookmark={handleBookmark}
              onApply={handleApply}
              onShare={handleShare}
            />
          </div>

        </div>

        {/* Mobile Job Detail Modal */}
        {selectedJob && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSelectedJob(null)}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedJob(null)}
                  className="float-right"
                >
                  Close
                </Button>
              </div>
              <div className="overflow-y-auto">
                <JobDetail
                  job={selectedJob}
                  onBookmark={handleBookmark}
                  onApply={handleApply}
                  onShare={handleShare}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}