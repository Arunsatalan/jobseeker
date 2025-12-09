"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft } from 'lucide-react'
import AdvancedJobSearch from './AdvancedJobSearch'

/**
 * Mobile-Optimized Wrapper for AdvancedJobSearch
 * Handles:
 * - Responsive layout switching
 * - Mobile modal for job details
 * - Touch-friendly interactions
 * - Fullscreen drawer pattern
 */
export default function ResponsiveJobSearch() {
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)
  const [mobileSelectedJob, setMobileSelectedJob] = useState<any>(null)

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <AdvancedJobSearch />
      </div>

      {/* Mobile View - Simplified List */}
      <div className="lg:hidden">
        <div className="min-h-screen bg-gray-50">
          {/* Embed the main search interface (list view) */}
          <AdvancedJobSearch />

          {/* Mobile Detail Modal - Fullscreen Drawer */}
          {isMobileDetailOpen && (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <Button
                  onClick={() => setIsMobileDetailOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <span className="font-semibold text-gray-900 flex-1 text-center">
                  Job Details
                </span>
                <Button
                  onClick={() => setIsMobileDetailOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-6">
                {/* Job will be displayed here */}
                {mobileSelectedJob && (
                  <div className="space-y-6">
                    {/* Title & Company */}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {mobileSelectedJob.title}
                      </h1>
                      <p className="text-lg text-gray-600">{mobileSelectedJob.company}</p>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <span className="font-semibold">Location:</span> {mobileSelectedJob.location}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-semibold">Posted:</span> {mobileSelectedJob.postedTime}
                      </p>
                      <p className="text-green-600 font-semibold">
                        {mobileSelectedJob.salary}
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-2">
                        About This Role
                      </h2>
                      <p className="text-gray-700 whitespace-pre-line">
                        {mobileSelectedJob.fullDescription || mobileSelectedJob.description}
                      </p>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3">
                        Requirements
                      </h2>
                      <ul className="space-y-2">
                        {mobileSelectedJob.requirements?.map((req: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 font-bold">✓</span>
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-semibold">
                      Sign In to Apply
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
