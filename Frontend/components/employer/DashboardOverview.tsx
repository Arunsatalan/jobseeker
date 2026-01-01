"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Users,
  CheckCircle,
  TrendingUp,
  Plus,
  Eye,
  Calendar,
  Building2,
  Video,
  Clock,
  XCircle,
  Star,
  MapPin,
  Phone,
  User,
  Sparkles,
} from "lucide-react";
import axios from "axios";

interface Company {
  name: string;
  email: string;
  phone: string;
  plan: string;
  logo: string;
  industry: string;
  size: string;
  location: string;
}

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  hiresMade: number;
}

interface Job {
  id: string;
  title: string;
  department: string;
  postedDate: string;
  expiryDate: string;
  applicantsCount: number;
  status: "Open" | "Closed" | "Draft" | "Paused";
}

interface DashboardOverviewProps {
  company: Company;
  stats: Stats;
  recentJobs: Job[];
  onPostJob: () => void;
}

export function DashboardOverview({ company, stats, recentJobs, onPostJob }: DashboardOverviewProps) {
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [pendingVotes, setPendingVotes] = useState<any[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadUpcomingInterviews();
    loadPendingVotes();
  }, []);

  const loadUpcomingInterviews = async () => {
    setLoadingInterviews(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/v1/interviews/employer/slots`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'confirmed' },
      });

      if (response.data && response.data.success) {
        const interviews = response.data.data || [];
        // Filter to show only upcoming interviews
        const now = new Date();
        const upcoming = interviews
          .filter((interview: any) => {
            if (!interview.confirmedSlot?.startTime) return false;
            return new Date(interview.confirmedSlot.startTime) > now;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.confirmedSlot?.startTime || 0);
            const dateB = new Date(b.confirmedSlot?.startTime || 0);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 5); // Show top 5 upcoming
        setUpcomingInterviews(upcoming);
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoadingInterviews(false);
    }
  };

  const loadPendingVotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/v1/interviews/employer/slots`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'voting' },
      });

      if (response.data && response.data.success) {
        const interviews = response.data.data || [];
        // Show interviews where candidate has voted but not yet confirmed
        const pending = interviews
          .filter((interview: any) => {
            return interview.candidateVotes && interview.candidateVotes.length > 0;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.votingDeadline || 0);
            const dateB = new Date(b.votingDeadline || 0);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 3); // Show top 3 pending
        setPendingVotes(pending);
      }
    } catch (error) {
      console.error('Failed to load pending votes:', error);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTimeUntilInterview = (dateString: string) => {
    const interviewTime = new Date(dateString);
    const now = new Date();
    const diff = interviewTime.getTime() - now.getTime();
    
    if (diff < 0) return { text: 'Past', color: 'text-gray-500' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return { text: `${days}d ${hours}h`, color: 'text-blue-600' };
    } else if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, color: 'text-amber-600' };
    } else {
      return { text: `${minutes}m`, color: 'text-red-600' };
    }
  };

  const canCancelInterview = (interview: any): boolean => {
    if (!interview.confirmedSlot?.startTime) return false;
    const interviewTime = new Date(interview.confirmedSlot.startTime);
    const now = new Date();
    const hoursUntilInterview = (interviewTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilInterview >= 4;
  };

  const handleCancelInterview = async (interviewSlotId: string) => {
    if (!confirm('Are you sure you want to cancel this interview? The candidate will be notified.')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/v1/interviews/cancel`,
        {
          interviewSlotId,
          reason: reason || 'No reason provided',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        loadUpcomingInterviews();
        alert('Interview cancelled successfully. The candidate has been notified.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel interview. Please try again.');
    }
  };

  const getCandidateVoteInfo = (interview: any) => {
    if (!interview.candidateVotes || interview.candidateVotes.length === 0) return null;
    
    // Find the vote for the confirmed slot
    const confirmedSlotIndex = interview.confirmedSlot?.slotIndex;
    if (confirmedSlotIndex === undefined) return null;
    
    const vote = interview.candidateVotes.find((v: any) => v.slotIndex === confirmedSlotIndex);
    if (!vote) return null;
    
    return {
      rank: vote.rank,
      notes: vote.notes,
      availability: vote.availability,
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-700";
      case "Paused":
        return "bg-yellow-100 text-yellow-700";
      case "Closed":
        return "bg-gray-100 text-gray-700";
      case "Draft":
        return "bg-slate-100 text-slate-900";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-slate-900 to-amber-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {company.name}!</h1>
            <p className="text-slate-100 text-lg">
              Manage your talent pipeline and grow your team efficiently
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {company.industry}
              </span>
              <span>{company.size}</span>
              <span>{company.location}</span>
            </div>
          </div>
          <Button
            onClick={onPostJob}
            className="text-slate-900 hover:bg-slate-100"
            style={{ backgroundColor: '#f5f3f0' }}
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-linear-to-br from-slate-50 to-slate-100 border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-700 text-sm font-medium">Total Job Posts</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalJobs}</p>
              <p className="text-xs text-slate-700 mt-2">All time</p>
            </div>
            <div className="h-12 w-12 bg-slate-200 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-slate-700" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-linear-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Active Jobs</p>
              <p className="text-3xl font-bold text-green-700 mt-1">{stats.activeJobs}</p>
              <p className="text-xs text-green-600 mt-2">Currently open</p>
            </div>
            <div className="h-12 w-12 bg-green-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Applications Received</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{stats.totalApplications}</p>
              <p className="text-xs text-purple-600 mt-2">This month</p>
            </div>
            <div className="h-12 w-12 bg-purple-200 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-linear-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Hires Made</p>
              <p className="text-3xl font-bold text-orange-700 mt-1">{stats.hiresMade}</p>
              <p className="text-xs text-orange-600 mt-2">This quarter</p>
            </div>
            <div className="h-12 w-12 bg-orange-200 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Votes - Candidate Has Selected, Awaiting Confirmation */}
      {pendingVotes.length > 0 && (
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Pending Confirmations</h2>
              <p className="text-sm text-slate-600">Candidates have voted - review and confirm</p>
            </div>
            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-1.5 text-sm font-semibold">
              {pendingVotes.length} pending
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingVotes.map((interview: any, idx: number) => {
              const topVote = interview.candidateVotes
                ?.sort((a: any, b: any) => a.rank - b.rank)[0];
              const topSlot = topVote ? interview.proposedSlots?.[topVote.slotIndex] : null;

              return (
                <div
                  key={idx}
                  className="group relative p-5 bg-white rounded-xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Star className="h-7 w-7 text-white fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg mb-1">
                        {interview.candidate?.firstName} {interview.candidate?.lastName}
                      </h3>
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-1 mb-3">
                        <Briefcase className="h-3 w-3" />
                        {interview.job?.title}
                      </p>
                      
                      {topSlot && (
                        <div className="space-y-2 mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-amber-900">Candidate's Top Choice:</span>
                            <Badge className="bg-amber-600 text-white text-xs">
                              Rank #{topVote.rank}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-amber-600" />
                            <span className="font-medium text-slate-700">
                              {new Date(topSlot.startTime).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {topVote.notes && (
                            <p className="text-xs text-slate-600 italic mt-1">"{topVote.notes}"</p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                          onClick={() => {
                            // Navigate to applicant tracking to confirm
                            window.location.href = '/employer-dashboard?tab=applicants';
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review & Confirm
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Upcoming Interviews - Enhanced 2025 Design */}
      {upcomingInterviews.length > 0 && (
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Upcoming Interviews</h2>
              <p className="text-sm text-slate-600">Candidate-selected interview times</p>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1.5 text-sm font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              {upcomingInterviews.length} scheduled
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingInterviews.map((interview: any, idx: number) => {
              const interviewTime = interview.confirmedSlot?.startTime;
              const timeInfo = interviewTime ? getTimeUntilInterview(interviewTime) : null;
              const voteInfo = getCandidateVoteInfo(interview);
              const canCancel = canCancelInterview(interview);
              const meetingType = interview.confirmedSlot?.meetingType || interview.proposedSlots?.[interview.confirmedSlot?.slotIndex]?.meetingType || 'video';

              return (
                <div
                  key={idx}
                  className="group relative p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    {timeInfo && (
                      <Badge className={`${timeInfo.color} bg-opacity-10 border-0 font-medium`}>
                        <Clock className="h-3 w-3 mr-1" />
                        {timeInfo.text}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Avatar/Icon */}
                    <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      {meetingType === 'video' ? (
                        <Video className="h-7 w-7 text-white" />
                      ) : meetingType === 'phone' ? (
                        <Phone className="h-7 w-7 text-white" />
                      ) : (
                        <MapPin className="h-7 w-7 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg mb-1">
                            {interview.candidate?.firstName} {interview.candidate?.lastName}
                          </h3>
                          <p className="text-sm font-medium text-slate-600 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {interview.job?.title}
                          </p>
                        </div>
                      </div>

                      {/* Interview Details */}
                      <div className="space-y-2 mt-3">
                        {interviewTime && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-slate-700">
                              {formatDateTime(interviewTime)}
                            </span>
                          </div>
                        )}

                        {/* Candidate Vote Info */}
                        {voteInfo && (
                          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              <span className="text-xs font-semibold text-slate-700">
                                Ranked #{voteInfo.rank} by candidate
                              </span>
                            </div>
                            {voteInfo.availability && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  voteInfo.availability === 'available' 
                                    ? 'border-green-300 text-green-700 bg-green-50'
                                    : voteInfo.availability === 'maybe'
                                    ? 'border-amber-300 text-amber-700 bg-amber-50'
                                    : 'border-red-300 text-red-700 bg-red-50'
                                }`}
                              >
                                {voteInfo.availability}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Meeting Type & Location */}
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="capitalize font-medium">{meetingType}</span>
                          {interview.confirmedSlot?.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {interview.confirmedSlot.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                        {interview.confirmedSlot?.meetingLink && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex-1"
                            onClick={() => window.open(interview.confirmedSlot.meetingLink, '_blank')}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleCancelInterview(interview._id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Jobs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Job Posts</h2>
            <p className="text-gray-600 text-sm">Monitor your latest job postings</p>
          </div>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {recentJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {job.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Posted {job.postedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {job.applicantsCount} applicants
                  </span>
                </div>
              </div>
              {/* <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              </div>*/}
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Post a Job</h3>
          <p className="text-gray-600 text-sm mb-4">Create and publish new job openings</p>
          <Button onClick={onPostJob} className="w-full">
            Get Started
          </Button>
        </Card>

        <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Review Applications</h3>
          <p className="text-gray-600 text-sm mb-4">Screen and manage candidate applications</p>
          <Button variant="outline" className="w-full">
            Review Now
          </Button>
        </Card>

        <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Schedule Interviews</h3>
          <p className="text-gray-600 text-sm mb-4">Organize interviews with candidates</p>
          <Button variant="outline" className="w-full">
            Schedule
          </Button>
        </Card>
      </div>
    </div>
  );
}