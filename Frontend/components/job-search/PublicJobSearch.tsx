"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Clock, Building2, DollarSign, X, Eye, LogIn } from 'lucide-react'
import { MOCK_SOFTWARE_ENGINEER_JOBS } from './mockSoftwareEngineerJobs'

interface PublicJobSearchProps {
  isLoggedIn?: boolean
}

export default function PublicJobSearch({ isLoggedIn = false }: PublicJobSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [jobQuery, setJobQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [totalMatchedCount, setTotalMatchedCount] = useState(MOCK_SOFTWARE_ENGINEER_JOBS.length) // Total matched count
  const [displayedJobs, setDisplayedJobs] = useState(MOCK_SOFTWARE_ENGINEER_JOBS.slice(0, 10)) // Show only 10 jobs
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Get job from URL parameter
  const jobParam = searchParams.get('job')
  const selectedJob = selectedJobId ? MOCK_SOFTWARE_ENGINEER_JOBS.find(job => job.id === selectedJobId) : null
  const isModalOpen = !!selectedJobId

  // Initialize search from URL params
  useEffect(() => {
    const job = searchParams.get('job') || ''
    const location = searchParams.get('location') || ''
    setJobQuery(job)
    setLocationQuery(location)
    
    if (job || location) {
      handleSearch(job, location, false)
    }
  }, [])

  // Handle job modal from URL
  useEffect(() => {
    if (jobParam) {
      // Find job by title slug
      const job = MOCK_SOFTWARE_ENGINEER_JOBS.find(j => 
        j.title.toLowerCase().replace(/\s+/g, '+') === jobParam.toLowerCase()
      )
      if (job) {
        setSelectedJobId(job.id)
      }
    } else {
      setSelectedJobId(null)
    }
  }, [jobParam])

  const handleSearch = useCallback(async (jobQ: string, locationQ: string, updateUrl = true) => {
    setLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Filter jobs based on search criteria
      let results = MOCK_SOFTWARE_ENGINEER_JOBS
      
      if (jobQ.trim()) {
        results = results.filter(job => 
          job.title.toLowerCase().includes(jobQ.toLowerCase()) ||
          job.company.toLowerCase().includes(jobQ.toLowerCase()) ||
          job.description.toLowerCase().includes(jobQ.toLowerCase())
        )
      }
      
      if (locationQ.trim()) {
        results = results.filter(job => 
          job.location.toLowerCase().includes(locationQ.toLowerCase())
        )
      }
      
      // Count total matched jobs
      setTotalMatchedCount(results.length)
      
      // Show first 10 jobs from matched results
      setDisplayedJobs(results.slice(0, 10))
      
      // Update URL with search params
      if (updateUrl) {
        const params = new URLSearchParams()
        if (jobQ.trim()) params.set('job', jobQ.trim())
        if (locationQ.trim()) params.set('location', locationQ.trim())
        
        const queryString = params.toString()
        router.push(queryString ? `?${queryString}` : '/', { scroll: false })
      }
      
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleJobClick = (job: any) => {
    const jobSlug = job.title.toLowerCase().replace(/\s+/g, '+')
    const params = new URLSearchParams(searchParams.toString())
    params.set('job', jobSlug)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const handleCloseModal = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('job')
    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : '/', { scroll: false })
  }

  const handleViewMoreJobs = () => {
    if (!isLoggedIn) {
      router.push('/login')
    } else {
      // Handle logged in user - show full results
      setDisplayedJobs(MOCK_SOFTWARE_ENGINEER_JOBS)
    }
  }

  const handleClearResults = () => {
    setJobQuery('')
    setLocationQuery('')
    setTotalMatchedCount(MOCK_SOFTWARE_ENGINEER_JOBS.length)
    setDisplayedJobs(MOCK_SOFTWARE_ENGINEER_JOBS.slice(0, 10))
    router.push('/', { scroll: false })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(jobQuery, locationQuery)
    }
  }

  // Handle ESC key for modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal()
      }
    }
    
    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isModalOpen])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Find Your Dream Job in Canada
            </h1>
            
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Job title, keyword, or company"
                      value={jobQuery}
                      onChange={(e) => setJobQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12 text-lg border-gray-300"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Toronto, Vancouver, Montreal..."
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12 text-lg border-gray-300"
                    />
                  </div>
                  <Button
                    onClick={() => handleSearch(jobQuery, locationQuery)}
                    disabled={loading}
                    className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      'Search Jobs'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Job Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Results Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                {displayedJobs.length} Jobs Found
              </h2>
              {(jobQuery || locationQuery) && (
                <Button
                  variant="link"
                  onClick={handleClearResults}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  Clear Results
                </Button>
              )}
            </div>
            {!isLoggedIn && (
              <p className="text-gray-600 text-sm">
                Showing {displayedJobs.length} of {totalMatchedCount} jobs — Sign in to view all results
              </p>
            )}
            {!isLoggedIn && (
              <p className="text-gray-500 text-xs mt-1">
                You're seeing a preview of jobs. Create an account to unlock the full list.
              </p>
            )}
          </div>

          {/* Job Cards */}
          <div className="space-y-4">
            {displayedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h3>
                      </div>
                      <div className="flex items-center text-gray-600 mb-2">
                        <Building2 className="h-4 w-4 mr-2" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="mr-4">{job.location}</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="mr-4">{job.postedTime}</span>
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{job.salary}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {job.jobType}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {job.description.length > 300 
                      ? `${job.description.substring(0, 300)}...`
                      : job.description
                    }
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      {job.badges.map((badge) => (
                        <Badge key={badge} variant="secondary" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      onClick={() => router.push('/login')}
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Jobs Button */}
          {totalMatchedCount > 10 && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleViewMoreJobs}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
              >
                {!isLoggedIn ? (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    View All Matching Jobs
                  </>
                ) : (
                  'View All Matching Jobs'
                )}
              </Button>
            </div>
          )}

          {/* No Results */}
          {displayedJobs.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      {isModalOpen && selectedJob && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseModal}
          />
          
          {/* Modal - Desktop: Centered, Mobile: Full-screen drawer */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Desktop Modal */}
            <div className="hidden md:flex items-center justify-center min-h-full p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                    <p className="text-lg text-gray-600">{selectedJob.company}</p>
                  </div>
                  <Button
                    onClick={handleCloseModal}
                    variant="ghost"
                    size="sm"
                    className="rounded-full w-8 h-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  
                  {/* Job Info */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>{selectedJob.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-5 w-5 mr-2" />
                        <span>Posted {selectedJob.postedTime}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-5 w-5 mr-2" />
                        <span>{selectedJob.salary}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{selectedJob.jobType}</Badge>
                        {selectedJob.badges.map((badge) => (
                          <Badge key={badge} variant="secondary">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {selectedJob.fullDescription}
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Button - Disabled for public users */}
                  <div className="border-t border-gray-200 pt-6">
                    {!isLoggedIn ? (
                      <div className="text-center">
                        <Button
                          onClick={() => router.push('/login')}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                        >
                          <LogIn className="h-5 w-5 mr-2" />
                          Sign In to Apply
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          Create an account to apply for this position
                        </p>
                      </div>
                    ) : (
                      <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Drawer */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <Button
                  onClick={handleCloseModal}
                  variant="outline"
                  size="sm"
                  className="float-right"
                >
                  Close
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="p-4">
                  
                  {/* Job Header */}
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedJob.title}</h2>
                    <p className="text-gray-600">{selectedJob.company}</p>
                  </div>

                  {/* Job Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Posted {selectedJob.postedTime}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>{selectedJob.salary}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{selectedJob.jobType}</Badge>
                      {selectedJob.badges.map((badge) => (
                        <Badge key={badge} variant="secondary">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Job Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="whitespace-pre-line text-gray-700 leading-relaxed text-sm">
                        {selectedJob.fullDescription}
                      </p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2 text-sm">•</span>
                          <span className="text-gray-700 text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Button - Disabled for public users */}
                  <div className="border-t border-gray-200 pt-6">
                    {!isLoggedIn ? (
                      <div className="text-center">
                        <Button
                          onClick={() => router.push('/login')}
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 w-full"
                        >
                          <LogIn className="h-5 w-5 mr-2" />
                          Sign In to Apply
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          Create an account to apply for this position
                        </p>
                      </div>
                    ) : (
                      <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}