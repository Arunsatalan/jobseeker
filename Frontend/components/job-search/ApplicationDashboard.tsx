"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  TrendingUp, 
  MapPin, 
  Building2, 
  AlertCircle,
  MessageSquare,
  Phone,
  Star,
  Award,
  Target,
  Eye,
  Filter,
  BarChart3,
  Bell,
  Download
} from 'lucide-react'

interface Application {
  id: string
  jobTitle: string
  company: string
  location: string
  appliedDate: string
  status: 'submitted' | 'reviewing' | 'interview' | 'offer' | 'rejected'
  matchScore: number
  followUpDate?: string
  interviewDate?: string
  notes?: string
  aiTips?: string[]
}

interface ApplicationDashboardProps {
  isOpen: boolean
  onClose: () => void
  applications: Application[]
}

const ApplicationDashboard: React.FC<ApplicationDashboardProps> = ({
  isOpen,
  onClose,
  applications
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'match'>('date')
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeApplications: 0,
    interviewsScheduled: 0,
    responseRate: 0,
    averageMatchScore: 0
  })

  const [upcomingTasks, setUpcomingTasks] = useState<Array<{
    id: string
    type: 'follow-up' | 'interview' | 'deadline'
    title: string
    date: string
    urgent: boolean
  }>>([])

  useEffect(() => {
    if (applications.length > 0) {
      calculateStats()
      generateUpcomingTasks()
    }
  }, [applications])

  const calculateStats = () => {
    const totalApps = applications.length
    const activeApps = applications.filter(app => 
      ['submitted', 'reviewing', 'interview'].includes(app.status)
    ).length
    const interviews = applications.filter(app => app.status === 'interview').length
    const responses = applications.filter(app => app.status !== 'submitted').length
    const responseRate = totalApps > 0 ? Math.round((responses / totalApps) * 100) : 0
    const averageMatch = totalApps > 0 ? 
      Math.round(applications.reduce((sum, app) => sum + app.matchScore, 0) / totalApps) : 0

    setStats({
      totalApplications: totalApps,
      activeApplications: activeApps,
      interviewsScheduled: interviews,
      responseRate,
      averageMatchScore: averageMatch
    })
  }

  const generateUpcomingTasks = () => {
    const tasks: Array<{
      id: string
      type: 'follow-up' | 'interview' | 'deadline'
      title: string
      date: string
      urgent: boolean
    }> = []

    applications.forEach(app => {
      // Add follow-ups
      if (app.followUpDate) {
        const followUpDate = new Date(app.followUpDate)
        const isUrgent = followUpDate.getTime() - Date.now() < 24 * 60 * 60 * 1000
        tasks.push({
          id: `follow-${app.id}`,
          type: 'follow-up',
          title: `Follow up with ${app.company}`,
          date: app.followUpDate,
          urgent: isUrgent
        })
      }

      // Add interviews
      if (app.interviewDate) {
        const interviewDate = new Date(app.interviewDate)
        const isUrgent = interviewDate.getTime() - Date.now() < 48 * 60 * 60 * 1000
        tasks.push({
          id: `interview-${app.id}`,
          type: 'interview',
          title: `Interview at ${app.company}`,
          date: app.interviewDate,
          urgent: isUrgent
        })
      }
    })

    // Sort by date
    tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setUpcomingTasks(tasks.slice(0, 5)) // Show top 5
  }

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'reviewing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'interview': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'offer': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />
      case 'reviewing': return <Eye className="h-4 w-4" />
      case 'interview': return <MessageSquare className="h-4 w-4" />
      case 'offer': return <CheckCircle2 className="h-4 w-4" />
      case 'rejected': return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'active') return ['submitted', 'reviewing', 'interview'].includes(app.status)
    if (filter === 'completed') return ['offer', 'rejected'].includes(app.status)
    return true
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
      case 'status':
        return a.status.localeCompare(b.status)
      case 'match':
        return b.matchScore - a.matchScore
      default:
        return 0
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Application Dashboard
            </h2>
            <p className="text-gray-600">Track your job applications and progress</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {stats.totalApplications}
              </div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.activeApplications}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {stats.interviewsScheduled}
              </div>
              <div className="text-sm text-gray-600">Interviews</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 mb-1">
                {stats.responseRate}%
              </div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </Card>
            
            <Card className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600 mb-1">
                {stats.averageMatchScore}%
              </div>
              <div className="text-sm text-gray-600">Avg Match</div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Filter:</span>
                  <div className="flex gap-1">
                    {['all', 'active', 'completed'].map(f => (
                      <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(f as any)}
                        className="capitalize"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sort:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="date">Date Applied</option>
                    <option value="status">Status</option>
                    <option value="match">Match Score</option>
                  </select>
                </div>
              </div>

              {/* Applications */}
              <div className="space-y-3">
                {sortedApplications.length > 0 ? (
                  sortedApplications.map(app => (
                    <Card key={app.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{app.jobTitle}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {app.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {app.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(app.appliedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              {app.matchScore}% match
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(app.status)} border`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(app.status)}
                              {app.status}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      {/* AI Tips */}
                      {app.aiTips && app.aiTips.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">AI Suggestions</span>
                          </div>
                          <ul className="text-xs text-blue-700 space-y-1">
                            {app.aiTips.map((tip, index) => (
                              <li key={index}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <div className="flex gap-2">
                          {app.status === 'submitted' && (
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Follow Up
                            </Button>
                          )}
                          {app.interviewDate && (
                            <Button variant="outline" size="sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              Interview Prep
                            </Button>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">No applications found</h3>
                    <p className="text-gray-600 text-sm">Start applying to jobs to see them here</p>
                  </Card>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming Tasks */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-600" />
                  Upcoming Tasks
                </h3>
                
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`p-3 rounded-lg border ${
                          task.urgent ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {task.type === 'follow-up' && <MessageSquare className="h-3 w-3 text-blue-600" />}
                          {task.type === 'interview' && <Phone className="h-3 w-3 text-purple-600" />}
                          {task.type === 'deadline' && <AlertCircle className="h-3 w-3 text-red-600" />}
                          <span className="text-sm font-medium">{task.title}</span>
                          {task.urgent && (
                            <Badge className="bg-red-100 text-red-800 text-xs">Urgent</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No upcoming tasks</p>
                )}
              </Card>

              {/* AI Insights */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  AI Insights
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium mb-1">🎯 Success Pattern</p>
                    <p className="text-green-700 text-xs">
                      Jobs with 80%+ match score have 3x higher response rates
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium mb-1">📈 Optimization Tip</p>
                    <p className="text-blue-700 text-xs">
                      Add "React" and "TypeScript" skills for 15% more matches
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-purple-800 font-medium mb-1">⏰ Timing Insight</p>
                    <p className="text-purple-700 text-xs">
                      Tuesday applications get responses 2 days faster
                    </p>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    View Achievements
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Set Goals
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDashboard