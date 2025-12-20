"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return // Wait for auth check to complete

    if (isAuthenticated && user) {
      // Redirect based on user role
      const userRole = user.role
      if (userRole === 'jobseeker') {
        router.push('/jobs')
      } else if (userRole === 'employer') {
        router.push('/employer-dashboard')
      } else if (userRole === 'admin') {
        router.push('/admin/overview')
      } else {
        router.push('/jobs') // Default fallback
      }
    }
    // If not authenticated, stay on the current page (home page with sign in options)
  }, [isAuthenticated, user, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // If not authenticated, return null to show the home page content
  if (!isAuthenticated) {
    return null
  }

  // If authenticated, show a brief redirecting message
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}