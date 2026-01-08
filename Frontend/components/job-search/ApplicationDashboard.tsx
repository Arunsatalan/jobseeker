"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { CandidateApplicationPortal } from '@/components/jobseeker/CandidateApplicationPortal'
import { 
  BarChart3,
  X
} from 'lucide-react'

interface ApplicationDashboardProps {
  isOpen: boolean
  onClose: () => void
  applications: any[] // Legacy prop, not used in new implementation
}

const ApplicationDashboard: React.FC<ApplicationDashboardProps> = ({
  isOpen,
  onClose,
  applications
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6" style={{ color: '#02243b' }} />
              Application Portal
            </h2>
            <p className="text-gray-600">Track your job applications and communicate with employers</p>
          </div>
          <Button variant="outline" onClick={onClose} size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <CandidateApplicationPortal />
        </div>
      </div>
    </div>
  )
}

export default ApplicationDashboard
