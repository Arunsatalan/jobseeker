"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video, Plus, Edit3, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Interview {
  id: string;
  candidateName: string;
  jobTitle: string;
  date: string;
  time: string;
  duration: string;
  interviewer: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  meetingLink?: string;
  notes?: string;
}

export function InterviewScheduling() {
  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: "1",
      candidateName: "Sarah Johnson",
      jobTitle: "Senior Frontend Developer",
      date: "2025-12-18",
      time: "10:00 AM",
      duration: "60 minutes",
      interviewer: "John Smith",
      status: "Scheduled",
      meetingLink: "https://meet.google.com/abc-defg-hij",
    },
    {
      id: "2",
      candidateName: "Mike Chen",
      jobTitle: "Product Manager",
      date: "2025-12-19",
      time: "2:00 PM",
      duration: "45 minutes",
      interviewer: "Jane Doe",
      status: "Scheduled",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-slate-100 text-slate-900";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Scheduling</h1>
          <p className="text-gray-600">Manage interviews and calendar</p>
        </div>
        <Button className="text-white" style={{ backgroundColor: '#02243b' }}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Calendar View (Simplified) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Interviews</h3>
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div key={interview.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">{new Date(interview.date).getDate()}</p>
                  <p className="text-xs text-gray-600">{new Date(interview.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{interview.candidateName}</h4>
                    <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {interview.time}
                    </span>
                    <span>{interview.duration}</span>
                    <span>with {interview.interviewer}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {interview.meetingLink && (
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}