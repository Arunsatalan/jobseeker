"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')

        if (!token || !user) {
          console.log('No token or user found, redirecting to home')
          router.replace('/')
          return
        }

        let userData
        try {
          userData = JSON.parse(user)
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/')
          return
        }

        // Check if token is expired (basic check)
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]))
          const currentTime = Date.now() / 1000

          if (tokenPayload.exp < currentTime) {
            console.log('Token expired, redirecting to home')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.replace('/')
            return
          }
        } catch (tokenError) {
          console.error('Failed to parse token:', tokenError)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.replace('/')
          return
        }

        // Check role if required
        if (requiredRole && userData.role !== requiredRole) {
          console.log(`User role ${userData.role} does not match required role ${requiredRole}, redirecting to home`)
          router.replace('/')
          return
        }

        console.log('Authentication successful')
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.replace('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return <>{children}</>
}