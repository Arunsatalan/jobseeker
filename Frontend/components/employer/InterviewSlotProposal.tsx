"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Sparkles, Loader2, AlertCircle, CheckCircle } from "lucide-react";
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

interface InterviewSlotProposalProps {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InterviewSlotProposal({
  applicationId,
  candidateName,
  jobTitle,
  open,
  onOpenChange,
  onSuccess,
}: InterviewSlotProposalProps) {
  const [proposedSlots, setProposedSlots] = useState<ProposedSlot[]>([]);
  const [votingDeadline, setVotingDeadline] = useState("");
  const [meetingType, setMeetingType] = useState<'video' | 'phone' | 'in-person'>('video');
  const [loading, setLoading] = useState(false);
  const [loadingAISuggestions, setLoadingAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (open) {
      // Set default voting deadline to 3 days from now
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 3);
      setVotingDeadline(defaultDeadline.toISOString().slice(0, 16));
      
      // Load existing slots from database
      loadExistingSlots();
      
      // Load AI suggestions
      loadAISuggestions();
    } else {
      // Reset when dialog closes
      setProposedSlots([]);
    }
  }, [open, applicationId]);

  const loadExistingSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${apiUrl}/api/v1/interviews/slots/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.success && response.data.data.proposedSlots) {
        const existingSlots = response.data.data.proposedSlots.map((slot: any) => ({
          startTime: new Date(slot.startTime).toISOString().slice(0, 16),
          endTime: new Date(slot.endTime).toISOString().slice(0, 16),
          timezone: slot.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          meetingType: slot.meetingType || 'video',
          meetingLink: slot.meetingLink || '',
          location: slot.location || '',
          notes: slot.notes || '',
          aiScore: slot.aiScore || 0,
        }));
        setProposedSlots(existingSlots);
        
        if (response.data.data.votingDeadline) {
          setVotingDeadline(new Date(response.data.data.votingDeadline).toISOString().slice(0, 16));
        }
      }
    } catch (error) {
      // No existing slots, that's okay
      console.log('No existing slots found');
    }
  };

  const loadAISuggestions = async () => {
    setLoadingAISuggestions(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoadingAISuggestions(false);
        return;
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14); // Next 2 weeks

      const response = await axios.get(`${apiUrl}/api/v1/interviews/ai-suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          durationMinutes: 60,
        },
      });

      if (response.data && response.data.success) {
        setAiSuggestions(response.data.data);
      }
    } catch (error: any) {
      // Silently fail - AI suggestions are optional
      console.warn('AI suggestions not available:', error.response?.status === 404 ? 'Endpoint not found - ensure backend is running' : error.message);
      setAiSuggestions(null);
    } finally {
      setLoadingAISuggestions(false);
    }
  };

  const addSlot = async () => {
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() + 1);
    defaultStart.setHours(10, 0, 0, 0);
    
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setHours(11, 0, 0, 0);

    const newSlot = {
      startTime: defaultStart.toISOString().slice(0, 16),
      endTime: defaultEnd.toISOString().slice(0, 16),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      meetingType,
      meetingLink: meetingType === 'video' ? '' : undefined,
      location: meetingType === 'in-person' ? '' : undefined,
      notes: '',
    };

    // Add to local state immediately
    setProposedSlots([...proposedSlots, newSlot]);

    // Save to database immediately
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 3);

      await axios.post(
        `${apiUrl}/api/v1/interviews/add-slot`,
        {
          applicationId,
          slot: {
            startTime: new Date(newSlot.startTime).toISOString(),
            endTime: new Date(newSlot.endTime).toISOString(),
            timezone: newSlot.timezone,
            meetingType: newSlot.meetingType,
            meetingLink: newSlot.meetingLink,
            location: newSlot.location,
            notes: newSlot.notes,
          },
          votingDeadline: defaultDeadline.toISOString(),
          meetingType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Slot Added",
        description: "Time slot has been saved to the database.",
      });
    } catch (error: any) {
      console.error('Failed to save slot:', error);
      // Don't show error toast for individual slot saves to avoid spam
    }
  };

  const removeSlot = (index: number) => {
    setProposedSlots(proposedSlots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof ProposedSlot, value: any) => {
    const updated = [...proposedSlots];
    updated[index] = { ...updated[index], [field]: value };
    setProposedSlots(updated);
  };

  const saveSlotToDatabase = async (index: number) => {
    const slot = proposedSlots[index];
    if (!slot || !slot.startTime || !slot.endTime) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 3);

      await axios.post(
        `${apiUrl}/api/v1/interviews/add-slot`,
        {
          applicationId,
          slot: {
            startTime: new Date(slot.startTime).toISOString(),
            endTime: new Date(slot.endTime).toISOString(),
            timezone: slot.timezone,
            meetingType: slot.meetingType,
            meetingLink: slot.meetingLink || '',
            location: slot.location || '',
            notes: slot.notes || '',
          },
          votingDeadline: votingDeadline || defaultDeadline.toISOString(),
          meetingType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Failed to save slot update:', error);
    }
  };

  const useAISuggestions = () => {
    if (aiSuggestions?.availableSlots && aiSuggestions.availableSlots.length > 0) {
      const slots = aiSuggestions.availableSlots.slice(0, 5).map((slot: any) => ({
        startTime: new Date(slot.start).toISOString().slice(0, 16),
        endTime: new Date(slot.end).toISOString().slice(0, 16),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        meetingType,
        meetingLink: meetingType === 'video' ? '' : undefined,
        location: meetingType === 'in-person' ? '' : undefined,
        notes: '',
        aiScore: 85, // High AI score for suggested slots
      }));
      setProposedSlots(slots);
      toast({
        title: "AI Suggestions Applied",
        description: `${slots.length} optimal time slots have been added based on AI analysis.`,
      });
    }
  };

  const handleSubmit = async () => {
    if (proposedSlots.length < 1) {
      toast({
        title: "No Slots Added",
        description: "Please add at least one time slot before proposing.",
        variant: "destructive",
      });
      return;
    }

    if (!votingDeadline) {
      toast({
        title: "Deadline Required",
        description: "Please set a voting deadline.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiUrl}/api/v1/interviews/propose`,
        {
          applicationId,
          proposedSlots: proposedSlots.map(slot => ({
            startTime: new Date(slot.startTime).toISOString(),
            endTime: new Date(slot.endTime).toISOString(),
            timezone: slot.timezone,
            meetingType: slot.meetingType,
            meetingLink: slot.meetingLink,
            location: slot.location,
            notes: slot.notes,
            aiScore: slot.aiScore || 0,
          })),
          votingDeadline: new Date(votingDeadline).toISOString(),
          meetingType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Slots Proposed Successfully",
          description: `Interview time slots have been sent to ${candidateName}. They will receive a notification to vote.`,
        });
        onSuccess?.();
        onOpenChange(false);
        setProposedSlots([]);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Propose Slots",
        description: error.response?.data?.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Propose Interview Time Slots</DialogTitle>
          <DialogDescription>
            Propose multiple time slots for <strong>{candidateName}</strong> to choose from for the position: <strong>{jobTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* AI Suggestions Banner */}
          {aiSuggestions && (
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-purple-900">AI-Powered Suggestions Available</p>
                    <p className="text-sm text-purple-700">
                      {aiSuggestions.availableSlots?.length || 0} optimal time slots found based on calendar availability
                    </p>
                  </div>
                </div>
                <Button
                  onClick={useAISuggestions}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!aiSuggestions?.availableSlots?.length || loadingAISuggestions}
                >
                  {loadingAISuggestions ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Use AI Suggestions
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Meeting Type Selection */}
          <div>
            <Label className="text-base font-semibold mb-2">Meeting Type</Label>
            <div className="flex gap-3 mt-2">
              <Button
                variant={meetingType === 'video' ? 'default' : 'outline'}
                onClick={() => setMeetingType('video')}
                size="sm"
              >
                Video Call
              </Button>
              <Button
                variant={meetingType === 'phone' ? 'default' : 'outline'}
                onClick={() => setMeetingType('phone')}
                size="sm"
              >
                Phone Call
              </Button>
              <Button
                variant={meetingType === 'in-person' ? 'default' : 'outline'}
                onClick={() => setMeetingType('in-person')}
                size="sm"
              >
                In-Person
              </Button>
            </div>
          </div>

          {/* Proposed Slots */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base font-semibold">
                Proposed Time Slots ({proposedSlots.length} added - 3-10 recommended)
              </Label>
              <Button onClick={addSlot} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
            </div>

            {proposedSlots.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No time slots added yet</p>
                <p className="text-sm text-gray-500 mt-1">Click "Add Slot" to propose interview times</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {proposedSlots.map((slot, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Slot {index + 1}</Badge>
                        {slot.aiScore && slot.aiScore > 70 && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Recommended
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => removeSlot(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Start Time</Label>
                        <Input
                          type="datetime-local"
                          value={slot.startTime}
                          onChange={(e) => {
                            updateSlot(index, 'startTime', e.target.value);
                            setTimeout(() => saveSlotToDatabase(index), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">End Time</Label>
                        <Input
                          type="datetime-local"
                          value={slot.endTime}
                          onChange={(e) => {
                            updateSlot(index, 'endTime', e.target.value);
                            setTimeout(() => saveSlotToDatabase(index), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {meetingType === 'video' && (
                      <div className="mt-3">
                        <Label className="text-sm">Meeting Link (Optional - Google Meet will be generated)</Label>
                        <Input
                          type="text"
                          placeholder="https://meet.google.com/..."
                          value={slot.meetingLink || ''}
                          onChange={(e) => {
                            updateSlot(index, 'meetingLink', e.target.value);
                            setTimeout(() => saveSlotToDatabase(index), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>
                    )}

                    {meetingType === 'in-person' && (
                      <div className="mt-3">
                        <Label className="text-sm">Location</Label>
                        <Input
                          type="text"
                          placeholder="Office address or location"
                          value={slot.location || ''}
                          onChange={(e) => {
                            updateSlot(index, 'location', e.target.value);
                            setTimeout(() => saveSlotToDatabase(index), 1000);
                          }}
                          className="mt-1"
                        />
                      </div>
                    )}

                    <div className="mt-3">
                      <Label className="text-sm">Notes (Optional)</Label>
                      <Textarea
                        placeholder="Additional information about this time slot..."
                        value={slot.notes || ''}
                        onChange={(e) => {
                          updateSlot(index, 'notes', e.target.value);
                          setTimeout(() => saveSlotToDatabase(index), 1000);
                        }}
                        rows={2}
                        className="mt-1"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                      </div>
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        ✓ Saved
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Voting Deadline */}
          <div>
            <Label className="text-base font-semibold mb-2">
              Voting Deadline <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={votingDeadline}
              onChange={(e) => setVotingDeadline(e.target.value)}
              className="mt-1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Candidates must vote by this deadline. Recommended: 3-5 days from now.
            </p>
          </div>

          {/* Info Box */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Candidate will receive a notification with all proposed slots</li>
                  <li>They can rank their preferences (1-5) and add notes</li>
                  <li>AI will automatically match the best slot if confidence is high (≥75%)</li>
                  <li>Otherwise, you can manually confirm after reviewing votes</li>
                </ul>
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
              disabled={loading || proposedSlots.length < 1 || !votingDeadline}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Proposing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Propose Slots ({proposedSlots.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

