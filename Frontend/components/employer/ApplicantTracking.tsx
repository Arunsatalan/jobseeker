import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApplications } from "@/hooks/useApplications";
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
  Loader2
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  applicantsCount: number;
}

interface Applicant {
  _id: string;
  id: string; // Added for UI compatibility
  job: Job | string;
  applicant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  jobId: string;
  name: string;
  email: string;
  appliedAt: string;
  appliedDate: string; // Added for UI compatibility
  resumeLink: string;
  status: "Applied" | "Shortlisted" | "Interviewing" | "Rejected" | "Hired";
  rating: number;
  notes: string;
  phone?: string;
  location?: string;
  coverLetter?: string;
}

interface ApplicantTrackingProps {
  jobs: Job[];
}

export function ApplicantTracking({ jobs }: ApplicantTrackingProps) {
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const { applications, isLoading, setFilters, updateStatus } = useApplications({
    jobId: selectedJobId === 'all' ? undefined : selectedJobId,
    status: 'all' // We fetch all and filter client-side for tabs or could fetch per tab
  });

  // Effect to update filters when job selection changes
  useEffect(() => {
    setFilters({ jobId: selectedJobId === 'all' ? undefined : selectedJobId });
  }, [selectedJobId, setFilters]);

  // Transform hook data to match component expectation if needed, or update component to key off _id
  const transformedApplicants = applications.map(app => ({
    ...app,
    id: app._id, // Map _id to id for UI
    name: app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : 'Unknown Candidate',
    email: app.applicant?.email || 'No Email',
    appliedDate: new Date(app.appliedAt).toLocaleDateString(),
    jobId: typeof app.job === 'object' ? app.job._id : app.job
  }));

  const filteredApplicants = transformedApplicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const applicantsByStatus = {
    all: filteredApplicants,
    applied: filteredApplicants.filter(app => app.status === "Applied" || app.status === "applied"),
    shortlisted: filteredApplicants.filter(app => app.status === "Shortlisted" || app.status === "shortlisted"),
    interviewing: filteredApplicants.filter(app => app.status === "Interviewing" || app.status === "interviewing"),
    rejected: filteredApplicants.filter(app => app.status === "Rejected" || app.status === "rejected"),
    hired: filteredApplicants.filter(app => app.status === "Hired" || app.status === "hired"),
  };

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    await updateStatus(applicantId, newStatus);
    if (selectedApplicant && selectedApplicant.id === applicantId) {
      setSelectedApplicant(prev => prev ? ({ ...prev, status: newStatus as any }) : null);
    }
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
              <option value="all">All Jobs</option>
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

        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          Object.entries(applicantsByStatus).map(([status, applicants]) => (
            <TabsContent key={status} value={status}>
              <ApplicantList
                applicants={applicants}
                onSelectApplicant={setSelectedApplicant}
              />
            </TabsContent>
          ))
        )}
      </Tabs>

      {/* Applicant Details Dialog */}
      {selectedApplicant && (
        <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Applicant Details</DialogTitle>
            </DialogHeader>
            <ApplicantDetails
              applicant={selectedApplicant}
              onStatusChange={(status) => handleStatusChange(selectedApplicant.id, status)}
            />
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

// Update the ApplicantDetails component signature and logic
function ApplicantDetails({ applicant, onStatusChange }: { applicant: Applicant, onStatusChange: (status: string) => void }) {
  const [notes, setNotes] = useState(applicant.notes || "");
  const [rating, setRating] = useState(applicant.rating || 0);

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
          <Badge className={`mt-2`}>{applicant.status}</Badge>
        </div>
      </div>

      {/* Cover Letter */}
      {applicant.coverLetter && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Letter
          </label>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
            {applicant.coverLetter}
          </div>
        </div>
      )}

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
          <Button variant="outline" onClick={() => window.open(applicant.resumeLink, '_blank')}>
            <FileText className="h-4 w-4 mr-2" />
            View Resume
          </Button>
          <Button variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={() => onStatusChange('Rejected')}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onStatusChange('Shortlisted')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Shortlist
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => onStatusChange('Interviewing')}
          >
            <Video className="h-4 w-4 mr-2" />
            Interview
          </Button>
        </div>
      </div>
    </div>
  );
}