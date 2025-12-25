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

    const prompt = `Generate a personalized cover letter for ${userProfile.name} applying for ${job.title} at ${job.company}. 
    User skills: ${userProfile.skills.join(', ')}
    Job requirements: ${job.requirements.join(', ')}
    Keep it concise and professional.`

    // Simulated AI response - in real app, this would call an AI service
    const mockCoverLetter = `Dear ${job.company} Hiring Team,

I am excited to apply for the ${job.title} position. With my background in ${userProfile.skills.slice(0, 3).join(', ')}, I am confident I can contribute effectively to your team.

My experience includes ${userProfile.experience[0] || 'relevant industry experience'}, which aligns well with your requirements for ${job.requirements[0] || 'this role'}.

I am particularly drawn to ${job.company} because of your reputation for innovation and growth opportunities. I would welcome the chance to discuss how my skills can benefit your team.

Thank you for your consideration.

Best regards,
${userProfile.name}`

    setApplicationData(prev => ({
      ...prev,
      coverLetter: mockCoverLetter
    }))

    speak("Cover letter generated successfully")
  }

  // AI resume analysis and optimization
  const performAIAnalysis = async () => {
    if (!userProfile) return

    setIsAnalyzing(true)
    
    // Simulate AI analysis
    setTimeout(() => {
      const matchPercentage = Math.floor(Math.random() * 20) + 75 // 75-95%
      const analysis: AIAnalysis = {
        matchPercentage,
        strengths: [
          `Strong ${userProfile.skills[0] || 'technical'} skills`,
          'Relevant experience in the field',
          'Good cultural fit based on profile'
        ],
        improvements: [
          `Consider adding ${job.skills.find(s => !userProfile.skills.includes(s)) || 'Python'} to your skillset`,
          'Highlight leadership experience more prominently',
          'Add specific metrics to quantify achievements'
        ],
        optimizedResume: `Optimized resume content with keywords: ${job.skills.slice(0, 3).join(', ')}`,
        suggestedSkills: job.skills.filter(s => !userProfile.skills.includes(s)).slice(0, 3)
      }
      
      setAIAnalysis(analysis)
      setIsAnalyzing(false)
      
      speak(`Resume analysis complete. You have a ${matchPercentage}% match with this position.`)
    }, 2000)
  }

  // Optimize resume with AI suggestions
  const optimizeResume = () => {
    setResumeOptimized(true)
    setShowOptimizedResume(true)
    addAchievement('resume_optimizer')
    speak("Resume optimized with AI suggestions")
  }

  // Handle application submission
  const handleSubmit = async () => {
    if (!applicationData.privacyConsent) {
      setStatusMessage("Please accept the privacy policy to continue")
      return
    }

    setIsSubmitting(true)
    setApplicationStatus('submitting')
    setStatusMessage("Submitting your application...")

    // Animate progress
    const progressInterval = setInterval(() => {
      setSubmitProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      await onSubmit(applicationData)
      
      setSubmitProgress(100)
      setApplicationStatus('success')
      setStatusMessage("Application submitted successfully!")
      
      // Update gamification stats
      setApplicationCount(prev => prev + 1)
      addAchievement('first_application')
      if (applicationCount > 0 && applicationCount % 5 === 0) {
        addAchievement('application_streak')
      }

      speak("Application submitted successfully! You'll receive updates on your dashboard.")
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
        resetModal()
      }, 3000)

    } catch (error) {
      setApplicationStatus('error')
      setStatusMessage("Failed to submit application. Please try again.")
      speak("Application submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
      clearInterval(progressInterval)
    }
  }

  const addAchievement = (achievement: string) => {
    setAchievements(prev => {
      if (!prev.includes(achievement)) {
        return [...prev, achievement]
      }
      return prev
    })
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
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
          highContrast ? 'bg-black text-white border-2 border-yellow-400' : ''
        } ${fontSize === 'large' ? 'text-lg' : fontSize === 'small' ? 'text-sm' : 'text-base'}`}
        role="dialog"
        aria-labelledby="application-modal-title"
        aria-describedby="application-modal-description"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 id="application-modal-title" className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-600" />
              Smart Apply
            </h2>
            <p id="application-modal-description" className="text-gray-600">
              {job.title} at {job.company}
            </p>
          </div>

          {/* Accessibility Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              aria-label={isVoiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHighContrast(!highContrast)}
              aria-label="Toggle high contrast"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              aria-label="Close application modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index < currentStep ? 'bg-green-600 text-white' :
                  index === currentStep ? 'bg-amber-600 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  index === currentStep ? 'font-semibold text-gray-900' : 'text-gray-600'
                }`}>
                  {step}
                </span>
                {index < steps.length - 1 && (
                  <div className={`ml-4 w-12 h-0.5 ${
                    index < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 0: Profile Review & AI Analysis */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">AI Profile Analysis</h3>
                <p className="text-gray-600">Let's analyze how well your profile matches this position</p>
              </div>

              {isAnalyzing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing your profile with AI...</p>
                  </div>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-6">
                  {/* Match Percentage */}
                  <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        {aiAnalysis.matchPercentage}%
                      </div>
                      <p className="text-gray-700">Profile Match</p>
                      <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${aiAnalysis.matchPercentage}%` }}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Strengths and Improvements */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Your Strengths
                      </h4>
                      <ul className="space-y-2">
                        {aiAnalysis.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Star className="h-4 w-4 text-green-500 mt-0.5" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Suggested Improvements
                      </h4>
                      <ul className="space-y-2">
                        {aiAnalysis.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Target className="h-4 w-4 text-amber-500 mt-0.5" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  {/* Suggested Skills */}
                  {aiAnalysis.suggestedSkills.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Skills to Consider Adding
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {aiAnalysis.suggestedSkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              ) : null}

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(1)}
                  disabled={!aiAnalysis}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Continue to Resume Optimization
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Resume Optimization */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">AI Resume Optimization</h3>
                <p className="text-gray-600">Enhance your resume with AI-powered suggestions</p>
              </div>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Your Current Resume
                  </h4>
                  <Button
                    onClick={optimizeResume}
                    disabled={resumeOptimized}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {resumeOptimized ? 'Optimized!' : 'Optimize with AI'}
                  </Button>
                </div>

                {showOptimizedResume && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium mb-2">✨ AI Optimizations Applied:</p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Added relevant keywords for ATS systems</li>
                        <li>• Highlighted transferable skills</li>
                        <li>• Improved formatting for better readability</li>
                        <li>• Quantified achievements where possible</li>
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview Changes
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Download Optimized
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(2)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Continue to Application
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Application Preview */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Application Preview</h3>
                <p className="text-gray-600">Review and customize your application</p>
              </div>

              <div className="space-y-4">
                {/* Cover Letter */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    AI-Generated Cover Letter
                  </h4>
                  <Textarea
                    ref={firstInputRef}
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, coverLetter: e.target.value }))}
                    rows={8}
                    className="w-full"
                    placeholder="Your personalized cover letter will appear here..."
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {applicationData.coverLetter.length} characters
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={generateAICoverLetter}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                </Card>

                {/* Additional Information */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Additional Information (Optional)</h4>
                  <Textarea
                    value={applicationData.additionalInfo}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    rows={3}
                    placeholder="Add any additional information, portfolio links, or specific questions for the employer..."
                  />
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Choose Platform
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Platform Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Choose Application Method</h3>
                <p className="text-gray-600">Select how you'd like to submit your application</p>
              </div>

              <div className="grid gap-4">
                {/* Direct Application */}
                <Card 
                  className={`p-6 cursor-pointer border-2 transition-all ${
                    applicationData.platform === 'direct' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setApplicationData(prev => ({ ...prev, platform: 'direct' }))}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-full">
                      <Send className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Direct Application</h4>
                      <p className="text-sm text-gray-600">Submit directly through our secure platform</p>
                    </div>
                    <Badge className="ml-auto bg-green-100 text-green-800">Recommended</Badge>
                  </div>
                </Card>

                {/* LinkedIn Easy Apply */}
                <Card 
                  className={`p-6 cursor-pointer border-2 transition-all ${
                    applicationData.platform === 'linkedin' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setApplicationData(prev => ({ ...prev, platform: 'linkedin' }))}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Linkedin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">LinkedIn Easy Apply</h4>
                      <p className="text-sm text-gray-600">Apply using your LinkedIn profile</p>
                    </div>
                    <Badge variant="outline">Quick</Badge>
                  </div>
                </Card>

                {/* Email Application */}
                <Card 
                  className={`p-6 cursor-pointer border-2 transition-all ${
                    applicationData.platform === 'email' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setApplicationData(prev => ({ ...prev, platform: 'email' }))}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Email Application</h4>
                      <p className="text-sm text-gray-600">Send via email to the hiring manager</p>
                    </div>
                    <Badge variant="outline">Traditional</Badge>
                  </div>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(4)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Review & Submit
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Submit & Privacy */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Final Review</h3>
                <p className="text-gray-600">Review your application before submission</p>
              </div>

              {/* Application Summary */}
              <Card className="p-6">
                <h4 className="font-semibold mb-4">Application Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Position:</span>
                    <span>{job.title} at {job.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Platform:</span>
                    <span className="capitalize">{applicationData.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Match Score:</span>
                    <span className="text-green-600 font-semibold">{aiAnalysis?.matchPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Resume:</span>
                    <span>{resumeOptimized ? 'AI Optimized ✨' : 'Original'}</span>
                  </div>
                </div>
              </Card>

              {/* Privacy Controls */}
              <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Privacy & Data Usage
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applicationData.privacyConsent}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, privacyConsent: e.target.checked }))}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <span>I consent to the processing of my personal data for this job application</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto ml-1 text-blue-600"
                        onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
                      >
                        {showPrivacyDetails ? 'Hide' : 'View'} details
                      </Button>
                    </div>
                  </label>

                  {showPrivacyDetails && (
                    <div className="ml-6 p-3 bg-white rounded border text-xs text-gray-600">
                      <p className="mb-2">Your data will be used only for:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Processing this job application</li>
                        <li>Communicating about this position</li>
                        <li>Improving our AI matching algorithms (anonymized)</li>
                      </ul>
                      <p className="mt-2">Data is encrypted and never shared with third parties without consent.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Application Status */}
              {applicationStatus === 'submitting' && (
                <Card className="p-6 bg-amber-50 border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-600 border-t-transparent"></div>
                    <div className="flex-1">
                      <p className="font-medium text-amber-800">{statusMessage}</p>
                      <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${submitProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {applicationStatus === 'success' && (
                <Card className="p-6 bg-green-50 border-green-200">
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-green-800 mb-2">Application Submitted Successfully!</h4>
                    <p className="text-green-700 text-sm mb-4">{statusMessage}</p>
                    
                    {/* Achievement Notifications */}
                    {achievements.length > 0 && (
                      <div className="space-y-2">
                        {achievements.map(achievement => (
                          <Badge key={achievement} className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            <Award className="h-3 w-3 mr-1" />
                            {achievement === 'first_application' ? 'First Application!' : 
                             achievement === 'application_streak' ? 'Application Streak!' :
                             achievement === 'resume_optimizer' ? 'AI Optimizer!' : 'Achievement Unlocked!'}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {applicationStatus === 'error' && (
                <Card className="p-6 bg-red-50 border-red-200">
                  <div className="text-center">
                    <X className="h-12 w-12 text-red-600 mx-auto mb-3" />
                    <h4 className="font-semibold text-red-800 mb-2">Submission Failed</h4>
                    <p className="text-red-700 text-sm">{statusMessage}</p>
                  </div>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)} disabled={isSubmitting}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!applicationData.privacyConsent || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Gamification Stats */}
        {isAuthenticated && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  {applicationCount} applications
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-yellow-600" />
                  {achievements.length} achievements
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-gray-500" />
                <select 
                  value={currentLanguage} 
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  className="bg-transparent text-sm"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationModal