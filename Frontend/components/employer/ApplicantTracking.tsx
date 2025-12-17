"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  User,
  Mail,
  Calendar,
  Star,
  FileText,
  MessageCircle,
  Video,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Download,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  applicantsCount: number;
}

interface Applicant {
  id: string;
  jobId: string;
  name: string;
  email: string;
  appliedDate: string;
  resumeLink: string;
  status: "Applied" | "Shortlisted" | "Interviewing" | "Rejected" | "Hired";
  rating: number;
  notes: string;
  phone?: string;
  location?: string;
}

interface ApplicantTrackingProps {
  jobs: Job[];
}

export function ApplicantTracking({ jobs }: ApplicantTrackingProps) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  // Mock applicant data
  const mockApplicants: Applicant[] = [
    {
      id: "1",
      jobId: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      appliedDate: "2025-12-10",
      resumeLink: "/resume/sarah-johnson.pdf",
      status: "Shortlisted",
      rating: 4,
      notes: "Strong technical background, excellent portfolio",
    },
    {
      id: "2",
      jobId: "1",
      name: "Mike Chen",
      email: "mike.chen@example.com",
      phone: "+1 (555) 987-6543",
      location: "Remote",
      appliedDate: "2025-12-08",
      resumeLink: "/resume/mike-chen.pdf",
      status: "Interviewing",
      rating: 5,
      notes: "Perfect fit for senior role, great communication skills",
    },
    {
      id: "3",
      jobId: "2",
      name: "Emily Rodriguez",
      email: "emily.rodriguez@example.com",
      appliedDate: "2025-12-12",
      resumeLink: "/resume/emily-rodriguez.pdf",
      status: "Applied",
      rating: 3,
      notes: "",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-700";
      case "Shortlisted":
        return "bg-yellow-100 text-yellow-700";
      case "Interviewing":
        return "bg-purple-100 text-purple-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Hired":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Applied":
        return <Clock className="h-4 w-4" />;
      case "Shortlisted":
        return <Star className="h-4 w-4" />;
      case "Interviewing":
        return <Video className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      case "Hired":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const selectedJobApplicants = mockApplicants.filter(app => app.jobId === selectedJobId);
  const filteredApplicants = selectedJobApplicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || applicant.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const applicantsByStatus = {
    all: selectedJobApplicants,
    applied: selectedJobApplicants.filter(app => app.status === "Applied"),
    shortlisted: selectedJobApplicants.filter(app => app.status === "Shortlisted"),
    interviewing: selectedJobApplicants.filter(app => app.status === "Interviewing"),
    rejected: selectedJobApplicants.filter(app => app.status === "Rejected"),
    hired: selectedJobApplicants.filter(app => app.status === "Hired"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applicant Tracking</h1>
          <p className="text-gray-600">Review and manage job applications</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Job Selection */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Job Position
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.department} ({job.applicantsCount} applicants)
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Applicants
            </label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Applicant Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({applicantsByStatus.all.length})</TabsTrigger>
          <TabsTrigger value="applied">Applied ({applicantsByStatus.applied.length})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({applicantsByStatus.shortlisted.length})</TabsTrigger>
          <TabsTrigger value="interviewing">Interviewing ({applicantsByStatus.interviewing.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({applicantsByStatus.rejected.length})</TabsTrigger>
          <TabsTrigger value="hired">Hired ({applicantsByStatus.hired.length})</TabsTrigger>
        </TabsList>

        {Object.entries(applicantsByStatus).map(([status, applicants]) => (
          <TabsContent key={status} value={status}>
            <ApplicantList 
              applicants={status === "all" ? filteredApplicants : applicants.filter(app => 
                app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.email.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              onSelectApplicant={setSelectedApplicant}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Applicant Details Dialog */}
      {selectedApplicant && (
        <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Applicant Details</DialogTitle>
            </DialogHeader>
            <ApplicantDetails applicant={selectedApplicant} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ApplicantList({ applicants, onSelectApplicant }: { applicants: Applicant[], onSelectApplicant: (applicant: Applicant) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-700";
      case "Shortlisted":
        return "bg-yellow-100 text-yellow-700";
      case "Interviewing":
        return "bg-purple-100 text-purple-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Hired":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Applied":
        return <Clock className="h-4 w-4" />;
      case "Shortlisted":
        return <Star className="h-4 w-4" />;
      case "Interviewing":
        return <Video className="h-4 w-4" />;
      case "Rejected":
        return <XCircle className="h-4 w-4" />;
      case "Hired":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (applicants.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No applicants found</h3>
        <p className="text-gray-600">No applicants match your current filters.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applicants.map((applicant) => (
        <Card key={applicant.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{applicant.name}</h3>
                    <Badge className={`${getStatusColor(applicant.status)} flex items-center gap-1`}>
                      {getStatusIcon(applicant.status)}
                      {applicant.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{applicant.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {applicant.appliedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(applicant.rating)}</div>
                      <span className="text-gray-500">({applicant.rating}/5)</span>
                    </div>
                  </div>
                  
                  {applicant.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{applicant.notes}"</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onSelectApplicant(applicant)}>
                <User className="h-4 w-4 mr-1" />
                View Profile
              </Button>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-1" />
                Resume
              </Button>
              <Button size="sm" variant="outline">
                <Video className="h-4 w-4 mr-1" />
                Interview
              </Button>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
              {applicant.status !== "Hired" && applicant.status !== "Rejected" && (
                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Next Stage
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ApplicantDetails({ applicant }: { applicant: Applicant }) {
  const [notes, setNotes] = useState(applicant.notes);
  const [rating, setRating] = useState(applicant.rating);

  const renderStars = (currentRating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => setRating(i + 1)}
        className="focus:outline-none"
      >
        <Star
          className={`h-5 w-5 ${i < currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
        />
      </button>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-gray-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{applicant.name}</h2>
          <p className="text-gray-600">{applicant.email}</p>
          {applicant.phone && <p className="text-gray-600">{applicant.phone}</p>}
          {applicant.location && <p className="text-gray-600">{applicant.location}</p>}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating
        </label>
        <div className="flex gap-1">
          {renderStars(rating)}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Internal Notes
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes about this candidate..."
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            View Resume
          </Button>
          <Button variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Move Forward
          </Button>
        </div>
      </div>
    </div>
  );
}