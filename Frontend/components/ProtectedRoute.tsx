"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to home')
      router.replace('/')
      return
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
      console.log(`User role ${user?.role} does not match required role ${requiredRole}, redirecting to home`)
      router.replace('/')
      return
    }

    console.log('Authentication and authorization successful')
    setIsAuthorized(true)
  }, [isAuthenticated, user, isLoading, requiredRole, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // Will redirect
  }

  return <>{children}</>
}