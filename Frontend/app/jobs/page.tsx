"use client"

import AdvancedJobSearch from '@/components/job-search/AdvancedJobSearch'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function JobsPage() {
  return (
    <ProtectedRoute requiredRole="jobseeker">
      <AdvancedJobSearch />
    </ProtectedRoute>
  )
}