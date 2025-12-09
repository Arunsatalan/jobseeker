"use client"

import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Clock, 
  Building2,
  DollarSign,
  Share2,
  ExternalLink,
  Calendar,
  Users,
  Award,
  CheckCircle,
  Globe,
  Heart,
  Bookmark,
  BookmarkCheck
} from 'lucide-react'
import { Job } from './JobCard'

interface JobDetailProps {
  job: Job | null
  onBookmark: (jobId: string) => void
  onApply: (jobId: string) => void
  onShare: (jobId: string) => void
}

export default function JobDetail({ job, onBookmark, onApply, onShare }: JobDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to top when job changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [job?.id])

  if (!job) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Select a job to view details</h3>
          <p className="text-gray-400">Choose from the list on the left to see job information</p>
        </div>
      </div>
    )
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
    <div ref={scrollRef} className="h-full bg-white overflow-y-auto">
      
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
            
            <div className="flex items-center gap-3 mb-3">
              {job.companyLogo ? (
                <img 
                  src={job.companyLogo} 
                  alt={job.company} 
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <Building2 className="h-8 w-8 text-gray-400" />
              )}
              <Button 
                variant="link" 
                className="text-lg font-semibold text-primary-600 hover:text-primary-700 p-0 h-auto"
                onClick={() => window.open(`/company/${job.company}`, '_blank')}
              >
                {job.company}
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              
              <Badge variant="outline">
                {job.jobType}
              </Badge>

              {job.salary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-600">{job.salary}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Posted {job.postedTime}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBookmark(job.id)}
              className={job.isBookmarked ? 'text-yellow-600 border-yellow-200' : ''}
            >
              {job.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(job.id)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="flex gap-3">
          <Button 
            className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-400 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            onClick={() => onApply(job.id)}
          >
            Apply Now
          </Button>
          <Button 
            variant="outline"
            className="text-gray-600 hover:text-primary-600"
          >
            Save for Later
          </Button>
        </div>

        {/* Tags */}
        {job.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {job.badges.map((badge, index) => (
              <Badge
                key={index}
                className={`text-xs border ${getBadgeColor(badge)}`}
                variant="outline"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">

        {/* Match Score */}
        {job.matchScore && (
          <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
                {job.matchScore}%
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Great Match!</h3>
                <p className="text-sm text-green-600">Your skills align well with this job</p>
              </div>
            </div>
          </Card>
        )}

        {/* Job Description */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary-500" />
            Job Description
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
            {job.description.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3">{paragraph}</p>
            ))}
          </div>
        </section>

        <Separator />

        {/* Requirements */}
        {job.requirements.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary-500" />
              Requirements & Qualifications
            </h2>
            <ul className="space-y-2">
              {job.requirements.map((requirement, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{requirement}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {job.requirements.length > 0 && <Separator />}

        {/* Benefits */}
        {job.benefits.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary-500" />
              Benefits & Perks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {job.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {job.benefits.length > 0 && <Separator />}

        {/* Company Info Preview */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary-500" />
            About {job.company}
          </h2>
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center gap-4 mb-3">
              {job.companyLogo ? (
                <img 
                  src={job.companyLogo} 
                  alt={job.company} 
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-500" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{job.company}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Technology Company</span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">
              Learn more about {job.company}'s mission, values, and culture.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              <Globe className="h-4 w-4 mr-2" />
              View Company Profile
            </Button>
          </Card>
        </section>

        <Separator />

        {/* Application Instructions */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Apply</h2>
          <Card className="p-4 border-primary-200 bg-primary-50">
            <p className="text-gray-700 mb-4">{job.applicationInstructions}</p>
            <Button 
              className="w-full bg-gradient-to-r from-primary-500 to-secondary-400 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
              onClick={() => onApply(job.id)}
            >
              Apply for this Position
            </Button>
          </Card>
        </section>

        {/* Bottom Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button 
            className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-400 text-white"
            onClick={() => onApply(job.id)}
          >
            Apply Now
          </Button>
          <Button 
            variant="outline"
            onClick={() => onBookmark(job.id)}
            className={job.isBookmarked ? 'text-yellow-600 border-yellow-200' : ''}
          >
            {job.isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={() => onShare(job.id)}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  )
}