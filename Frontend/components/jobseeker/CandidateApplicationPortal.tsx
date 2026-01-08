"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  MapPin,
  Building2,
  AlertCircle,
  MessageSquare,
  Phone,
  Star,
  Eye,
  Filter,
  BarChart3,
  Bell,
  Download,
  Send,
  XCircle,
  FileText,
  Video,
  Loader2,
  RefreshCw,
  ChevronRight,
  Mail,
  User,
  Sparkles,
  Search,
} from "lucide-react";
import axios from "axios";
import { InterviewSlotVoting } from "./InterviewSlotVoting";
import { InterviewBooking } from "./InterviewBooking";
import { CalendarSyncButton } from "./CalendarSyncButton";
import { SmartReminders } from "./SmartReminders";
import { formatTimeInTimezone, getTimezoneAbbreviation, type CalendarEvent } from "@/utils/calendarIntegration";

interface Application {
  _id: string;
  id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location?: string;
    employer?: string;
  } | string;
  employer?: {
    _id: string;
    firstName?: string;
    lastName?: string;
  } | string;
  status: string;
  appliedAt: string;
  coverLetter?: string;
  resume?: any;
  rating?: number;
  notes?: string;
  interviewDate?: string;
  interviewLink?: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedJob?: string;
}

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedJob?: string;
  relatedApplication?: string;
}

export function CandidateApplicationPortal() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'interview' | 'accepted' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState<string | null>(null);
  const [selectedApplicationForMessage, setSelectedApplicationForMessage] = useState<Application | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversations, setConversations] = useState<{ [key: string]: Message[] }>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [pendingInterviews, setPendingInterviews] = useState<any[]>([]);
  const [confirmedInterviews, setConfirmedInterviews] = useState<any[]>([]);
  const [selectedInterviewForVoting, setSelectedInterviewForVoting] = useState<string | null>(null);
  const [showVotingDialog, setShowVotingDialog] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/v1/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 100 },
      });

      if (response.data.success) {
        const apps = response.data.data || [];
        setApplications(apps.map((app: any) => ({
          ...app,
          id: app._id,
        })));
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 },
      });

      if (response.data.success) {
        // Handle both response formats: { data: { notifications: [...] } } or { data: [...] }
        const notifs = response.data.data?.notifications || response.data.data || response.data.notifications || [];
        setNotifications(Array.isArray(notifs) ? notifs : []);
        setUnreadNotifications(Array.isArray(notifs) ? notifs.filter((n: Notification) => !n.isRead).length : 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, [apiUrl]);

  // Fetch conversation with employer
  const fetchConversation = useCallback(async (employerId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/v1/messages/conversation/${employerId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 },
      });

      if (response.data.success) {
        setConversations(prev => ({
          ...prev,
          [employerId]: response.data.data || [],
        }));
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  }, [apiUrl]);

  // Send message
  const sendMessage = async () => {
    if (!selectedEmployer || !messageContent.trim()) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Get job title and job ID from the application context
      const appForMessage = selectedApplicationForMessage || selectedApplication;
      const jobDetails = appForMessage ? getJobDetails(appForMessage) : null;
      const jobTitle = jobDetails?.title || null;
      const jobId = jobDetails?.jobId || null;

      const response = await axios.post(
        `${apiUrl}/api/v1/messages`,
        {
          recipient: selectedEmployer,
          content: messageContent,
          type: 'text',
          relatedJob: jobId,
          jobTitle: jobTitle,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMessageContent("");
        // Reload conversation immediately
        if (selectedEmployer) {
          await fetchConversation(selectedEmployer);
        }
        // Show success message
        alert('Message sent successfully! The employer will be notified via email and in-app notification.');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(
        `${apiUrl}/api/v1/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Fetch interview schedules
  const fetchInterviewSchedules = useCallback(async () => {
    setLoadingInterviews(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch pending interviews (voting status)
      const pendingResponse = await axios.get(`${apiUrl}/api/v1/interviews/candidate/slots`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'voting' },
      });

      if (pendingResponse.data.success) {
        setPendingInterviews(pendingResponse.data.data || []);
      }

      // Fetch confirmed interviews
      const confirmedResponse = await axios.get(`${apiUrl}/api/v1/interviews/candidate/slots`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: 'confirmed' },
      });

      if (confirmedResponse.data.success) {
        setConfirmedInterviews(confirmedResponse.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load interview schedules:', error);
    } finally {
      setLoadingInterviews(false);
    }
  }, [apiUrl]);

  // Real-time polling (can be upgraded to WebSocket)
  useEffect(() => {
    fetchApplications();
    fetchNotifications();
    fetchInterviewSchedules();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchApplications();
      fetchNotifications();
      fetchInterviewSchedules();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchApplications, fetchNotifications, fetchInterviewSchedules]);

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

  // Get status color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "applied":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "shortlisted":
      case "shortlist":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "interview":
      case "interviewing":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "accepted":
      case "hired":
        return "bg-green-100 text-green-700 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "applied":
        return <Clock className="h-4 w-4" />;
      case "shortlisted":
      case "shortlist":
        return <Star className="h-4 w-4" />;
      case "interview":
      case "interviewing":
        return <Video className="h-4 w-4" />;
      case "accepted":
      case "hired":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "applied":
        return "Application Received";
      case "shortlisted":
      case "shortlist":
        return "Shortlisted";
      case "interview":
      case "interviewing":
        return "Interview Scheduled";
      case "accepted":
      case "hired":
        return "Accepted";
      case "rejected":
        return "Not Selected";
      default:
        return status;
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (typeof app.job === 'object' ? app.job.title : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof app.job === 'object' ? app.job.company : '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const statusLower = app.status.toLowerCase();
    switch (filter) {
      case 'active':
        return ['applied', 'shortlisted', 'interview', 'interviewing'].includes(statusLower);
      case 'interview':
        return ['interview', 'interviewing'].includes(statusLower);
      case 'accepted':
        return ['accepted', 'hired'].includes(statusLower);
      case 'rejected':
        return statusLower === 'rejected';
      default:
        return true;
    }
  });

  // Calculate stats
  const stats = {
    total: applications.length,
    active: applications.filter(app => {
      const s = app.status.toLowerCase();
      return ['applied', 'shortlisted', 'interview', 'interviewing'].includes(s);
    }).length,
    interviews: applications.filter(app => {
      const s = app.status.toLowerCase();
      return ['interview', 'interviewing'].includes(s);
    }).length,
    accepted: applications.filter(app => {
      const s = app.status.toLowerCase();
      return ['accepted', 'hired'].includes(s);
    }).length,
  };

  // Get job details helper
  const getJobDetails = (app: Application) => {
    if (typeof app.job === 'object') {
      return {
        title: app.job.title,
        company: app.job.company,
        location: app.job.location || 'Location not specified',
        jobId: app.job._id,
      };
    }
    return {
      title: 'Position',
      company: 'Company',
      location: 'Location not specified',
      jobId: app.job,
    };
  };

  // Get employer ID from application
  const getEmployerId = (app: Application): string | null => {
    // Try to get from employer field (populated)
    if (app.employer) {
      if (typeof app.employer === 'object' && app.employer._id) {
        return app.employer._id.toString();
      }
      if (typeof app.employer === 'string') {
        return app.employer;
      }
    }
    // Try to get from job.employer (populated)
    if (typeof app.job === 'object' && app.job.employer) {
      if (typeof app.job.employer === 'object' && app.job.employer._id) {
        return app.job.employer._id.toString();
      }
      if (typeof app.job.employer === 'string') {
        return app.job.employer;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Track your job applications and communicate with employers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchApplications();
              fetchNotifications();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {unreadNotifications > 0 && (
            <Button
              variant="outline"
              className="relative"
              onClick={() => {
                // Scroll to notifications
                document.getElementById('notifications-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              <Badge className="ml-2 bg-red-500 text-white">{unreadNotifications}</Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f5f3f0' }}>
              <FileText className="h-6 w-6" style={{ color: '#02243b' }} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.active}</p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interviews</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.interviews}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.accepted}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Interview Schedules Section - Same as CareerProgress */}
      {(pendingInterviews.length > 0 || confirmedInterviews.length > 0) && (
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Video className="h-5 w-5" style={{ color: '#02243b' }} />
              Interview Schedules
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInterviewSchedules}
              disabled={loadingInterviews}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingInterviews ? 'animate-spin' : ''}`} />
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
                            setSelectedInterviewForVoting(applicationId);
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
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
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
                                    timezone: confirmedSlot.timezone || undefined,
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
        </Card>
      )}

      {/* Notifications Section */}
      {notifications.length > 0 && (
        <Card className="p-6" id="notifications-section">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" style={{ color: '#02243b' }} />
              <h2 className="text-xl font-bold text-gray-900">Recent Updates</h2>
              {unreadNotifications > 0 && (
                <Badge className="bg-red-500 text-white">{unreadNotifications} new</Badge>
              )}
            </div>
            <span className="text-xs text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 5).map((notif) => (
              <div
                key={notif._id}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notif.isRead ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
                onClick={() => markNotificationAsRead(notif._id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-2 w-2 rounded-full mt-2 ${!notif.isRead ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'interview', 'accepted', 'rejected'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
                style={filter === f ? { backgroundColor: '#02243b' } : {}}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Applications List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const jobDetails = getJobDetails(app);
            const appliedDate = new Date(app.appliedAt);
            const daysSinceApplied = Math.floor((new Date().getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card
                key={app._id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedApplication(app)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{jobDetails.title}</h3>
                      <Badge className={`${getStatusColor(app.status)} border flex items-center gap-1`}>
                        {getStatusIcon(app.status)}
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {jobDetails.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {jobDetails.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied {daysSinceApplied === 0 ? 'today' : `${daysSinceApplied} day${daysSinceApplied > 1 ? 's' : ''} ago`}
                      </span>
                    </div>

                    {/* Status-specific information */}
                    {app.status.toLowerCase() === 'interview' || app.status.toLowerCase() === 'interviewing' ? (
                      <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm mb-3">
                          <Video className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-900">Interview Scheduled</span>
                        </div>
                        {app.interviewDate && (
                          <p className="text-xs text-purple-700 mb-3">
                            {new Date(app.interviewDate).toLocaleString()}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          {app.interviewLink && (
                            <Button
                              size="sm"
                              className="text-white"
                              style={{ backgroundColor: '#02243b' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(app.interviewLink, '_blank');
                              }}
                            >
                              <Video className="h-3 w-3 mr-1" />
                              Join Interview
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-purple-300 text-purple-700 hover:bg-purple-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              const employerId = getEmployerId(app);
                              if (employerId) {
                                setSelectedEmployer(employerId);
                                setSelectedApplicationForMessage(app);
                                setShowMessageDialog(true);
                                fetchConversation(employerId);
                              } else {
                                alert('Employer information not available. Please contact support.');
                              }
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message Employer
                          </Button>
                        </div>
                      </div>
                    ) : app.status.toLowerCase() === 'shortlisted' || app.status.toLowerCase() === 'shortlist' ? (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                          <span className="font-medium text-amber-900">Great news! Your application has been shortlisted.</span>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                          The employer is reviewing your profile. You may be contacted for an interview soon.
                        </p>
                      </div>
                    ) : app.status.toLowerCase() === 'accepted' || app.status.toLowerCase() === 'hired' ? (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-900">Congratulations! Your application was accepted.</span>
                        </div>
                      </div>
                    ) : app.status.toLowerCase() === 'rejected' ? (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-900">Application Status: Not Selected</span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">
                          Thank you for your interest. We've decided to move forward with other candidates.
                        </p>
                      </div>
                    ) : null}

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                      {/* Show message button for all statuses except rejected */}
                      {app.status.toLowerCase() !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className={app.status.toLowerCase() === 'interview' || app.status.toLowerCase() === 'interviewing' 
                            ? 'border-purple-300 text-purple-700 hover:bg-purple-100' 
                            : ''}
                          onClick={(e) => {
                            e.stopPropagation();
                            const employerId = getEmployerId(app);
                            if (employerId) {
                              setSelectedEmployer(employerId);
                              setSelectedApplicationForMessage(app);
                              setShowMessageDialog(true);
                              fetchConversation(employerId);
                            } else {
                              alert('Employer information not available. Please contact support.');
                            }
                          }}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message Employer
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApplication(app);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'No applications match your current filters.'
              : 'Start applying to jobs to see them here.'}
          </p>
        </Card>
      )}

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                View your application status and timeline
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const jobDetails = getJobDetails(selectedApplication);
              return (
                <div className="space-y-6">
                  {/* Job Info */}
                  <Card className="p-4">
                    <h3 className="font-semibold text-lg mb-3">{jobDetails.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {jobDetails.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {jobDetails.location}
                      </span>
                    </div>
                  </Card>

                  {/* Status Timeline */}
                  <Card className="p-4">
                    <h4 className="font-semibold mb-4">Application Timeline</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Application Submitted</p>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedApplication.appliedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {selectedApplication.status.toLowerCase() !== 'applied' && (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Status Updated</p>
                            <p className="text-sm text-gray-600">
                              Status changed to: <Badge className={getStatusColor(selectedApplication.status)}>
                                {getStatusLabel(selectedApplication.status)}
                              </Badge>
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedApplication.interviewDate && (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <Video className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Interview Scheduled</p>
                            <p className="text-sm text-gray-600">
                              {formatTimeInTimezone(selectedApplication.interviewDate, undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                              <span className="text-xs text-gray-500 ml-1">
                                ({getTimezoneAbbreviation()})
                              </span>
                            </p>
                            <SmartReminders startTime={selectedApplication.interviewDate} className="mt-2" />
                            <div className="flex items-center gap-2 mt-2">
                              <CalendarSyncButton
                                event={{
                                  title: `${jobDetails.title} Interview`,
                                  description: `Interview with ${jobDetails.company}`,
                                  startTime: new Date(selectedApplication.interviewDate),
                                  endTime: new Date(new Date(selectedApplication.interviewDate).getTime() + 60 * 60 * 1000),
                                  location: jobDetails.location,
                                  meetingLink: selectedApplication.interviewLink,
                                }}
                                variant="outline"
                                size="sm"
                              />
                              {selectedApplication.interviewLink && (
                                <Button
                                  size="sm"
                                  className="text-white"
                                  style={{ backgroundColor: '#02243b' }}
                                  onClick={() => window.open(selectedApplication.interviewLink, '_blank')}
                                >
                                  <Video className="h-3 w-3 mr-1" />
                                  Join Interview
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Cover Letter */}
                  {selectedApplication.coverLetter && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Your Cover Letter</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                    </Card>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}

      {/* Message Dialog */}
      {showMessageDialog && selectedEmployer && (
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Message Employer</DialogTitle>
              <DialogDescription>
                Send a message to the employer about this application
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Conversation History */}
              {conversations[selectedEmployer] && conversations[selectedEmployer].length > 0 && (
                <div className="space-y-3">
                  {conversations[selectedEmployer].map((msg) => {
                    // Check if message is from employer (sender._id matches selectedEmployer)
                    const senderId = typeof msg.sender._id === 'object' ? msg.sender._id.toString() : msg.sender._id;
                    const isFromEmployer = senderId === selectedEmployer;
                    
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isFromEmployer ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            isFromEmployer
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-white'
                          }`}
                          style={!isFromEmployer ? { backgroundColor: '#02243b' } : {}}
                        >
                          <p className="text-sm font-medium mb-1">
                            {msg.sender.firstName} {msg.sender.lastName}
                          </p>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Message Input */}
              <div className="border-t pt-4">
                <Textarea
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <Button
                  className="mt-2 text-white w-full"
                  style={{ backgroundColor: '#02243b' }}
                  onClick={sendMessage}
                  disabled={sendingMessage || !messageContent.trim()}
                >
                  {sendingMessage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Interview Booking Dialog - Simplified One-Click */}
      {showVotingDialog && selectedInterviewForVoting && (
        <InterviewBooking
          applicationId={selectedInterviewForVoting}
          open={showVotingDialog}
          onOpenChange={(open) => {
            setShowVotingDialog(open);
            if (!open) {
              setSelectedInterviewForVoting(null);
              fetchInterviewSchedules();
            }
          }}
          onSuccess={() => {
            fetchInterviewSchedules();
            fetchApplications();
          }}
        />
      )}
    </div>
  );
}

