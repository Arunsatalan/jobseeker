"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Clock, CheckCircle2, Sparkles, Loader2, Video, Phone, MapPin, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CalendarSyncButton } from "./CalendarSyncButton";
import { SmartReminders } from "./SmartReminders";
import { formatTimeInTimezone, getTimezoneAbbreviation, type CalendarEvent } from "@/utils/calendarIntegration";
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

interface InterviewBookingProps {
  applicationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InterviewBooking({
  applicationId,
  open,
  onOpenChange,
  onSuccess,
}: InterviewBookingProps) {
  const [interviewSlot, setInterviewSlot] = useState<any>(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>('');
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Auto-detect user's timezone
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    
    if (open && applicationId) {
      loadInterviewSlots();
    }
  }, [open, applicationId]);

  const loadInterviewSlots = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${apiUrl}/api/v1/interviews/slots/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        setInterviewSlot(data);
        
        // Auto-select AI-recommended slot if available
        if (data.proposedSlots && data.proposedSlots.length > 0) {
          const recommendedSlot = data.proposedSlots.findIndex(
            (slot: any) => slot.aiScore && slot.aiScore >= 80
          );
          if (recommendedSlot !== -1) {
            setSelectedSlotIndex(recommendedSlot);
          }
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

  const handleOneClickBooking = async () => {
    if (selectedSlotIndex === null) {
      toast({
        title: "Please Select a Time",
        description: "Choose your preferred interview time slot.",
        variant: "destructive",
      });
      return;
    }

    setBooking(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const slot = interviewSlot.proposedSlots[selectedSlotIndex];
      
      // Directly confirm the selected slot (no voting needed)
      const response = await axios.post(
        `${apiUrl}/api/v1/interviews/confirm`,
        {
          interviewSlotId: interviewSlot._id,
          slotIndex: selectedSlotIndex,
          notes: `Selected via one-click booking`,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Interview Scheduled! 🎉",
          description: "Your interview has been confirmed. You can add it to your calendar below.",
        });
        
        // Don't auto-open calendar - let user choose their preferred calendar
        // The calendar sync button will be shown in the success state
        
        onSuccess?.();
        // Keep dialog open briefly to show calendar sync option
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.response?.data?.message || "Unable to book interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };


  const getTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Soon';
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in-person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Interview Times</DialogTitle>
            <DialogDescription>Finding the best times for your interview...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#02243b' }} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!interviewSlot || !interviewSlot.proposedSlots || interviewSlot.proposedSlots.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No Interview Times Available</DialogTitle>
            <DialogDescription>
              The employer hasn't proposed any interview times yet. You'll be notified when times become available.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)} className="w-full" style={{ backgroundColor: '#02243b' }}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // Sort slots by AI score (highest first) and then by time
  const sortedSlots = [...interviewSlot.proposedSlots].sort((a: any, b: any) => {
    if (b.aiScore !== a.aiScore) return (b.aiScore || 0) - (a.aiScore || 0);
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Schedule Your Interview</DialogTitle>
          <DialogDescription className="text-base">
            Choose a time that works best for you. We've highlighted the recommended times based on your preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* AI Recommended Badge */}
          {sortedSlots[0]?.aiScore && sortedSlots[0].aiScore >= 80 && (
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <p className="text-sm font-medium text-amber-900">
                AI Recommended: We've highlighted the best times based on your schedule patterns
              </p>
            </div>
          )}

          {/* Time Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedSlots.map((slot: any, index: number) => {
              const originalIndex = interviewSlot.proposedSlots.findIndex(
                (s: any) => s.startTime === slot.startTime
              );
              const isSelected = selectedSlotIndex === originalIndex;
              const isRecommended = slot.aiScore && slot.aiScore >= 80;
              const isPast = new Date(slot.startTime) < new Date();

              return (
                <Card
                  key={originalIndex}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-offset-2 border-2'
                      : 'hover:shadow-md border'
                  } ${
                    isSelected
                      ? 'ring-[#02243b] border-[#02243b] bg-[#f5f3f0]'
                      : isRecommended
                      ? 'border-amber-300 bg-amber-50/50'
                      : 'border-gray-200'
                  } ${isPast ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isPast && setSelectedSlotIndex(originalIndex)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {isRecommended && (
                          <Badge className="bg-amber-500 text-white text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        {isSelected && (
                          <Badge className="bg-[#02243b] text-white text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        )}
                        {getMeetingTypeIcon(slot.meetingType)}
                        <span className="text-xs text-gray-600 capitalize">{slot.meetingType}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900">
                          {formatTimeInTimezone(slot.startTime, slot.timezone || userTimezone)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Duration: {Math.round(
                            (new Date(slot.endTime).getTime() - new Date(slot.startTime).getTime()) / (1000 * 60)
                          )} minutes
                          <span className="text-xs text-gray-500 ml-1">
                            ({getTimezoneAbbreviation(slot.timezone || userTimezone)})
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {getTimeUntil(slot.startTime)} from now
                        </p>
                        {slot.location && (
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {slot.location}
                          </p>
                        )}
                        {slot.notes && (
                          <p className="text-xs text-gray-600 mt-1 italic">{slot.notes}</p>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="ml-2">
                        <div className="h-6 w-6 rounded-full bg-[#02243b] flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Selected Slot Summary */}
          {selectedSlotIndex !== null && (
            <Card className="p-4 bg-gradient-to-r from-[#f5f3f0] to-amber-50 border-2 border-[#02243b]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Selected Time</p>
                    <p className="text-sm text-gray-700">
                      {formatTimeInTimezone(
                        interviewSlot.proposedSlots[selectedSlotIndex].startTime,
                        interviewSlot.proposedSlots[selectedSlotIndex].timezone || userTimezone
                      )}
                      <span className="text-xs text-gray-500 ml-1">
                        ({getTimezoneAbbreviation(interviewSlot.proposedSlots[selectedSlotIndex].timezone || userTimezone)})
                      </span>
                    </p>
                    {interviewSlot.proposedSlots[selectedSlotIndex].meetingLink && (
                      <p className="text-xs text-gray-600 mt-1">
                        Video meeting link will be provided
                      </p>
                    )}
                    {/* Smart Reminders Preview */}
                    <SmartReminders 
                      startTime={interviewSlot.proposedSlots[selectedSlotIndex].startTime}
                      className="mt-2"
                    />
                  </div>
                  <Button
                    onClick={handleOneClickBooking}
                    disabled={booking}
                    className="text-white px-6"
                    style={{ backgroundColor: '#02243b' }}
                  >
                    {booking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Confirm Interview
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Calendar Sync Preview (shown before booking) */}
                {!booking && (
                  <div className="pt-2 border-t border-amber-200">
                    <p className="text-xs text-gray-600 mb-2">After confirming, add to your calendar:</p>
                    <CalendarSyncButton
                      event={{
                        title: `${interviewSlot.job?.title || 'Interview'} Interview`,
                        description: `Interview scheduled via job application`,
                        startTime: new Date(interviewSlot.proposedSlots[selectedSlotIndex].startTime),
                        endTime: new Date(interviewSlot.proposedSlots[selectedSlotIndex].endTime),
                        location: interviewSlot.proposedSlots[selectedSlotIndex].location,
                        meetingLink: interviewSlot.proposedSlots[selectedSlotIndex].meetingLink,
                        timezone: interviewSlot.proposedSlots[selectedSlotIndex].timezone || userTimezone,
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Helpful Message */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">What happens next?</p>
                <p className="text-xs">
                  Once you confirm, the interview will be automatically added to your calendar. 
                  You'll receive reminders 1 day and 1 hour before the interview.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

