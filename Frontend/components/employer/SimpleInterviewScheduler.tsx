"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2, Sparkles, Loader2, Video, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface TimeSlot {
  startTime: string;
  endTime: string;
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  location?: string;
  notes?: string;
}

interface InterviewTemplate {
  id: string;
  name: string;
  duration: number;
  meetingType: 'video' | 'phone' | 'in-person';
  defaultNotes: string;
}

interface SimpleInterviewSchedulerProps {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const INTERVIEW_TEMPLATES: InterviewTemplate[] = [
  {
    id: 'technical',
    name: 'Technical Screen',
    duration: 60,
    meetingType: 'video',
    defaultNotes: 'Technical assessment and coding discussion',
  },
  {
    id: 'culture',
    name: 'Culture Fit',
    duration: 45,
    meetingType: 'video',
    defaultNotes: 'Get to know each other and discuss company culture',
  },
  {
    id: 'final',
    name: 'Final Round',
    duration: 90,
    meetingType: 'video',
    defaultNotes: 'Final interview with team members',
  },
];

export function SimpleInterviewScheduler({
  applicationId,
  candidateName,
  jobTitle,
  open,
  onOpenChange,
  onSuccess,
}: SimpleInterviewSchedulerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<InterviewTemplate | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [meetingType, setMeetingType] = useState<'video' | 'phone' | 'in-person'>('video');
  const [defaultMeetingLink, setDefaultMeetingLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAISuggestions, setLoadingAISuggestions] = useState(false);
  const { toast } = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (open) {
      // Load AI suggestions when dialog opens
      loadAISuggestions();
    } else {
      // Reset when dialog closes
      setTimeSlots([]);
      setSelectedTemplate(null);
      setDefaultMeetingLink('');
    }
  }, [open, applicationId]);

  const loadAISuggestions = async () => {
    setLoadingAISuggestions(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 14); // Next 2 weeks

      const response = await axios.get(
        `${apiUrl}/api/v1/interviews/ai-suggestions`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            durationMinutes: selectedTemplate?.duration || 60,
          },
        }
      );

      if (response.data.success && response.data.data.suggestions) {
        const suggestions = response.data.data.suggestions;
        if (suggestions.recommendedSlots && suggestions.recommendedSlots.length > 0) {
          // Auto-populate with AI suggestions
          const suggestedSlots = suggestions.recommendedSlots.slice(0, 5).map((slot: any) => ({
            startTime: slot.start,
            endTime: slot.end,
            meetingType: meetingType,
            meetingLink: defaultMeetingLink,
            location: '',
            notes: selectedTemplate?.defaultNotes || '',
          }));
          setTimeSlots(suggestedSlots);
        }
      }
    } catch (error) {
      // AI suggestions are optional, don't show error
      console.log('AI suggestions not available');
    } finally {
      setLoadingAISuggestions(false);
    }
  };

  const applyTemplate = (template: InterviewTemplate) => {
    setSelectedTemplate(template);
    setMeetingType(template.meetingType);
    
    // Clear existing slots and let AI suggest new ones
    setTimeSlots([]);
    loadAISuggestions();
  };

  const addTimeSlot = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Default to 2 hours from now
    const endTime = new Date(now);
    endTime.setMinutes(endTime.getMinutes() + (selectedTemplate?.duration || 60));

    setTimeSlots([
      ...timeSlots,
      {
        startTime: now.toISOString().slice(0, 16),
        endTime: endTime.toISOString().slice(0, 16),
        meetingType: meetingType,
        meetingLink: defaultMeetingLink,
        location: '',
        notes: selectedTemplate?.defaultNotes || '',
      },
    ]);
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updated = timeSlots.map((slot, i) => {
      if (i === index) {
        return { ...slot, [field]: value };
      }
      return slot;
    });
    setTimeSlots(updated);
  };

  const handleSubmit = async () => {
    if (timeSlots.length === 0) {
      toast({
        title: "No Time Slots",
        description: "Please add at least one interview time slot.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Convert to proposed slots format (simplified - no voting deadline)
      const proposedSlots = timeSlots.map(slot => ({
        startTime: new Date(slot.startTime).toISOString(),
        endTime: new Date(slot.endTime).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        meetingType: slot.meetingType,
        meetingLink: slot.meetingLink || defaultMeetingLink,
        location: slot.location || '',
        notes: slot.notes || '',
      }));

      const response = await axios.post(
        `${apiUrl}/api/v1/interviews/propose`,
        {
          applicationId,
          proposedSlots,
          meetingType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Interview Times Sent! ✨",
          description: `${candidateName} will receive ${timeSlots.length} time option${timeSlots.length > 1 ? 's' : ''} to choose from.`,
        });
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Failed to Send",
        description: error.response?.data?.message || "Unable to send interview times. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Schedule Interview</DialogTitle>
          <DialogDescription className="text-base">
            Send interview time options to <strong>{candidateName}</strong> for <strong>{jobTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Interview Templates */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Quick Templates</Label>
            <div className="grid grid-cols-3 gap-2">
              {INTERVIEW_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate?.id === template.id ? 'default' : 'outline'}
                  onClick={() => applyTemplate(template)}
                  className="justify-start"
                  style={selectedTemplate?.id === template.id ? { backgroundColor: '#02243b' } : {}}
                >
                  <CheckCircle2 className={`h-4 w-4 mr-2 ${selectedTemplate?.id === template.id ? '' : 'opacity-0'}`} />
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Meeting Type */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">Meeting Type</Label>
            <div className="flex gap-2">
              {(['video', 'phone', 'in-person'] as const).map((type) => (
                <Button
                  key={type}
                  variant={meetingType === type ? 'default' : 'outline'}
                  onClick={() => setMeetingType(type)}
                  className="capitalize"
                  style={meetingType === type ? { backgroundColor: '#02243b' } : {}}
                >
                  {type === 'video' && <Video className="h-4 w-4 mr-2" />}
                  {type === 'phone' && <Phone className="h-4 w-4 mr-2" />}
                  {type === 'in-person' && <MapPin className="h-4 w-4 mr-2" />}
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Default Meeting Link */}
          {meetingType === 'video' && (
            <div>
              <Label htmlFor="meetingLink" className="text-sm font-semibold mb-2 block">
                Default Meeting Link (Optional)
              </Label>
              <Input
                id="meetingLink"
                type="text"
                placeholder="https://meet.google.com/..."
                value={defaultMeetingLink}
                onChange={(e) => setDefaultMeetingLink(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                This link will be used for all video interviews. You can override for individual slots.
              </p>
            </div>
          )}

          {/* AI Suggestions Loading */}
          {loadingAISuggestions && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              <p className="text-sm text-amber-900">AI is finding the best times based on your calendar...</p>
            </div>
          )}

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-semibold">Available Time Slots</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addTimeSlot}
                className="text-[#02243b] border-[#02243b]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Time
              </Button>
            </div>

            {timeSlots.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">
                  No time slots added yet. Click "Add Time" or use a template above.
                </p>
                <Button
                  variant="outline"
                  onClick={addTimeSlot}
                  style={{ borderColor: '#02243b', color: '#02243b' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Time Slot
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {timeSlots.map((slot, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">Start Time</Label>
                          <Input
                            type="datetime-local"
                            value={slot.startTime}
                            onChange={(e) => {
                              const newStart = e.target.value;
                              updateTimeSlot(index, 'startTime', newStart);
                              // Auto-update end time to maintain duration
                              if (selectedTemplate) {
                                const start = new Date(newStart);
                                const end = new Date(start);
                                end.setMinutes(end.getMinutes() + selectedTemplate.duration);
                                updateTimeSlot(index, 'endTime', end.toISOString().slice(0, 16));
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600 mb-1 block">End Time</Label>
                          <Input
                            type="datetime-local"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                          />
                        </div>
                        {meetingType === 'video' && (
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Meeting Link (Optional)</Label>
                            <Input
                              type="text"
                              placeholder="Override default link"
                              value={slot.meetingLink || ''}
                              onChange={(e) => updateTimeSlot(index, 'meetingLink', e.target.value)}
                            />
                          </div>
                        )}
                        {meetingType === 'in-person' && (
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">Location</Label>
                            <Input
                              type="text"
                              placeholder="Office address"
                              value={slot.location || ''}
                              onChange={(e) => updateTimeSlot(index, 'location', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Textarea
                        placeholder="Additional notes for this time slot (optional)"
                        value={slot.notes || ''}
                        onChange={(e) => updateTimeSlot(index, 'notes', e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || timeSlots.length === 0}
              className="text-white px-8"
              style={{ backgroundColor: '#02243b' }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Send {timeSlots.length} Time Option{timeSlots.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

