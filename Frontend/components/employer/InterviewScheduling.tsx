"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Phone,
  MapPin,
  Star,
  Briefcase,
  Loader2,
  RefreshCw,
  Sparkles,
  AlertCircle
} from "lucide-react";
import axios from "axios";

export function InterviewScheduling() {
  const [confirmedInterviews, setConfirmedInterviews] = useState<any[]>([]);
  const [pendingVotes, setPendingVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingInterview, setCancellingInterview] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Load confirmed interviews
      const confirmedResponse = await axios.get(`${apiUrl}/api/v1/interviews/employer/slots`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'confirmed' },
      });

      if (confirmedResponse.data && confirmedResponse.data.success) {
        const interviews = confirmedResponse.data.data || [];
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
          });
        setConfirmedInterviews(upcoming);
      }

      // Load pending votes (candidates have voted, awaiting confirmation)
      const pendingResponse = await axios.get(`${apiUrl}/api/v1/interviews/employer/slots`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'voting' },
      });

      if (pendingResponse.data && pendingResponse.data.success) {
        const interviews = pendingResponse.data.data || [];
        const pending = interviews
          .filter((interview: any) => {
            return interview.candidateVotes && interview.candidateVotes.length > 0;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.votingDeadline || 0);
            const dateB = new Date(b.votingDeadline || 0);
            return dateA.getTime() - dateB.getTime();
          });
        setPendingVotes(pending);
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
      return { text: `${days}d ${hours}h`, color: 'text-slate-700' };
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
    
    setCancellingInterview(interviewSlotId);
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
        loadInterviews();
        alert('Interview cancelled successfully. The candidate has been notified.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel interview. Please try again.');
    } finally {
      setCancellingInterview(null);
    }
  };

  const getCandidateVoteInfo = (interview: any) => {
    if (!interview.candidateVotes || interview.candidateVotes.length === 0) return null;
    
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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Scheduling</h1>
          <p className="text-gray-600">Manage candidate-selected interview times</p>
        </div>
        {/* <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadInterviews}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="text-white" 
            style={{ backgroundColor: '#02243b' }}
            onClick={() => {
              // Navigate to applicants tab to schedule new interview
              window.location.href = '/employer-dashboard?tab=applicants';
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div> */}
      </div>

      {/* Pending Votes - Candidate Has Selected, Awaiting Confirmation */}
      {pendingVotes.length > 0 && (
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Pending Confirmations</h2>
              <p className="text-sm text-slate-600">Candidates have voted - review and confirm</p>
            </div>
            <Badge className="text-white px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: '#02243b' }}>
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
                    <div className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ backgroundColor: '#02243b' }}>
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
                              {formatDateTime(topSlot.startTime)}
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
                          className="text-white hover:opacity-90"
                          style={{ backgroundColor: '#02243b' }}
                          onClick={() => {
                            // Navigate to applicant tracking to confirm
                            window.location.href = '/employer-dashboard?tab=applicants';
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
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

      {/* Confirmed Interviews - Enhanced 2025 Design */}
      {confirmedInterviews.length > 0 ? (
        <Card className="p-6 shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Confirmed Interviews</h2>
              <p className="text-sm text-slate-600">Candidate-selected interview times</p>
            </div>
            <Badge className="text-white px-4 py-1.5 text-sm font-semibold" style={{ backgroundColor: '#02243b' }}>
              <Sparkles className="h-3 w-3 mr-1" />
              {confirmedInterviews.length} scheduled
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {confirmedInterviews.map((interview: any, idx: number) => {
              const interviewTime = interview.confirmedSlot?.startTime;
              const timeInfo = interviewTime ? getTimeUntilInterview(interviewTime) : null;
              const voteInfo = getCandidateVoteInfo(interview);
              const canCancel = canCancelInterview(interview);
              const meetingType = interview.confirmedSlot?.meetingType || interview.proposedSlots?.[interview.confirmedSlot?.slotIndex]?.meetingType || 'video';

              return (
                <div
                  key={idx}
                  className="group relative p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
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
                    <div className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ backgroundColor: '#02243b' }}>
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
                            <Calendar className="h-4 w-4" style={{ color: '#02243b' }} />
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
                            className="text-white hover:opacity-90 flex-1"
                            style={{ backgroundColor: '#02243b' }}
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
                            disabled={cancellingInterview === interview._id}
                          >
                            {cancellingInterview === interview._id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-1" />
                            )}
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
      ) : (
        <Card className="p-12 text-center">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No confirmed interviews</h3>
          <p className="text-gray-600 mb-4">Schedule interviews with candidates to see them here.</p>
          <Button 
            className="text-white hover:opacity-90" 
            style={{ backgroundColor: '#02243b' }}
            onClick={() => {
              window.location.href = '/employer-dashboard?tab=applicants';
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </Card>
      )}
    </div>
  );
}