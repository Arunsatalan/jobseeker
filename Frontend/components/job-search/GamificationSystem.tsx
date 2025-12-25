"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Award, 
  TrendingUp, 
  Calendar, 
  CheckCircle2,
  Crown,
  Medal,
  Sparkles,
  Flame,
  Heart,
  Clock,
  BarChart3
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: 'application' | 'profile' | 'networking' | 'interview' | 'milestone'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedDate?: string
  progress?: number
  maxProgress?: number
  reward?: string
}

interface GamificationSystemProps {
  isOpen: boolean
  onClose: () => void
  userStats: {
    level: number
    xp: number
    xpToNext: number
    applicationsThisWeek: number
    streakDays: number
    profileCompleteness: number
    interviewsCompleted: number
    totalApplications: number
  }
  achievements: Achievement[]
  onClaimReward: (achievementId: string) => void
}

const GamificationSystem: React.FC<GamificationSystemProps> = ({
  isOpen,
  onClose,
  userStats,
  achievements,
  onClaimReward
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges' | 'leaderboard'>('overview')
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)

  // Current challenges
  const [challenges, setChallenges] = useState([
    {
      id: 'weekly_apps',
      title: 'Application Streak',
      description: 'Apply to 5 jobs this week',
      progress: userStats.applicationsThisWeek,
      maxProgress: 5,
      reward: '+200 XP',
      category: 'weekly',
      deadline: '3 days',
      difficulty: 'easy'
    },
    {
      id: 'profile_complete',
      title: 'Profile Master',
      description: 'Complete your profile to 100%',
      progress: userStats.profileCompleteness,
      maxProgress: 100,
      reward: '+500 XP + "Profile Pro" badge',
      category: 'profile',
      deadline: 'No deadline',
      difficulty: 'medium'
    },
    {
      id: 'networking_goal',
      title: 'Network Builder',
      description: 'Connect with 3 professionals this month',
      progress: 1,
      maxProgress: 3,
      reward: '+300 XP + Networking boost',
      category: 'monthly',
      deadline: '15 days',
      difficulty: 'medium'
    }
  ])

  // Mock leaderboard data
  const [leaderboard] = useState([
    { rank: 1, name: 'Sarah Chen', level: 12, weeklyApps: 8, avatar: '👩‍💼' },
    { rank: 2, name: 'Mike Johnson', level: 11, weeklyApps: 7, avatar: '👨‍💻' },
    { rank: 3, name: 'Alex Rivera', level: 10, weeklyApps: 6, avatar: '👩‍🎓' },
    { rank: 4, name: 'You', level: userStats.level, weeklyApps: userStats.applicationsThisWeek, avatar: '🚀' },
    { rank: 5, name: 'Emma Davis', level: 9, weeklyApps: 4, avatar: '👩‍🔬' }
  ])

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50'
      case 'rare': return 'border-blue-300 bg-blue-50'
      case 'epic': return 'border-purple-300 bg-purple-50'
      case 'legendary': return 'border-yellow-300 bg-yellow-50'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const unlockedAchievements = achievements.filter(a => a.unlockedDate)
  const lockedAchievements = achievements.filter(a => !a.unlockedDate)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-300" />
                Career Quest
              </h2>
              <p className="opacity-90">Level up your job search game!</p>
            </div>
            
            {/* User Level & XP */}
            <div className="text-center">
              <div className="bg-white/20 rounded-lg px-4 py-2 mb-2">
                <div className="text-2xl font-bold">Level {userStats.level}</div>
                <div className="text-sm opacity-90">{userStats.xp} / {userStats.xp + userStats.xpToNext} XP</div>
              </div>
              <div className="w-32 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(userStats.xp / (userStats.xp + userStats.xpToNext)) * 100}%` }}
                />
              </div>
            </div>
            
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
              { id: 'achievements', label: 'Achievements', icon: <Trophy className="h-4 w-4" /> },
              { id: 'challenges', label: 'Challenges', icon: <Target className="h-4 w-4" /> },
              { id: 'leaderboard', label: 'Leaderboard', icon: <Crown className="h-4 w-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100">
                  <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{userStats.applicationsThisWeek}</div>
                  <div className="text-sm text-gray-600">Apps This Week</div>
                </Card>

                <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100">
                  <Flame className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{userStats.streakDays}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </Card>

                <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100">
                  <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{userStats.profileCompleteness}%</div>
                  <div className="text-sm text-gray-600">Profile Complete</div>
                </Card>

                <Card className="p-4 text-center bg-gradient-to-br from-pink-50 to-pink-100">
                  <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-pink-600">{userStats.totalApplications}</div>
                  <div className="text-sm text-gray-600">Total Applied</div>
                </Card>
              </div>

              {/* Recent Achievements */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  Recent Achievements
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {unlockedAchievements.slice(0, 3).map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{achievement.icon}</div>
                        <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                        <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </Badge>
                        {achievement.reward && (
                          <div className="mt-2">
                            <Button size="sm" variant="outline" onClick={() => onClaimReward(achievement.id)}>
                              Claim Reward
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Active Challenges Preview */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Active Challenges
                </h3>
                <div className="space-y-3">
                  {challenges.slice(0, 2).map(challenge => (
                    <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {challenge.progress}/{challenge.maxProgress}
                          </span>
                        </div>
                      </div>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Achievement Gallery
                </h3>
                <p className="text-gray-600">
                  {unlockedAchievements.length} of {achievements.length} achievements unlocked
                </p>
                <div className="w-64 bg-gray-200 rounded-full h-3 mx-auto mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(unlockedAchievements.length / achievements.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Unlocked Achievements */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Unlocked ({unlockedAchievements.length})
                </h4>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {unlockedAchievements.map(achievement => (
                    <Card 
                      key={achievement.id}
                      className={`p-4 text-center border-2 ${getRarityColor(achievement.rarity)}`}
                    >
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h5 className="font-semibold text-gray-900 mb-1">{achievement.title}</h5>
                      <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                      <Badge className="text-xs mb-2" variant="secondary">
                        {achievement.rarity}
                      </Badge>
                      {achievement.unlockedDate && (
                        <p className="text-xs text-gray-500">
                          Unlocked {new Date(achievement.unlockedDate).toLocaleDateString()}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* Locked Achievements */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  Locked ({lockedAchievements.length})
                </h4>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {lockedAchievements.map(achievement => (
                    <Card 
                      key={achievement.id}
                      className="p-4 text-center border-2 border-gray-200 bg-gray-50 opacity-60"
                    >
                      <div className="text-4xl mb-3 grayscale">❓</div>
                      <h5 className="font-semibold text-gray-600 mb-1">{achievement.title}</h5>
                      <p className="text-xs text-gray-500 mb-2">{achievement.description}</p>
                      {achievement.progress !== undefined && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className="bg-gray-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {achievement.progress || 0}/{achievement.maxProgress || 1}
                          </span>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Active Challenges
                </h3>
                <p className="text-gray-600">
                  Complete challenges to earn XP and unlock rewards
                </p>
              </div>

              <div className="space-y-4">
                {challenges.map(challenge => (
                  <Card key={challenge.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{challenge.title}</h4>
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{challenge.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                challenge.progress >= challenge.maxProgress 
                                  ? 'bg-green-500' 
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min((challenge.progress / challenge.maxProgress) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            {challenge.progress}/{challenge.maxProgress}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Reward: {challenge.reward}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {challenge.deadline}
                          </span>
                        </div>
                      </div>
                      
                      {challenge.progress >= challenge.maxProgress && (
                        <Button className="bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Claim Reward
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Weekly Leaderboard
                </h3>
                <p className="text-gray-600">
                  See how you rank against other job seekers this week
                </p>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div 
                      key={user.rank}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        user.name === 'You' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 font-bold text-gray-700">
                        {user.rank <= 3 ? (
                          user.rank === 1 ? '🥇' :
                          user.rank === 2 ? '🥈' : '🥉'
                        ) : (
                          user.rank
                        )}
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-2xl">{user.avatar}</div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">Level {user.level}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{user.weeklyApps} apps</p>
                        <p className="text-sm text-gray-600">this week</p>
                      </div>

                      {/* Badge for top performers */}
                      {user.rank === 1 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Champion
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Achievement Unlock Animation */}
      {unlockedAchievement && (
        <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-in zoom-in duration-500">
            <div className="text-6xl mb-4">{unlockedAchievement.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h3>
            <h4 className="text-lg font-semibold text-purple-600 mb-2">{unlockedAchievement.title}</h4>
            <p className="text-gray-600 mb-4">{unlockedAchievement.description}</p>
            <Badge className={`mb-4 ${getRarityColor(unlockedAchievement.rarity)}`}>
              {unlockedAchievement.rarity}
            </Badge>
            <Button onClick={() => setUnlockedAchievement(null)} className="w-full">
              Awesome!
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GamificationSystem