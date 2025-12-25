"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Linkedin,
  Mail,
  Mic,
  MicOff,
  PlayCircle,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  X,
  Zap,
  Shield,
  Award,
  MessageSquare,
  Eye,
  EyeOff,
  Languages,
  Accessibility,
  Volume2,
  VolumeX
} from 'lucide-react'

interface Job {
  id: string
  title: string
  company: string
  location: string
  description: string
  requirements: string[]
  skills: string[]
  salary?: string
}

interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  summary: string
  skills: string[]
  experience: string[]
  education: string[]
  resume?: File
}

interface ApplicationModalProps {
  job: Job
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ApplicationData) => Promise<void>
  userProfile?: UserProfile
  isAuthenticated: boolean
}

interface ApplicationData {
  coverLetter: string
  resume: File | null
  additionalInfo: string
  platform: 'direct' | 'linkedin' | 'email'
  privacyConsent: boolean
}

interface AIAnalysis {
  matchPercentage: number
  strengths: string[]
  improvements: string[]
  optimizedResume: string
  suggestedSkills: string[]
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onSubmit,
  userProfile,
  isAuthenticated
}) => {
  // Core state
  const [currentStep, setCurrentStep] = useState(0)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    coverLetter: '',
    resume: null,
    additionalInfo: '',
    platform: 'direct',
    privacyConsent: false
  })

  // AI and optimization state
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeOptimized, setResumeOptimized] = useState(false)
  const [showOptimizedResume, setShowOptimizedResume] = useState(false)

  // Application progress state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState(0)
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  // Accessibility and UX state
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false)

  // Gamification state
  const [achievements, setAchievements] = useState<string[]>([])
  const [applicationCount, setApplicationCount] = useState(0)
  const [streakDays, setStreakDays] = useState(0)

  // Refs for accessibility
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    'Profile Review',
    'Resume Optimization',
    'Application Preview',
    'Platform Selection',
    'Submit & Track'
  ]

  // Initialize with user profile data
  useEffect(() => {
    if (isOpen && userProfile) {
      generateAICoverLetter()
      performAIAnalysis()

      // Focus management for accessibility
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, userProfile])

  // Voice synthesis for accessibility
  const speak = (text: string) => {
    if ('speechSynthesis' in window && isVoiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = currentLanguage
      speechSynthesis.speak(utterance)
    }
  }

  // AI-powered cover letter generation
  const generateAICoverLetter = async () => {
    if (!userProfile) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/v1/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job.id,
          userProfile: {
            name: userProfile.name,
            email: userProfile.email,
            skills: userProfile.skills,
            experience: userProfile.experience,
            education: userProfile.education,
            summary: userProfile.summary
          }
        })
      })

      const data = await response.json()
      if (data.success && data.data.coverLetter) {
        setApplicationData(prev => ({
          ...prev,
          coverLetter: data.data.coverLetter
        }))
        speak("Cover letter generated successfully")
      } else {
        throw new Error(data.message || 'Failed to generate cover letter')
      }
    } catch (error) {
      console.error('Cover letter generation error:', error)
      // Fallback
      const fallbackCoverLetter = `Dear ${job.company} Hiring Team,
      
      I am excited to apply for the ${job.title} position...`
      setApplicationData(prev => ({
        ...prev,
        coverLetter: fallbackCoverLetter
      }))
    }
  }

  // AI resume analysis and optimization
  const performAIAnalysis = async () => {
    setIsAnalyzing(true)
    setAIAnalysis(null)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/v1/ai/analyze-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job.id,
          userProfile: userProfile ? {
            name: userProfile.name,
            email: userProfile.email,
            skills: userProfile.skills,
            experience: userProfile.experience,
            education: userProfile.education,
            summary: userProfile.summary
          } : null
        })
      })

      const data = await response.json()
      if (data.success && data.data) {
        setAIAnalysis({
          matchPercentage: data.data.matchPercentage || 0,
          strengths: data.data.strengths || [],
          improvements: data.data.improvements || [],
          optimizedResume: data.data.detailedAnalysis || '',
          suggestedSkills: data.data.suggestedSkills || []
        })
        speak(`Resume analysis complete. You have a ${data.data.matchPercentage}% match.`)
      } else {
        throw new Error(data.message || 'Failed to analyze profile')
      }
    } catch (error: any) {
      console.error('AI analysis error:', error)
      setStatusMessage(`AI Error: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const optimizeResume = async () => {
    if (!userProfile) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/v1/ai/optimize-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobId: job.id,
          userProfile: {
            name: userProfile.name,
            email: userProfile.email,
            skills: userProfile.skills,
            experience: userProfile.experience,
            education: userProfile.education,
            summary: userProfile.summary
          }
        })
      })
      const data = await response.json()
      if (data.success) {
        setResumeOptimized(true)
        setShowOptimizedResume(true)
        addAchievement('resume_optimizer')
        speak("Resume optimized with AI suggestions")
      }
    } catch (error) {
      console.error('Resume optimization error:', error)
    }
  }

  const handleSubmit = async () => {
    if (!applicationData.privacyConsent) {
      setStatusMessage("Please accept the privacy policy to continue")
      return
    }

    setIsSubmitting(true)
    setApplicationStatus('submitting')
    setStatusMessage("Submitting your application...")

    const progressInterval = setInterval(() => {
      setSubmitProgress(prev => (prev >= 90 ? 90 : prev + 10))
    }, 200)

    try {
      await onSubmit(applicationData)
      setSubmitProgress(100)
      setApplicationStatus('success')
      setStatusMessage("Application submitted successfully!")
      setApplicationCount(prev => prev + 1)
      addAchievement('first_application')
      speak("Application submitted successfully!")
      setTimeout(() => {
        onClose()
        resetModal()
      }, 3000)
    } catch (error) {
      setApplicationStatus('error')
      setStatusMessage("Failed to submit application.")
    } finally {
      setIsSubmitting(false)
      clearInterval(progressInterval)
    }
  }

  const addAchievement = (achievement: string) => {
    setAchievements(prev => (prev.includes(achievement) ? prev : [...prev, achievement]))
  }

  const resetModal = () => {
    setCurrentStep(0)
    setApplicationData({
      coverLetter: '',
      resume: null,
      additionalInfo: '',
      platform: 'direct',
      privacyConsent: false
    })
    setApplicationStatus('idle')
    setSubmitProgress(0)
    setStatusMessage('')
    setAIAnalysis(null)
    setResumeOptimized(false)
    setShowOptimizedResume(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${highContrast ? 'bg-black text-white border-2 border-yellow-400' : ''
          } ${fontSize === 'large' ? 'text-lg' : fontSize === 'small' ? 'text-sm' : 'text-base'}`}
        role="dialog"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-600" />
              Smart Apply AI
            </h2>
            <p className="text-gray-600">
              {job.title} at {job.company}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHighContrast(!highContrast)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${index < currentStep ? 'bg-green-600 text-white' :
                  index === currentStep ? 'bg-amber-600 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                  {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm hidden md:inline ${index === currentStep ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`mx-4 w-8 md:w-12 h-0.5 ${index < currentStep ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">AI Profile Analysis</h3>
                <p className="text-gray-600">Real-time match analysis against job requirements</p>
              </div>

              {isAnalyzing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">AI is analyzing your profile...</p>
                  </div>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100">
                    <div className="text-center">
                      <div className="text-5xl font-extrabold text-amber-600 mb-2">
                        {aiAnalysis.matchPercentage}%
                      </div>
                      <p className="text-amber-800 font-semibold">Match Score</p>
                      <div className="w-full bg-amber-200 rounded-full h-4 mt-4 overflow-hidden">
                        <div
                          className="bg-amber-600 h-full transition-all duration-1000 ease-out"
                          style={{ width: `${aiAnalysis.matchPercentage}%` }}
                        />
                      </div>
                    </div>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-5 border-green-100 bg-green-50/30">
                      <h4 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Key Strengths
                      </h4>
                      <ul className="space-y-3">
                        {aiAnalysis.strengths.map((strength, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Star className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-5 border-blue-100 bg-blue-50/30">
                      <h4 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        AI Recommendations
                      </h4>
                      <ul className="space-y-3">
                        {aiAnalysis.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <TrendingUp className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  {aiAnalysis.suggestedSkills.length > 0 && (
                    <Card className="p-5 border-purple-100 bg-purple-50/30">
                      <h4 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Suggested Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.suggestedSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-red-500">{statusMessage}</p>
                  <Button onClick={performAIAnalysis} className="mt-4">Retry Analysis</Button>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={!aiAnalysis}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-amber-200 transition-all"
                >
                  Continue to Resume Optimization
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Resume Optimization</h3>
                <p className="text-gray-600">Tailor your resume for this specific role</p>
              </div>

              <Card className="p-8 border-2 border-dashed border-gray-200">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-4 rounded-full mb-4">
                    <FileText className="h-10 w-10 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-bold mb-2">ATS Optimization</h4>
                  <p className="text-gray-600 mb-6 max-w-md">Our AI will automatically adjust keywords and formatting to ensure your resume passes ATS filters and highlights your most relevant experience.</p>

                  <Button
                    onClick={optimizeResume}
                    disabled={resumeOptimized || isAnalyzing}
                    className={`py-6 px-10 rounded-xl font-bold text-lg shadow-xl transition-all ${resumeOptimized
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700 animate-pulse'
                      }`}
                  >
                    {resumeOptimized ? (
                      <span className="flex items-center gap-2"><CheckCircle2 className="h-6 w-6" /> Resume Optimized!</span>
                    ) : (
                      <span className="flex items-center gap-2"><Sparkles className="h-6 w-6" /> Optimize with Smart AI</span>
                    )}
                  </Button>
                </div>

                {showOptimizedResume && (
                  <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-200 animate-in slide-in-from-bottom-4 duration-500">
                    <h5 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5" /> Optimized Successfully
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {job.skills && job.skills.length > 0 && (
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-green-100">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Target Keywords</p>
                          <p className="text-sm text-gray-700">Aligned with {job.skills.slice(0, 3).join(', ')}</p>
                        </div>
                      )}
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-green-100">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Optimization Status</p>
                        <p className="text-sm text-gray-700">Resume tailored for role and ATS requirements</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(0)} className="py-6 px-8 rounded-xl font-bold">Back</Button>
                <Button onClick={() => setCurrentStep(2)} className="bg-amber-600 hover:bg-amber-700 py-6 px-8 rounded-xl font-bold">Preview Application</Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Application Preview</h3>
                <p className="text-gray-600">Review your AI-generated cover letter</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700">AI Personalised Cover Letter</label>
                <Textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                  className="min-h-[300px] rounded-xl border-2 border-amber-100 focus:border-amber-400 p-6 leading-relaxed"
                  placeholder="Your cover letter will appear here..."
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={generateAICoverLetter} size="sm" className="text-amber-600 hover:text-amber-700 font-bold">
                    <RotateCcw className="h-4 w-4 mr-2" /> Regenerate Cover Letter
                  </Button>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)} className="py-6 px-8 rounded-xl font-bold">Back</Button>
                <Button onClick={() => setCurrentStep(3)} className="bg-amber-600 hover:bg-amber-700 py-6 px-8 rounded-xl font-bold">Select Platforms</Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Select Application Platform</h3>
                <p className="text-gray-600">Where would you like to submit your application?</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { id: 'direct', name: 'Direct Portal', icon: Globe, color: 'blue' },
                  { id: 'linkedin', name: 'LinkedIn Apply', icon: Linkedin, color: 'cyan' },
                  { id: 'email', name: 'Email Send', icon: Mail, color: 'red' }
                ].map((p) => (
                  <Card
                    key={p.id}
                    className={`p-6 cursor-pointer border-2 transition-all hover:scale-105 ${applicationData.platform === p.id
                      ? `border-${p.color}-500 bg-${p.color}-50`
                      : 'border-gray-100'
                      }`}
                    onClick={() => setApplicationData({ ...applicationData, platform: p.id as any })}
                  >
                    <div className="flex flex-col items-center text-center">
                      <p.icon className={`h-10 w-10 mb-3 text-${p.color}-600`} />
                      <h4 className="font-bold">{p.name}</h4>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="py-6 px-8 rounded-xl font-bold">Back</Button>
                <Button onClick={() => setCurrentStep(4)} className="bg-amber-600 hover:bg-amber-700 py-6 px-8 rounded-xl font-bold">Final Submission</Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Final Step: Submit & Track</h3>
                <p className="text-gray-600">You're ready to launch your application!</p>
              </div>

              <Card className="p-8 bg-blue-50 border-blue-100 rounded-3xl">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Privacy & Terms</h4>
                    <p className="text-sm text-gray-600">By clicking submit, your data will be securely processed and shared only with the employer.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    checked={applicationData.privacyConsent}
                    onChange={(e) => setApplicationData({ ...applicationData, privacyConsent: e.target.checked })}
                  />
                  <label htmlFor="privacy" className="text-sm font-medium text-gray-700 font-bold">I agree to the terms of service and privacy policy</label>
                </div>

                {applicationStatus === 'submitting' ? (
                  <div className="space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full transition-all duration-300"
                        style={{ width: `${submitProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-center font-bold text-amber-700 animate-pulse">{statusMessage}</p>
                  </div>
                ) : applicationStatus === 'success' ? (
                  <Card className="p-8 text-center bg-green-50 border-green-200 shadow-xl scale-105 transition-transform">
                    <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-green-800 mb-2">Success!</h4>
                    <p className="text-green-700 font-medium">{statusMessage}</p>
                  </Card>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="w-full py-8 text-xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-2xl shadow-xl hover:shadow-orange-200 hover:-translate-y-1 transition-all"
                    disabled={isSubmitting}
                  >
                    <Send className="h-6 w-6 mr-3" />
                    SUBMIT APPLICATION NOW
                  </Button>
                )}
                {applicationStatus === 'error' && (
                  <p className="text-red-600 text-center font-bold mt-4 animate-bounce">⚠️ {statusMessage}</p>
                )}
              </Card>

              <div className="flex justify-start">
                <Button variant="outline" onClick={() => setCurrentStep(3)} className="py-6 px-8 rounded-xl font-bold">Back</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              {applicationCount} applications
            </div>
            <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              {achievements.length} achievements
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-gray-400" />
            <select
              className="text-xs font-bold text-gray-600 bg-transparent border-none focus:ring-0 uppercase"
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationModal