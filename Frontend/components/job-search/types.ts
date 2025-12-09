export interface JobSearchProps {
  initialJob?: string
  initialLocation?: string
  onJobSelect?: (job: Job) => void
}

export interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  postedTime: string
  jobType: string
  salary?: string
  description: string
  requirements: string[]
  benefits: string[]
  badges: string[]
  isRemote: boolean
  hasVisaSupport: boolean
  isEntryLevel: boolean
  isNew: boolean
  matchScore?: number
  isBookmarked: boolean
  applicationInstructions?: string
}

export interface SearchSuggestion {
  id: string
  text: string
  type: 'job' | 'location' | 'company'
  count?: number
}

export interface FilterState {
  datePosted: 'any' | 'today' | '3days' | 'week' | 'month'
  payRange: [number, number]
  distance: 'any' | '5km' | '10km' | '25km' | '50km'
  jobType: string[]
  language: string[]
  company: string
  skills: string[]
  isRemote: boolean
  hasVisaSupport: boolean
  isEntryLevel: boolean
}

export interface ApiResponse<T> {
  data: T
  total: number
  page: number
  totalPages: number
  error?: string
}

export interface SearchFilters extends FilterState {
  query?: string
  location?: string
  page?: number
  limit?: number
  sortBy?: 'relevance' | 'date' | 'salary'
  sortOrder?: 'asc' | 'desc'
}

export interface BookmarkResponse {
  success: boolean
  isBookmarked: boolean
  error?: string
}