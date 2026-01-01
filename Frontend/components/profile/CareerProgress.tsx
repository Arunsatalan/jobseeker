"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, BookmarkCheck, FileText, AlertTriangle, Calendar, Video, CheckCircle } from "lucide-react";
import { InterviewSlotVoting } from "../jobseeker/InterviewSlotVoting";
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

        {/* Interview Scheduling Notifications */}
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

        {/* Confirmed Interviews */}
        {confirmedInterviews.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">
                  Confirmed Interviews
                </p>
                <p className="text-sm text-green-700">
                  {confirmedInterviews.length} confirmed interview{confirmedInterviews.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {confirmedInterviews.map((interview, idx) => {
                const interviewTime = interview.confirmedSlot?.startTime 
                  ? new Date(interview.confirmedSlot.startTime) 
                  : null;
                const canCancel = canCancelInterview(interview);
                const hoursUntil = interviewTime 
                  ? Math.floor((interviewTime.getTime() - new Date().getTime()) / (1000 * 60 * 60))
                  : 0;

                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-green-100">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{interview.job?.title}</p>
                      {interviewTime && (
                        <p className="text-xs text-gray-600">
                          {interviewTime.toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                      {interview.confirmedSlot?.meetingLink && (
                        <a
                          href={interview.confirmedSlot.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Join Meeting →
                        </a>
                      )}
                      {!canCancel && hoursUntil > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Cancellation deadline passed ({hoursUntil}h until interview)
                        </p>
                      )}
                    </div>
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
                          'Cancelling...'
                        ) : (
                          'Cancel'
                        )}
                      </Button>
                    )}
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
