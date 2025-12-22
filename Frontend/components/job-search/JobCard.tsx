"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  MapPin, 
  Clock, 
  Bookmark, 
  BookmarkCheck,
  Building2,
  DollarSign,
  Zap,
  Eye
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  employmentType: string
  experience: string
  salaryMin?: number
  salaryMax?: number
  salaryPeriod?: string
  postedTime?: string
  expiryDate?: string
  description: string
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
  matchScore?: number
  isBookmarked: boolean
  applicationInstructions: string
}

interface JobCardProps {
  job: Job
  isSelected: boolean
  onClick: () => void
  onBookmark: (jobId: string) => void
  onViewDetails?: () => void
}

export default function JobCard({ job, isSelected, onClick, onBookmark, onViewDetails }: JobCardProps) {
  const router = useRouter()

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBookmark(job.id)
  }

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onViewDetails) {
      onViewDetails()
    } else {
      router.push('/login')
    }
  }

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'remote':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'visa support':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'entry-level':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'hot':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <Card
      className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${
        isSelected 
          ? 'border-primary-500 bg-primary-50 shadow-lg' 
          : 'border-transparent hover:border-primary-200'
      }`}
      onClick={onClick}
    >
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {job.isNew && (
                <Badge className="bg-green-500 text-white text-xs font-bold">
                  NEW
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
              {job.title}
            </h3>
            
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Building2 className="h-5 w-5" />
              <span className="font-medium hover:text-primary-600 transition-colors">
                {job.company}
              </span>
            </div>
          </div>

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkClick}
            className={`ml-2 p-2 ${
              job.isBookmarked 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            {job.isBookmarked ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Job Details */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{job.location}</span>
          </div>
          
          <Badge variant="outline" className="text-xs capitalize">
            {job.employmentType}
          </Badge>
          
          <Badge variant="outline" className="text-xs capitalize">
            {job.experience} Level
          </Badge>

          {job.salaryMin && job.salaryMax && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-600">
                ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                {job.salaryPeriod && `/${job.salaryPeriod}`}
              </span>
            </div>
          )}
        </div>

        {/* Job Description Preview */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Badges */}
        {job.badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.badges.slice(0, 3).map((badge, index) => (
              <Badge
                key={index}
                className={`text-xs border ${getBadgeColor(badge)}`}
                variant="outline"
              >
                {badge}
              </Badge>
            ))}
            {job.badges.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{job.badges.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Skills Preview */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-xs font-medium text-gray-500 mr-2">Skills:</span>
            {job.skills.slice(0, 3).map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-600 border-blue-200"
              >
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{job.skills.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Requirements Preview */}
        {job.requirements.length > 0 && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Required: </span>
            <span>
              {job.requirements.slice(0, 2).join(', ')}
              {job.requirements.length > 2 && '...'}
            </span>
          </div>
        )}

        {/* Action Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex gap-2 text-xs">
            {job.isRemote && (
              <span className="text-green-600 font-medium">Remote OK</span>
            )}
            {job.hasVisaSupport && (
              <span className="text-blue-600 font-medium">Visa Support</span>
            )}
            {job.isEntryLevel && (
              <span className="text-purple-600 font-medium">Entry Level</span>
            )}
          </div>
          
          <Button
            onClick={handleViewDetails}
            variant="outline"
            size="sm"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>

      </div>
    </Card>
  )
}