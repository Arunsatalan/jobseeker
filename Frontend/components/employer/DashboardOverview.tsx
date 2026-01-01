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
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    loadUpcomingInterviews();
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

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Upcoming Interviews</h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              {upcomingInterviews.length} scheduled
            </Badge>
          </div>
          <div className="space-y-3">
            {upcomingInterviews.map((interview: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {interview.candidate?.firstName} {interview.candidate?.lastName}
                    </p>
                    <p className="text-sm text-slate-600">{interview.job?.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span className="text-xs text-slate-600">
                        {interview.confirmedSlot?.startTime
                          ? formatDateTime(interview.confirmedSlot.startTime)
                          : 'Time TBD'}
                      </span>
                    </div>
                  </div>
                </div>
                {interview.confirmedSlot?.meetingLink && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(interview.confirmedSlot.meetingLink, '_blank')}
                  >
                    Join Meeting
                  </Button>
                )}
              </div>
            ))}
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