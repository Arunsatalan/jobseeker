"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: string
  profileCompleted?: boolean
  name?: string
  profilePic?: string
  accountType?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch {
      return true
    }
  }

  // Validate token with backend
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (!storedToken || !storedUser) {
        setIsLoading(false)
        return false
      }

      // Check if token is expired
      if (isTokenExpired(storedToken)) {
        logout()
        setIsLoading(false)
        return false
      }

      // Validate token with backend
      const isValid = await validateToken(storedToken)
      if (!isValid) {
        logout()
        setIsLoading(false)
        return false
      }

      // Token is valid, set user state
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setToken(storedToken)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
      setIsLoading(false)
      return false
    }
  }

  // Login function
  const login = (newToken: string, userData: User) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))

    // Set session cookie for better persistence
    document.cookie = `auth_token=${newToken}; path=/; max-age=86400; samesite=strict`
  }

  // Logout function
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberedEmail')

    // Clear session cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    router.push('/')
  }

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Auto-refresh token periodically (every 50 minutes for 1-hour tokens)
  useEffect(() => {
    if (!token) return

    const refreshInterval = setInterval(async () => {
      const isValid = await validateToken(token)
      if (!isValid) {
        logout()
      }
    }, 50 * 60 * 1000) // 50 minutes

    return () => clearInterval(refreshInterval)
  }, [token])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}