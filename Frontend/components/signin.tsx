"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Chrome,
  Linkedin,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface SignInProps {
  onClose?: () => void
  onSwitchToSignUp?: () => void
}

export default function SignIn({ onClose, onSwitchToSignUp }: SignInProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Store token and user
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        
        // Navigate based on role
        const userRole = data.data.user.role
        if (userRole === 'jobseeker') {
          router.push('/jobs')
        } else if (userRole === 'employer') {
          router.push('/employer-dashboard')
        } else if (userRole === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        // Handle error - you might want to show an error message
        console.error('Login failed:', data.message)
        alert(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: string) => {
    // Handle social login
    console.log(`Login with ${provider}`)
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="relative w-full max-w-md mx-4 rounded-3xl border-0 bg-white/95 backdrop-blur-2xl shadow-2xl p-8 animate-fade-in-up">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-r from-primary-500 to-secondary-400 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your CanadaJobs account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl border-2 border-gray-200 focus:border-primary-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl border-2 border-gray-200 focus:border-primary-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-linear-to-r from-primary-500 to-secondary-400 text-white font-semibold shadow-lg shadow-primary-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("linkedin")}
              className="h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Linkedin className="h-5 w-5 mr-2" />
              LinkedIn
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignUp}
              className="text-primary-500 hover:text-primary-600 font-semibold"
            >
              Sign up
            </button>
          </p>
        </div>
      </Card>
    </div>
  )
}