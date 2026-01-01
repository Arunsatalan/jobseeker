"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, Star, CheckCircle, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface ProposedSlot {
  startTime: string;
  endTime: string;
  timezone: string;
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  location?: string;
  notes?: string;
  aiScore?: number;
}

interface CandidateVote {
  slotIndex: number;
  rank: number;
  notes: string;
  availability: 'available' | 'maybe' | 'unavailable';
}

interface InterviewSlotVotingProps {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InterviewSlotVoting({
  applicationId,
  open,
  onOpenChange,
  onSuccess,
}: InterviewSlotVotingProps) {
  const [interviewSlot, setInterviewSlot] = useState<any>(null);
  const [votes, setVotes] = useState<CandidateVote[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Recalculate ranked votes whenever votes change
  const rankedVotes = votes.filter(v => v.rank > 0 && v.rank <= 5).length;
  const totalSlots = interviewSlot?.proposedSlots?.length || 0;
  const minRequired = Math.min(1, totalSlots); // Simplified: only 1 slot needs to be ranked (2025 UX)

  useEffect(() => {
    if (open && applicationId) {
      loadInterviewSlots();
    }
  }, [open, applicationId]);

  const loadInterviewSlots = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiUrl}/api/v1/interviews/slots/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        setInterviewSlot(data);
        
        // Initialize votes from existing votes or create new ones
        if (data.candidateVotes && data.candidateVotes.length > 0) {
          setVotes(data.candidateVotes.map((v: any) => ({
            slotIndex: v.slotIndex,
            rank: v.rank,
            notes: v.notes || '',
            availability: v.availability || 'available',
          })));
        } else {
          // Initialize empty votes for all slots
          const initialVotes = data.proposedSlots.map((_: any, index: number) => ({
            slotIndex: index,
            rank: 0,
            notes: '',
            availability: 'available' as const,
          }));
          setVotes(initialVotes);
        }
      }
    } catch (error: any) {
      toast({
        title: "Failed to Load Slots",
        description: error.response?.data?.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVote = (slotIndex: number, field: keyof CandidateVote, value: any) => {
    setVotes(prevVotes => {
      return prevVotes.map(v => {
        if (v.slotIndex === slotIndex) {
          return { ...v, [field]: value };
        }
        return v;
      });
    });
  };

  const setRank = (slotIndex: number, rank: number) => {
    // Ensure only one slot has each rank (1-5)
    setVotes(prevVotes => {
      const updated = prevVotes.map(v => {
        if (v.slotIndex === slotIndex) {
          return { ...v, rank };
        } else if (v.rank === rank) {
          return { ...v, rank: 0 }; // Remove rank from other slot
        }
        return v;
      });
      return updated;
    });
  };

  const handleSubmit = async () => {
    // Validate that minimum required slots are ranked (simplified: 1 slot required)
    const rankedVotes = votes.filter(v => v.rank > 0 && v.rank <= 5);
    const totalSlots = interviewSlot.proposedSlots?.length || 0;
    const minRequired = Math.min(1, totalSlots); // Simplified: only 1 slot needs to be ranked
    
    if (rankedVotes.length < minRequired) {
      toast({
        title: "Please Select a Rank",
        description: `Please rank at least ${minRequired} time slot${minRequired !== 1 ? 's' : ''} (1 = most preferred, 5 = least preferred).`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/v1/interviews/vote`,
        {
          interviewSlotId: interviewSlot._id,
          votes: rankedVotes.map(v => ({
            slotIndex: v.slotIndex,
            rank: v.rank,
            notes: v.notes,
            availability: v.availability,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        toast({
          title: "Votes Submitted Successfully",
          description: data.autoConfirmed
            ? `Your interview has been auto-confirmed! Check your notifications for details.`
            : `Your preferences have been recorded. The employer will review and confirm the interview time.`,
        });
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Submit Votes",
        description: error.response?.data?.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const getTimeRemaining = () => {
    if (!interviewSlot?.votingDeadline) return null;
    const deadline = new Date(interviewSlot.votingDeadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return { expired: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours, expired: false };
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Interview Slots</DialogTitle>
            <DialogDescription>Please wait while we load the interview time slots.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!interviewSlot) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Interview Slots Available</DialogTitle>
            <DialogDescription>There are no interview slots available for this application.</DialogDescription>
          </DialogHeader>
          <div className="text-center p-8">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No interview slots available</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const timeRemaining = getTimeRemaining();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Vote for Interview Time Slots</DialogTitle>
          <DialogDescription>
            Rank your preferred interview times (1 = most preferred, 5 = least preferred). 
            {totalSlots > 0 && (
              <> You must rank at least {minRequired} slot{minRequired !== 1 ? 's' : ''}.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Deadline Alert */}
          {timeRemaining && (
            <Card className={`p-4 ${timeRemaining.expired ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center gap-3">
                <Clock className={`h-5 w-5 ${timeRemaining.expired ? 'text-red-600' : 'text-yellow-600'}`} />
                <div>
                  {timeRemaining.expired ? (
                    <p className="font-semibold text-red-900">Voting deadline has passed</p>
                  ) : (
                    <p className="font-semibold text-yellow-900">
                      Voting deadline: {timeRemaining.days} day{timeRemaining.days !== 1 ? 's' : ''} and {timeRemaining.hours} hour{timeRemaining.hours !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Job Info */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{interviewSlot.job?.title || 'Position'}</p>
                <p className="text-sm text-gray-600">
                  Proposed by {interviewSlot.employer?.firstName} {interviewSlot.employer?.lastName}
                </p>
              </div>
              {interviewSlot.status === 'confirmed' && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Confirmed
                </Badge>
              )}
            </div>
          </Card>

          {/* Proposed Slots */}
          <div className="space-y-3">
            {interviewSlot.proposedSlots.map((slot: ProposedSlot, index: number) => {
              const vote = votes.find(v => v.slotIndex === index);
              const isRanked = vote?.rank && vote.rank > 0;

              return (
                <Card key={index} className={`p-4 ${isRanked ? 'border-blue-300 bg-blue-50' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Slot {index + 1}</Badge>
                      {slot.aiScore && slot.aiScore > 70 && (
                        <Badge className="bg-purple-100 text-purple-700">
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Recommended
                        </Badge>
                      )}
                      {isRanked && (
                        <Badge className="bg-blue-100 text-blue-700">
                          Rank #{vote.rank}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Availability:</Label>
                      <select
                        value={vote?.availability || 'available'}
                        onChange={(e) => updateVote(index, 'availability', e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="available">Available</option>
                        <option value="maybe">Maybe</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">{formatDateTime(slot.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(slot.endTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{slot.meetingType}</span>
                      {slot.location && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{slot.location}</span>
                        </>
                      )}
                    </div>
                    {slot.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">{slot.notes}</p>
                    )}
                  </div>

                  {/* Ranking */}
                  <div className="mb-3">
                    <Label className="text-sm font-semibold mb-2 block">Rank This Slot (1 = Most Preferred)</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rank) => (
                        <button
                          key={rank}
                          onClick={() => setRank(index, rank)}
                          className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                            vote?.rank === rank
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                          }`}
                        >
                          {rank}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Your Notes (Optional)</Label>
                    <Textarea
                      placeholder="Add any notes about this time slot..."
                      value={vote?.notes || ''}
                      onChange={(e) => updateVote(index, 'notes', e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Progress Indicator */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-900">Ranking Progress</p>
                <p className="text-sm text-blue-700">
                  {rankedVotes} of {totalSlots} slot{totalSlots !== 1 ? 's' : ''} ranked
                  {rankedVotes < minRequired && ` (minimum ${minRequired} required)`}
                </p>
              </div>
              {rankedVotes >= minRequired && (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready to Submit
                </Badge>
              )}
            </div>
          </Card>

          {/* Info Box */}
          <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">AI Auto-Confirmation:</p>
                <p className="text-gray-600">
                  If your top-ranked slot has high confidence (≥75%), the interview will be automatically confirmed.
                  Otherwise, the employer will review your preferences and confirm manually.
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || rankedVotes < minRequired || (timeRemaining?.expired)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Votes ({rankedVotes} ranked)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

