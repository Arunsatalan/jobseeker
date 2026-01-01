"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, BookmarkCheck, FileText, AlertTriangle, Calendar, Video, CheckCircle, Phone, MapPin, Building2, XCircle, Loader2, Clock, RefreshCw } from "lucide-react";
import { InterviewSlotVoting } from "../jobseeker/InterviewSlotVoting";
import { CalendarSyncButton } from "../jobseeker/CalendarSyncButton";
import { SmartReminders } from "../jobseeker/SmartReminders";
import { formatTimeInTimezone, getTimezoneAbbreviation, type CalendarEvent } from "@/utils/calendarIntegration";
import axios from "axios";

interface CareerProgressProps {
  jobMatchScore: number;
  savedJobs: number;
  applications: number;
  skillGaps: string[];
}

export function CareerProgress({
  jobMatchScore,
  savedJobs,
  applications,
  skillGaps,
}: CareerProgressProps) {
  const [pendingInterviews, setPendingInterviews] = useState<any[]>([]);
  const [confirmedInterviews, setConfirmedInterviews] = useState<any[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  const [showVotingDialog, setShowVotingDialog] = useState(false);
  const [cancellingInterview, setCancellingInterview] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadPendingInterviews();
    loadConfirmedInterviews();
  }, []);

  const loadPendingInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/v1/interviews/candidate/slots`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'voting' },
      });

      if (response.data.success) {
        setPendingInterviews(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load pending interviews:', error);
    }
  };

  const loadConfirmedInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/v1/interviews/candidate/slots`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'confirmed' },
      });

      if (response.data.success) {
        setConfirmedInterviews(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load confirmed interviews:', error);
    }
  };

  const handleCancelInterview = async (interviewSlotId: string, reason?: string) => {
    if (!confirm('Are you sure you want to cancel this interview? This action cannot be undone.')) {
      return;
    }

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
        // Reload confirmed interviews
        loadConfirmedInterviews();
        alert('Interview cancelled successfully. Both parties have been notified.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel interview. Please try again.');
    } finally {
      setCancellingInterview(null);
    }
  };

  const canCancelInterview = (interview: any): boolean => {
    if (!interview.confirmedSlot?.startTime) return false;
    const interviewTime = new Date(interview.confirmedSlot.startTime);
    const now = new Date();
    const hoursUntilInterview = (interviewTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilInterview >= 4;
  };

  // Helper function to extract application ID (handles both string and object)
  const getApplicationId = (application: any): string => {
    if (typeof application === 'string') {
      return application;
    }
    if (application?._id) {
      return application._id.toString();
    }
    if (application?.id) {
      return application.id.toString();
    }
    return '';
  };

  return (
    <>
      <Card className="p-6 mb-6 bg-white border-0 shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Career Progress & Recommendations
        </h3>

        {/* Interview Scheduling Section - All Interviews */}
        {(pendingInterviews.length > 0 || confirmedInterviews.length > 0) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Video className="h-5 w-5" style={{ color: '#02243b' }} />
                Interview Schedules
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadPendingInterviews();
                  loadConfirmedInterviews();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Pending Interviews (Need Voting) */}
            {pendingInterviews.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Pending - Vote for Your Preferred Time</h4>
                <div className="space-y-3">
                  {pendingInterviews.map((interview: any) => {
                    const applicationId = getApplicationId(interview.application);
                    const jobTitle = typeof interview.job === 'object' ? interview.job.title : 'Position';
                    const companyName = typeof interview.job === 'object' ? interview.job.company : 'Company';
                    
                    return (
                      <div
                        key={interview._id}
                        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="h-4 w-4 text-amber-600" />
                              <span className="font-semibold text-gray-900">{jobTitle}</span>
                              <span className="text-sm text-gray-600">at {companyName}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {interview.proposedSlots?.length || 0} time slot{interview.proposedSlots?.length !== 1 ? 's' : ''} available
                            </p>
                            {interview.votingDeadline && (
                              <p className="text-xs text-amber-700">
                                Voting deadline: {new Date(interview.votingDeadline).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="text-white"
                            style={{ backgroundColor: '#02243b' }}
                            onClick={() => {
                              setSelectedInterview(applicationId);
                              setShowVotingDialog(true);
                            }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Vote Now
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Confirmed Interviews */}
            {confirmedInterviews.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Confirmed Interviews</h4>
                <div className="space-y-3">
                  {confirmedInterviews.map((interview: any) => {
                    const jobTitle = typeof interview.job === 'object' ? interview.job.title : 'Position';
                    const companyName = typeof interview.job === 'object' ? interview.job.company : 'Company';
                    const confirmedSlot = interview.confirmedSlot;
                    
                    return (
                      <div
                        key={interview._id}
                        className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-semibold text-gray-900">{jobTitle}</span>
                              <span className="text-sm text-gray-600">at {companyName}</span>
                            </div>
                            {confirmedSlot?.startTime && (
                              <div className="space-y-2">
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-700">
                                    <Calendar className="h-3 w-3 inline mr-1" />
                                    {formatTimeInTimezone(confirmedSlot.startTime, confirmedSlot.timezone, {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </p>
                                  <p className="text-sm text-gray-700">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                {formatTimeInTimezone(confirmedSlot.startTime, confirmedSlot.timezone || undefined, {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })} - {confirmedSlot.endTime ? formatTimeInTimezone(confirmedSlot.endTime, confirmedSlot.timezone || undefined, {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    }) : 'N/A'}
                                    <span className="text-xs text-gray-500 ml-1">
                                      ({getTimezoneAbbreviation(confirmedSlot.timezone || undefined)})
                                    </span>
                                  </p>
                                </div>
                                
                                {/* Smart Reminders */}
                                <SmartReminders startTime={confirmedSlot.startTime} />
                                
                                {/* Calendar Sync & Actions */}
                                <div className="flex items-center gap-2 mt-2">
                                  <CalendarSyncButton
                                    event={{
                                      title: `${jobTitle} Interview`,
                                      description: `Interview with ${companyName}`,
                                      startTime: new Date(confirmedSlot.startTime),
                                      endTime: confirmedSlot.endTime ? new Date(confirmedSlot.endTime) : new Date(new Date(confirmedSlot.startTime).getTime() + 60 * 60 * 1000),
                                      location: confirmedSlot.location,
                                      meetingLink: confirmedSlot.meetingLink,
                                      timezone: confirmedSlot.timezone,
                                    }}
                                    variant="outline"
                                    size="sm"
                                  />
                                  {confirmedSlot.meetingLink && (
                                    <Button
                                      size="sm"
                                      className="text-white"
                                      style={{ backgroundColor: '#02243b' }}
                                      onClick={() => window.open(confirmedSlot.meetingLink, '_blank')}
                                    >
                                      <Video className="h-3 w-3 mr-1" />
                                      Join Meeting
                                    </Button>
                                  )}
                                  {canCancelInterview(interview) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-300 text-red-700 hover:bg-red-50"
                                      onClick={() => {
                                        const reason = prompt('Please provide a reason for cancellation:');
                                        if (reason) {
                                          handleCancelInterview(interview._id, reason);
                                        }
                                      }}
                                      disabled={cancellingInterview === interview._id}
                                    >
                                      {cancellingInterview === interview._id ? (
                                        <>
                                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                          Cancelling...
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="h-3 w-3 mr-1" />
                                          Cancel
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interview Scheduling Notifications - Legacy (keep for backward compatibility) */}
        {pendingInterviews.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-900">
                    Interview Time Slots Available
                  </p>
                  <p className="text-sm text-purple-700">
                    {pendingInterviews.length} job{pendingInterviews.length > 1 ? 's' : ''} have proposed interview times. Please vote for your preferred slots.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (pendingInterviews[0]?.application) {
                    const appId = getApplicationId(pendingInterviews[0].application);
                    if (appId) {
                      setSelectedInterview(appId);
                      setShowVotingDialog(true);
                    }
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Slots
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {pendingInterviews.map((interview, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-purple-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{interview.job?.title}</p>
                    <p className="text-xs text-gray-600">
                      {interview.proposedSlots?.length || 0} time slot{interview.proposedSlots?.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      const appId = getApplicationId(interview.application);
                      if (appId) {
                        setSelectedInterview(appId);
                        setShowVotingDialog(true);
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Vote Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Interviews - Enhanced 2025 Design */}
        {confirmedInterviews.length > 0 && (
          <div className="mb-6 p-5 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-green-900 text-lg">
                    Confirmed Interviews
                  </p>
                  <p className="text-sm text-green-700">
                    {confirmedInterviews.length} scheduled interview{confirmedInterviews.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Badge className="bg-green-600 text-white px-3 py-1">
                {confirmedInterviews.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {confirmedInterviews.map((interview, idx) => {
                const interviewTime = interview.confirmedSlot?.startTime 
                  ? new Date(interview.confirmedSlot.startTime) 
                  : null;
                const canCancel = canCancelInterview(interview);
                const hoursUntil = interviewTime 
                  ? Math.floor((interviewTime.getTime() - new Date().getTime()) / (1000 * 60 * 60))
                  : 0;
                const daysUntil = interviewTime 
                  ? Math.floor(hoursUntil / 24)
                  : 0;
                const meetingType = interview.confirmedSlot?.meetingType || interview.proposedSlots?.[interview.confirmedSlot?.slotIndex]?.meetingType || 'video';

                return (
                  <div
                    key={idx}
                    className="group relative p-5 bg-white rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Time Badge */}
                    {interviewTime && (
                      <div className="absolute top-4 right-4">
                        {hoursUntil > 24 ? (
                          <Badge className="bg-blue-100 text-blue-700 border-0 font-semibold">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysUntil}d left
                          </Badge>
                        ) : hoursUntil > 0 ? (
                          <Badge className="bg-amber-100 text-amber-700 border-0 font-semibold">
                            <Clock className="h-3 w-3 mr-1" />
                            {hoursUntil}h left
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-0 font-semibold">
                            <Clock className="h-3 w-3 mr-1" />
                            Past
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
                        meetingType === 'video' 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                          : meetingType === 'phone'
                          ? 'bg-gradient-to-br from-green-500 to-teal-500'
                          : 'bg-gradient-to-br from-orange-500 to-red-500'
                      }`}>
                        {meetingType === 'video' ? (
                          <Video className="h-6 w-6 text-white" />
                        ) : meetingType === 'phone' ? (
                          <Phone className="h-6 w-6 text-white" />
                        ) : (
                          <MapPin className="h-6 w-6 text-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">
                          {interview.job?.title}
                        </h3>
                        {interview.job?.company && (
                          <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {typeof interview.job.company === 'string' ? interview.job.company : interview.job.company.name}
                          </p>
                        )}
                        
                        {interviewTime && (
                          <div className="space-y-1.5 mt-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-700">
                                {formatTimeInTimezone(interviewTime, interview.confirmedSlot?.timezone, {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                              {interview.confirmedSlot?.timezone && (
                                <span className="text-xs text-gray-500">
                                  ({getTimezoneAbbreviation(interview.confirmedSlot.timezone)})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">{meetingType}</span>
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
                            
                            {/* Smart Reminders */}
                            <SmartReminders startTime={interviewTime} className="mt-2" />
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                          <CalendarSyncButton
                            event={{
                              title: `${interview.job?.title || 'Interview'} Interview`,
                              description: `Interview with ${typeof interview.job?.company === 'string' ? interview.job.company : interview.job?.company?.name || 'Company'}`,
                              startTime: interviewTime || new Date(),
                              endTime: interview.confirmedSlot?.endTime ? new Date(interview.confirmedSlot.endTime) : new Date((interviewTime?.getTime() || 0) + 60 * 60 * 1000),
                              location: interview.confirmedSlot?.location,
                              meetingLink: interview.confirmedSlot?.meetingLink,
                              timezone: interview.confirmedSlot?.timezone || undefined,
                            }}
                            variant="outline"
                            size="sm"
                          />
                          {interview.confirmedSlot?.meetingLink && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex-1"
                              onClick={() => window.open(interview.confirmedSlot.meetingLink, '_blank')}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join Meeting
                            </Button>
                          )}
                          {canCancel && (
                            <Button
                              onClick={() => {
                                const reason = prompt('Please provide a reason for cancellation (optional):');
                                handleCancelInterview(interview._id, reason || undefined);
                              }}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                              disabled={cancellingInterview === interview._id}
                            >
                              {cancellingInterview === interview._id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </>
                              )}
                            </Button>
                          )}
                          {!canCancel && hoursUntil > 0 && (
                            <p className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Cancellation deadline passed
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Job Match Score */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-green-700 mb-1">Job Match Score</p>
          <p className="text-2xl font-bold text-green-600">{jobMatchScore}%</p>
          <div className="w-full bg-green-200 rounded-full h-1 mt-2"></div>
        </div>

        {/* Saved Jobs */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <BookmarkCheck className="h-4 w-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-blue-700 mb-1">Saved Jobs</p>
          <p className="text-2xl font-bold text-blue-600">{savedJobs}</p>
        </div>

        {/* Applications */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <FileText className="h-4 w-4 text-purple-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-purple-700 mb-1">Applications</p>
          <p className="text-2xl font-bold text-purple-600">{applications}</p>
        </div>

        {/* Skill Gaps */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center">
          <AlertTriangle className="h-4 w-4 text-amber-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-amber-700 mb-1">Skill Gaps</p>
          <p className="text-xl font-bold text-amber-600">{skillGaps.length}</p>
        </div>
      </div>

      {/* Skill Gap Alerts */}
      {skillGaps.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Recommended Skills to Learn
          </h4>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((skill) => (
              <Badge key={skill} variant="outline" className="border-amber-200 text-amber-700">
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Adding these skills would improve your job match score by up to 15%
          </p>
        </div>
      )}
    </Card>

    {/* Interview Voting Dialog */}
    {showVotingDialog && selectedInterview && (
      <InterviewSlotVoting
        applicationId={selectedInterview}
        open={showVotingDialog}
        onOpenChange={(open) => {
          setShowVotingDialog(open);
          if (!open) {
            loadPendingInterviews(); // Refresh after voting
          }
        }}
        onSuccess={() => {
          loadPendingInterviews();
        }}
      />
    )}
    </>
  );
}
