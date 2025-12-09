"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from './SearchBar'
import FilterBar, { FilterState } from './FilterBar'
import JobCard, { Job } from './JobCard'
import JobDetail from './JobDetail'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

// Mock data - replace with real API calls
const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Shopify',
    companyLogo: '/logos/shopify.png',
    location: 'Toronto, ON',
    postedTime: '2 days ago',
    jobType: 'Full-time',
    salary: '$120,000 - $160,000',
    description: `We are looking for a Senior Software Engineer to join our dynamic team. You'll work on cutting-edge projects using modern technologies including React, Node.js, and GraphQL.

Key responsibilities include:
- Developing scalable web applications
- Mentoring junior developers
- Participating in technical architecture decisions
- Collaborating with cross-functional teams

This is an excellent opportunity for someone who wants to make a significant impact in a fast-growing company.`,
    requirements: [
      '5+ years of software development experience',
      'Strong proficiency in JavaScript and TypeScript',
      'Experience with React and Node.js',
      'Knowledge of database systems (PostgreSQL, MongoDB)',
      'Experience with cloud platforms (AWS, GCP)',
      'Strong problem-solving skills',
      'Excellent communication skills'
    ],
    benefits: [
      'Comprehensive health insurance',
      'Flexible work arrangements',
      'Professional development budget',
      'Stock options',
      'Unlimited PTO',
      'Modern office workspace'
    ],
    badges: ['Remote', 'Visa Support', 'Hot'],
    isRemote: true,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: false,
    matchScore: 92,
    isBookmarked: false,
    applicationInstructions: 'Click Apply Now to submit your application through our careers portal. Please include your resume and a brief cover letter explaining your interest in this role.'
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'RBC',
    location: 'Vancouver, BC',
    postedTime: '1 day ago',
    jobType: 'Full-time',
    salary: '$100,000 - $130,000',
    description: `Join our product team as a Product Manager where you'll drive the development of innovative financial products. You'll work closely with engineering, design, and business stakeholders to deliver exceptional customer experiences.

In this role, you will:
- Define product strategy and roadmap
- Conduct user research and market analysis
- Collaborate with engineering teams
- Monitor product performance and metrics

We're looking for someone passionate about fintech and customer-centric product development.`,
    requirements: [
      '3+ years of product management experience',
      'Experience in financial services or fintech',
      'Strong analytical and data-driven mindset',
      'Excellent stakeholder management skills',
      'Bachelor\'s degree in Business, Technology, or related field',
      'Knowledge of agile development methodologies'
    ],
    benefits: [
      'Competitive salary and bonuses',
      'Health and dental coverage',
      'Retirement savings plan',
      'Professional development opportunities',
      'Flexible hybrid work model'
    ],
    badges: ['Hybrid', 'Visa Support'],
    isRemote: false,
    hasVisaSupport: true,
    isEntryLevel: false,
    isNew: true,
    isBookmarked: true,
    applicationInstructions: 'Apply directly through our website. We review applications on a rolling basis and will contact qualified candidates within 2 weeks.'
  },
  {
    id: '3',
    title: 'Junior UX Designer',
    company: 'Wealthsimple',
    location: 'Montreal, QC',
    postedTime: '3 days ago',
    jobType: 'Full-time',
    salary: '$65,000 - $85,000',
    description: `We're seeking a talented Junior UX Designer to join our design team. This is a perfect opportunity for a recent graduate or someone with 1-2 years of experience to grow their career in fintech design.

You'll be responsible for:
- Creating user-centered designs for web and mobile applications
- Conducting user research and usability testing
- Collaborating with product managers and engineers
- Contributing to our design system

This role offers mentorship from senior designers and exposure to complex design challenges in the financial technology space.`,
    requirements: [
      '1-2 years of UX design experience',
      'Portfolio demonstrating design process',
      'Proficiency in Figma and design tools',
      'Understanding of user research methods',
      'Knowledge of design systems',
      'Strong communication skills in English and French'
    ],
    benefits: [
      'Mentorship program',
      'Learning and development budget',
      'Health insurance',
      'Flexible work hours',
      'Modern design tools and equipment'
    ],
    badges: ['Entry-Level', 'Bilingual', 'Remote'],
    isRemote: true,
    hasVisaSupport: false,
    isEntryLevel: true,
    isNew: false,
    matchScore: 78,
    isBookmarked: false,
    applicationInstructions: 'Please submit your resume along with a link to your portfolio showcasing your best UX design work. Include a brief description of your design process.'
  }
]

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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Filter mock data based on search
      let filteredJobs = MOCK_JOBS
      
      if (jobQuery) {
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(jobQuery.toLowerCase())
        )
      }
      
      if (locationQuery) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(locationQuery.toLowerCase())
        )
      }
      
      setJobs(filteredJobs)
      
      // Auto-select first job
      if (filteredJobs.length > 0) {
        setSelectedJob(filteredJobs[0])
        
        // Update URL with selected job
        const newParams = new URLSearchParams(params)
        newParams.set('jobId', filteredJobs[0].id)
        router.push(`?${newParams.toString()}`, { scroll: false })
      } else {
        setSelectedJob(null)
      }
      
    } catch (err) {
      setError('Failed to search jobs. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [router])

  // Apply filters
  const applyFilters = useCallback((jobs: Job[], filters: FilterState): Job[] => {
    return jobs.filter(job => {
      // Date filter
      if (filters.datePosted !== 'any') {
        const postedDays = parseInt(job.postedTime.split(' ')[0])
        switch (filters.datePosted) {
          case 'today':
            if (postedDays > 0) return false
            break
          case '3days':
            if (postedDays > 3) return false
            break
          case 'week':
            if (postedDays > 7) return false
            break
          case 'month':
            if (postedDays > 30) return false
            break
        }
      }

      // Job type filter
      if (filters.jobType.length > 0 && !filters.jobType.includes(job.jobType)) {
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
      // Load default jobs
      setJobs(MOCK_JOBS)
      if (MOCK_JOBS.length > 0) {
        setSelectedJob(MOCK_JOBS[0])
      }
    }
  }, [initialJob, initialLocation, handleSearch])

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