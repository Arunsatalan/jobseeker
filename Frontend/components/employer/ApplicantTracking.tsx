import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApplications } from "@/hooks/useApplications";
import { InterviewSlotProposal } from "./InterviewSlotProposal";
import { SimpleInterviewScheduler } from "./SimpleInterviewScheduler";
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
  Loader2,
  X,
  AlertTriangle,
  Save,
  CheckCircle2,
  ChevronDown
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
  resumeId?: string; // Resume ID for direct lookup
  status: "Applied" | "Shortlisted" | "Interviewing" | "Rejected" | "Hired" | string;
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
  const [selectedResume, setSelectedResume] = useState<any | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [showInterviewProposal, setShowInterviewProposal] = useState(false);
  const [interviewApplicant, setInterviewApplicant] = useState<Applicant | null>(null);

  const { applications, isLoading, setFilters, updateStatus, refresh } = useApplications({
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
    jobId: typeof app.job === 'object' ? app.job._id : app.job,
    resumeId: app.resume?._id || undefined // Add resume ID for direct lookup
  }));

  const filteredApplicants = transformedApplicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const applicantsByStatus = {
    all: filteredApplicants,
    applied: filteredApplicants.filter(app => {
      const status = (app.status || "").toLowerCase();
      return status === "applied";
    }),
    shortlisted: filteredApplicants.filter(app => {
      const status = (app.status || "").toLowerCase();
      return status === "shortlisted";
    }),
    interviewing: filteredApplicants.filter(app => {
      const status = (app.status || "").toLowerCase();
      return status === "interview" || status === "interviewing";
    }),
    rejected: filteredApplicants.filter(app => {
      const status = (app.status || "").toLowerCase();
      return status === "rejected";
    }),
    hired: filteredApplicants.filter(app => {
      const status = (app.status || "").toLowerCase();
      return status === "hired" || status === "accepted" || status === "offered";
    }),
  };

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    // Convert to lowercase to match backend constants
    const normalizedStatus = newStatus.toLowerCase();
    const success = await updateStatus(applicantId, normalizedStatus);
    if (success) {
      // Update selected applicant if it's the same one
      if (selectedApplicant && (selectedApplicant.id === applicantId || selectedApplicant._id === applicantId)) {
        setSelectedApplicant(prev => prev ? ({ ...prev, status: normalizedStatus as any }) : null);
      }
      // Refresh the applications list to update all tabs with new statuses
      setTimeout(() => {
        refresh();
      }, 300);
    }
  };

  const handleViewResume = async (applicant: Applicant) => {
    setLoadingResume(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Please log in to view resumes');
        return;
      }

      let resume = null;

      // Method 1: Try to fetch using resumeId if available
      if (applicant.resumeId) {
        console.log('Fetching resume by ID:', applicant.resumeId);
        try {
          const response = await fetch(`/api/v1/resumes/${applicant.resumeId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            resume = data.data;
            console.log('Resume found by ID:', resume);
          } else {
            console.warn('Resume fetch by ID failed, trying search method');
          }
        } catch (error) {
          console.warn('Error fetching by ID, trying search method:', error);
        }
      }

      // Method 2: Fallback - Search by email/name
      if (!resume) {
        console.log('Searching for resume by email/name');
        const response = await fetch(`/api/v1/resumes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const resumes = Array.isArray(data.data) ? data.data : (data.resumes || []);
          
          console.log('Total resumes available:', resumes.length);
          console.log('Looking for applicant:', applicant.email, applicant.name);
          
          // Find resume by applicant email or name (more flexible matching)
          resume = resumes.find((r: any) => {
            const resumeEmail = r.parsedData?.email?.toLowerCase().trim();
            const resumeName = r.parsedData?.name?.toLowerCase().trim();
            const applicantEmail = applicant.email?.toLowerCase().trim();
            const applicantName = applicant.name?.toLowerCase().trim();
            
            return (
              resumeEmail === applicantEmail ||
              resumeName === applicantName ||
              (resumeName && applicantName && resumeName.includes(applicantName)) ||
              (applicantName && resumeName && applicantName.includes(resumeName))
            );
          });

          if (!resume) {
            console.error('Resume not found. Available resumes:', resumes.map((r: any) => ({
              email: r.parsedData?.email,
              name: r.parsedData?.name,
              id: r._id
            })));
          }
        } else {
          console.error('Failed to fetch resumes list');
        }
      }

      if (resume) {
        console.log('Setting selected resume:', resume._id);
        setSelectedResume(resume);
      } else {
        alert(`Resume not found in database for ${applicant.name} (${applicant.email}). Please ensure the candidate has created and saved their resume first.`);
      }
    } catch (error) {
      console.error('Error fetching resume:', error);
      alert('Failed to load resume. Please try again.');
    } finally {
      setLoadingResume(false);
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
                onStatusChange={handleStatusChange}
                onScheduleInterview={(applicant) => {
                  setInterviewApplicant(applicant);
                  setShowInterviewProposal(true);
                }}
              />
            </TabsContent>
          ))
        )}
      </Tabs>

      {/* Applicant Details Dialog */}
      {selectedApplicant && (
        <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
          <DialogContent 
            className="max-w-[1200px] max-h-[135vh] overflow-y-auto" 
            style={{ maxWidth: '1200px', maxHeight: '135vh' }}
          >
            <DialogHeader>
              <DialogTitle>Applicant Details</DialogTitle>
              <DialogDescription>
                View and manage applicant information and resume
              </DialogDescription>
            </DialogHeader>
            <ApplicantDetails
              applicant={selectedApplicant}
              jobs={jobs}
              onStatusChange={(status) => handleStatusChange(selectedApplicant.id, status)}
              onViewResume={handleViewResume}
              loadingResume={loadingResume}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Resume Viewer Dialog */}
      {selectedResume && (
        <ResumeViewerDialog 
          resume={selectedResume} 
          applicant={selectedApplicant} 
          jobs={jobs}
          onClose={() => setSelectedResume(null)}
        />
      )}

      {/* Interview Slot Proposal Dialog - Simplified */}
      {showInterviewProposal && interviewApplicant && (
        <SimpleInterviewScheduler
          applicationId={interviewApplicant._id || interviewApplicant.id}
          candidateName={interviewApplicant.name}
          jobTitle={(() => {
            if (typeof interviewApplicant.job === 'object' && interviewApplicant.job?.title) {
              return interviewApplicant.job.title;
            }
            if (interviewApplicant.jobId) {
              const job = jobs.find(j => j.id === interviewApplicant.jobId);
              return job?.title || 'Position';
            }
            return 'Position';
          })()}
          open={showInterviewProposal}
          onOpenChange={(open) => {
            setShowInterviewProposal(open);
            if (!open) {
              setInterviewApplicant(null);
            }
          }}
          onSuccess={() => {
            setShowInterviewProposal(false);
            setInterviewApplicant(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function ApplicantList({ applicants, onSelectApplicant, onStatusChange, onScheduleInterview }: { applicants: Applicant[], onSelectApplicant: (applicant: Applicant) => void, onStatusChange?: (applicantId: string, status: string) => void, onScheduleInterview?: (applicant: Applicant) => void }) {
  // Calculate remaining days for review deadline
  const getRemainingDays = (appliedAt: string) => {
    const appliedDate = new Date(appliedAt);
    const now = new Date();
    const reviewDeadlineDays = 5; // 5 business days
    
    // Calculate deadline (5 business days)
    const deadlineDate = new Date(appliedDate);
    let businessDaysAdded = 0;
    while (businessDaysAdded < reviewDeadlineDays) {
      deadlineDate.setDate(deadlineDate.getDate() + 1);
      const dayOfWeek = deadlineDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        businessDaysAdded++;
      }
    }
    
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { daysUntilDeadline, deadlineDate, isPastDeadline: daysUntilDeadline < 0, isApproaching: daysUntilDeadline <= 2 && daysUntilDeadline >= 0 };
  };

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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{applicant.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Applied {applicant.appliedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {(() => {
                        const timeInfo = getRemainingDays(applicant.appliedAt);
                        return (
                          <span className={`font-medium ${
                            timeInfo.isPastDeadline 
                              ? 'text-red-600' 
                              : timeInfo.isApproaching 
                              ? 'text-yellow-600' 
                              : 'text-gray-600'
                          }`}>
                            {timeInfo.isPastDeadline 
                              ? `⚠️ ${Math.abs(timeInfo.daysUntilDeadline)}d overdue`
                              : timeInfo.isApproaching
                              ? `⚠️ ${timeInfo.daysUntilDeadline}d left`
                              : `${timeInfo.daysUntilDeadline}d remaining`
                            }
                          </span>
                        );
                      })()}
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
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  if (onScheduleInterview) {
                    onScheduleInterview(applicant);
                  }
                }}
              >
                <Video className="h-4 w-4 mr-1" />
                Schedule Interview
              </Button>
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
              {(() => {
                const statusLower = (applicant.status || "").toLowerCase();
                
                // Don't show Next Stage for final statuses
                const isFinalStatus = statusLower === "hired" || 
                                     statusLower === "rejected" || 
                                     statusLower === "accepted" ||
                                     statusLower === "offered";
                
                if (isFinalStatus) return null;
                
                // For interviewing status, show dropdown with Reject/Hired options
                if (statusLower === "interview" || statusLower === "interviewing") {
                  return (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-700"
                        >
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Next Stage
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            if (!onStatusChange) return;
                            onStatusChange(applicant.id || applicant._id, "accepted");
                          }}
                          className="text-green-600 focus:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Hire
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (!onStatusChange) return;
                            onStatusChange(applicant.id || applicant._id, "rejected");
                          }}
                          className="text-red-600 focus:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                
                // For applied/reviewing status, show Next Stage button to move to shortlisted
                if (statusLower === "applied" || statusLower === "reviewing") {
                  return (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600 hover:text-green-700"
                      onClick={() => {
                        if (!onStatusChange) return;
                        onStatusChange(applicant.id || applicant._id, "shortlisted");
                      }}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Next Stage
                    </Button>
                  );
                }
                
                // For shortlisted status, show Next Stage button to move to interview
                if (statusLower === "shortlisted") {
                  return (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600 hover:text-green-700"
                      onClick={() => {
                        if (!onStatusChange) return;
                        onStatusChange(applicant.id || applicant._id, "interview");
                      }}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Next Stage
                    </Button>
                  );
                }
                
                // Don't show button for unknown or invalid statuses
                return null;
              })()}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Update the ApplicantDetails component signature and logic
function ApplicantDetails({ applicant, jobs, onStatusChange, onViewResume, loadingResume }: { applicant: Applicant, jobs: Job[], onStatusChange: (status: string) => void, onViewResume: (applicant: Applicant) => void, loadingResume: boolean }) {
  const [notes, setNotes] = useState(applicant.notes || "");
  const [rating, setRating] = useState(applicant.rating || 0);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [showInterviewProposal, setShowInterviewProposal] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [confirmedInterview, setConfirmedInterview] = useState<any | null>(null);
  const [loadingInterview, setLoadingInterview] = useState(false);
  const [detailedRatings, setDetailedRatings] = useState({
    technical: applicant.rating || 0,
    cultural: 0,
    communication: 0,
    experience: 0
  });
  const [reviewDeadlineDays] = useState(5); // 5 business days for initial review
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Get job title from applicant job object or jobs array
  const getJobTitle = () => {
    // First try to get from job object if it's populated
    if (typeof applicant.job === 'object' && applicant.job?.title) {
      return applicant.job.title;
    }
    // Fallback: try to find in jobs array using jobId
    if (applicant.jobId) {
      const job = jobs.find(j => j.id === applicant.jobId);
      if (job?.title) {
        return job.title;
      }
    }
    return 'Position';
  };

  // Calculate time since application and deadline
  const getApplicationTimeInfo = () => {
    const appliedDate = new Date(applicant.appliedAt);
    const now = new Date();
    const diffTime = now.getTime() - appliedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    // Calculate deadline (reviewDeadlineDays business days)
    const deadlineDate = new Date(appliedDate);
    let businessDaysAdded = 0;
    while (businessDaysAdded < reviewDeadlineDays) {
      deadlineDate.setDate(deadlineDate.getDate() + 1);
      const dayOfWeek = deadlineDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        businessDaysAdded++;
      }
    }
    
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isApproachingDeadline = daysUntilDeadline <= 2 && daysUntilDeadline >= 0;
    const isPastDeadline = daysUntilDeadline < 0;
    
    let timeAgo = '';
    if (diffDays > 0) {
      timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
    
    return {
      timeAgo,
      daysUntilDeadline,
      isApproachingDeadline,
      isPastDeadline,
      deadlineDate
    };
  };

  // Load confirmed interview for this applicant
  useEffect(() => {
    const loadConfirmedInterview = async () => {
      setLoadingInterview(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(
          `${apiUrl}/api/v1/interviews/slots/${applicant._id || applicant.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.status === 'confirmed') {
            setConfirmedInterview(data.data);
          }
        }
      } catch (error) {
        console.error('Error loading interview:', error);
      } finally {
        setLoadingInterview(false);
      }
    };

    loadConfirmedInterview();
  }, [applicant._id, applicant.id, apiUrl]);

  // Save notes with debouncing
  useEffect(() => {
    const saveNotes = async () => {
      if (notes === (applicant.notes || "")) return; // No changes
      
      setSavingNotes(true);
      setNotesSaved(false);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await fetch(`${apiUrl}/api/v1/applications/${applicant._id || applicant.id}/notes`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ notes })
        });
        
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      } catch (error) {
        console.error('Error saving notes:', error);
      } finally {
        setSavingNotes(false);
      }
    };

    const timeoutId = setTimeout(saveNotes, 1000); // Debounce 1 second
    return () => clearTimeout(timeoutId);
  }, [notes, applicant._id, applicant.id, applicant.notes, apiUrl]);

  // Save rating
  const handleRatingChange = async (newRating: number) => {
    setRating(newRating);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await fetch(`${apiUrl}/api/v1/applications/${applicant._id || applicant.id}/rating`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: newRating })
      });
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  // Save detailed ratings
  const handleDetailedRatingChange = async (category: string, value: number) => {
    const updated = { ...detailedRatings, [category]: value };
    setDetailedRatings(updated);
    
    // Calculate overall rating as average
    const overallRating = Math.round(
      Object.values(updated).reduce((sum, val) => sum + val, 0) / Object.values(updated).length
    );
    setRating(overallRating);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await fetch(`${apiUrl}/api/v1/applications/${applicant._id || applicant.id}/rating`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          rating: overallRating,
          detailedRatings: updated
        })
      });
    } catch (error) {
      console.error('Error saving detailed rating:', error);
    }
  };

  // Download cover letter as PDF
  const handleDownloadCoverLetter = async () => {
    const jobTitle = getJobTitle();
    const applicantName = applicant.name;
    const coverLetterContent = applicant.coverLetter || '';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Sanitize filename - remove special characters
    const sanitizeFilename = (str: string) => {
      return str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    };

    // Dynamically load jsPDF from CDN
    const loadJsPDF = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const win = window as any;
        
        // Check if already loaded (multiple possible formats)
        if (win.jspdf && win.jspdf.jsPDF) {
          resolve(win.jspdf);
          return;
        }
        if (win.jspdf?.jsPDF) {
          resolve(win.jspdf);
          return;
        }
        if (win.jsPDF) {
          resolve({ jsPDF: win.jsPDF });
          return;
        }
        
        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="jspdf"]');
        if (existingScript) {
          // Wait a bit and check again
          const checkInterval = setInterval(() => {
            if (win.jspdf && win.jspdf.jsPDF) {
              clearInterval(checkInterval);
              resolve(win.jspdf);
            } else if (win.jsPDF) {
              clearInterval(checkInterval);
              resolve({ jsPDF: win.jsPDF });
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('jsPDF loading timeout'));
          }, 5000);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          // Wait a moment for the library to initialize
          setTimeout(() => {
            // Try multiple ways to access jsPDF
            if (win.jspdf && win.jspdf.jsPDF) {
              resolve(win.jspdf);
            } else if (win.jspdf?.jsPDF) {
              resolve(win.jspdf);
            } else if (win.jsPDF) {
              resolve({ jsPDF: win.jsPDF });
            } else if ((window as any)['jspdf']) {
              const jspdfLib = (window as any)['jspdf'];
              if (jspdfLib.jsPDF) {
                resolve(jspdfLib);
              } else {
                reject(new Error('jsPDF loaded but jsPDF.jsPDF is not accessible'));
              }
            } else {
              console.error('jsPDF loading failed - available on window:', Object.keys(win).filter(k => k.toLowerCase().includes('pdf')));
              reject(new Error('jsPDF loaded but not accessible. Check console for details.'));
            }
          }, 200);
        };
        script.onerror = () => reject(new Error('Failed to load jsPDF script'));
        document.head.appendChild(script);
      });
    };

    try {
      const jsPDFLib = await loadJsPDF();
      const { jsPDF } = jsPDFLib;
      
      if (!jsPDF) {
        throw new Error('jsPDF is not available');
      }
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 25; // 25mm margin (approximately 1 inch)
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Set font
      doc.setFont('times', 'normal');
      doc.setFontSize(12);

      // Sender Information
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      const senderLines = doc.splitTextToSize(applicantName, maxWidth);
      doc.text(senderLines, margin, yPosition);
      yPosition += senderLines.length * 6;

      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      if (applicant.email) {
        doc.text(applicant.email, margin, yPosition);
        yPosition += 5;
      }
      if (applicant.phone) {
        doc.text(applicant.phone, margin, yPosition);
        yPosition += 5;
      }
      if (applicant.location) {
        doc.text(applicant.location, margin, yPosition);
        yPosition += 5;
      }
      yPosition += 5;

      // Date (right-aligned)
      doc.setFontSize(12);
      const dateText = date;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - margin - dateWidth, yPosition);
      yPosition += 10;

      // Recipient Information
      doc.text('Hiring Manager', margin, yPosition);
      yPosition += 5;
      doc.text('Company Name', margin, yPosition);
      yPosition += 10;

      // Subject Line
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      const subjectText = `Re: Application for ${jobTitle} Position`;
      const subjectLines = doc.splitTextToSize(subjectText, maxWidth);
      doc.text(subjectLines, margin, yPosition);
      yPosition += subjectLines.length * 6 + 5;

      // Cover Letter Content
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      const contentLines = doc.splitTextToSize(coverLetterContent, maxWidth);
      
      for (let i = 0; i < contentLines.length; i++) {
        if (yPosition > pageHeight - margin - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(contentLines[i], margin, yPosition);
        yPosition += 6;
      }

      yPosition += 10;

      // Closing
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text('Sincerely,', margin, yPosition);
      yPosition += 15;
      doc.setFont('times', 'bold');
      doc.text(applicantName, margin, yPosition);

      // Save PDF
      const filename = `Cover_Letter_${sanitizeFilename(applicantName)}_${sanitizeFilename(jobTitle)}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate PDF: ${errorMessage}. Please check the console for more details.`);
    }
  };

  const renderStars = (currentRating: number, onRatingChange: (rating: number) => void, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };
    
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        onClick={() => onRatingChange(i + 1)}
        className="focus:outline-none transition-transform hover:scale-110"
        type="button"
      >
        <Star
          className={`${sizeClasses[size]} ${i < currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
        />
      </button>
    ));
  };

  const timeInfo = getApplicationTimeInfo();

  return (
    <div className="space-y-6">
      {/* Application Timer & Alert */}
      <div className={`p-4 rounded-lg border-2 ${
        timeInfo.isPastDeadline 
          ? 'bg-red-50 border-red-300' 
          : timeInfo.isApproachingDeadline 
          ? 'bg-yellow-50 border-yellow-300' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className={`h-5 w-5 ${
              timeInfo.isPastDeadline 
                ? 'text-red-600' 
                : timeInfo.isApproachingDeadline 
                ? 'text-yellow-600' 
                : 'text-blue-600'
            }`} />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Applied {timeInfo.timeAgo}
              </p>
              {timeInfo.isPastDeadline ? (
                <p className="text-sm text-red-700 font-semibold mt-1">
                  ⚠️ Review deadline passed {Math.abs(timeInfo.daysUntilDeadline)} day{Math.abs(timeInfo.daysUntilDeadline) > 1 ? 's' : ''} ago
                </p>
              ) : timeInfo.isApproachingDeadline ? (
                <p className="text-sm text-yellow-700 font-semibold mt-1">
                  ⚠️ Review deadline in {timeInfo.daysUntilDeadline} day{timeInfo.daysUntilDeadline > 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">
                  Review deadline: {timeInfo.deadlineDate.toLocaleDateString()} ({timeInfo.daysUntilDeadline} days remaining)
                </p>
              )}
            </div>
          </div>
          {(timeInfo.isApproachingDeadline || timeInfo.isPastDeadline) && (
            <AlertTriangle className={`h-5 w-5 ${
              timeInfo.isPastDeadline ? 'text-red-600' : 'text-yellow-600'
            }`} />
          )}
        </div>
      </div>

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

      {/* Confirmed Interview Section */}
      {confirmedInterview && confirmedInterview.confirmedSlot && (
        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#02243b' }}>
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Confirmed Interview</h3>
                <p className="text-sm text-slate-700">Candidate has selected this time slot</p>
              </div>
            </div>
            <Badge className="text-white px-3 py-1" style={{ backgroundColor: '#02243b' }}>
              Confirmed
            </Badge>
          </div>
          <div className="space-y-3">
            {confirmedInterview.confirmedSlot.startTime && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" style={{ color: '#02243b' }} />
                <span className="font-medium text-slate-700">
                  {new Date(confirmedInterview.confirmedSlot.startTime).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {confirmedInterview.confirmedSlot.meetingLink && (
              <Button
                size="sm"
                className="text-white hover:opacity-90 w-full"
                style={{ backgroundColor: '#02243b' }}
                onClick={() => window.open(confirmedInterview.confirmedSlot.meetingLink, '_blank')}
              >
                <Video className="h-4 w-4 mr-2" />
                Join Meeting
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Cover Letter */}
      {applicant.coverLetter && (
        <div>
          <Button 
            variant="outline" 
            onClick={() => setShowCoverLetterModal(true)}
            className="mb-2"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Cover Letter
          </Button>
        </div>
      )}

      {/* Enhanced Rating System */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {renderStars(rating, handleRatingChange, 'lg')}
              <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Detailed Ratings
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Technical Skills</span>
                <div className="flex items-center gap-2">
                  {renderStars(detailedRatings.technical, (r) => handleDetailedRatingChange('technical', r), 'sm')}
                  <span className="text-xs text-gray-500 w-8">{detailedRatings.technical}/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Cultural Fit</span>
                <div className="flex items-center gap-2">
                  {renderStars(detailedRatings.cultural, (r) => handleDetailedRatingChange('cultural', r), 'sm')}
                  <span className="text-xs text-gray-500 w-8">{detailedRatings.cultural}/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Communication</span>
                <div className="flex items-center gap-2">
                  {renderStars(detailedRatings.communication, (r) => handleDetailedRatingChange('communication', r), 'sm')}
                  <span className="text-xs text-gray-500 w-8">{detailedRatings.communication}/5</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Experience Level</span>
                <div className="flex items-center gap-2">
                  {renderStars(detailedRatings.experience, (r) => handleDetailedRatingChange('experience', r), 'sm')}
                  <span className="text-xs text-gray-500 w-8">{detailedRatings.experience}/5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Notes with Auto-save */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Internal Notes
            </label>
            <div className="flex items-center gap-2">
              {savingNotes && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}
              {notesSaved && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Saved
                </span>
              )}
            </div>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your notes about this candidate... (Auto-saves after 1 second)"
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            💡 Notes are automatically saved and can be searched/filtered later
          </p>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onViewResume(applicant)}
            disabled={loadingResume}
          >
            <FileText className="h-4 w-4 mr-2" />
            {loadingResume ? 'Loading...' : 'View Resume'}
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
            onClick={() => onStatusChange('rejected')}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onStatusChange('shortlisted')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Shortlist
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              onStatusChange('interview');
              setShowInterviewProposal(true);
            }}
          >
            <Video className="h-4 w-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Cover Letter Modal */}
      {showCoverLetterModal && (
        <Dialog open={showCoverLetterModal} onOpenChange={setShowCoverLetterModal}>
          <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden flex flex-col p-0" style={{ maxWidth: '1200px', width: '1200px' }}>
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">Cover Letter - {applicant.name}</DialogTitle>
                <Button
                  onClick={handleDownloadCoverLetter}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 bg-gray-100 p-8 flex justify-center">
              {/* A4 Letter Format Container - 794px width (A4 at 96 DPI) */}
              <div 
                className="bg-white shadow-xl"
                style={{
                  width: '794px',
                  minHeight: '1123px',
                  padding: '96px',
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '12pt',
                  lineHeight: '1.6',
                  color: '#000'
                }}
              >
                {/* Sender Information */}
                <div className="mb-8">
                  <div className="font-bold text-base mb-1">{applicant.name}</div>
                  {applicant.email && <div className="text-sm">{applicant.email}</div>}
                  {applicant.phone && <div className="text-sm">{applicant.phone}</div>}
                  {applicant.location && <div className="text-sm">{applicant.location}</div>}
                </div>

                {/* Date */}
                <div className="text-right mb-8">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                {/* Recipient Information */}
                <div className="mb-8">
                  <div>Hiring Manager</div>
                  <div>Company Name</div>
                </div>

                {/* Subject Line */}
                <div className="font-bold mb-6">
                  Re: Application for {getJobTitle()} Position
                </div>

                {/* Cover Letter Content */}
                <div 
                  className="whitespace-pre-wrap mb-8"
                  style={{
                    textAlign: 'justify',
                    lineHeight: '1.8'
                  }}
                >
                  {applicant.coverLetter}
                </div>

                {/* Closing */}
                <div className="mt-12">
                  <div className="mb-8">Sincerely,</div>
                  <div className="mt-10 font-bold">{applicant.name}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Resume Viewer Dialog Component
function ResumeViewerDialog({ resume, applicant, jobs, onClose }: { resume: any, applicant?: Applicant | null, jobs?: Job[], onClose: () => void }) {
  const handleDownloadResume = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to download resumes');
            return;
        }

        const data = resume.parsedData || {};
        const applicantName = data.name || applicant?.name || 'Candidate';

        // Sanitize filename
        const sanitizeFilename = (str: string) => {
            return str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
        };

        // Load jsPDF
        const loadJsPDF = (): Promise<any> => {
            return new Promise((resolve, reject) => {
                const win = window as any;
                if (win.jspdf?.jsPDF) {
                    resolve(win.jspdf);
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.async = true;
                script.crossOrigin = 'anonymous';
                script.onload = () => {
                  setTimeout(() => {
                    const win = window as any;
                    if (win.jspdf && win.jspdf.jsPDF) {
                      resolve(win.jspdf);
                    } else if (win.jsPDF) {
                      resolve({ jsPDF: win.jsPDF });
                    } else {
                      reject(new Error('jsPDF loaded but not accessible'));
                    }
                  }, 200);
                };
                script.onerror = () => reject(new Error('Failed to load jsPDF script'));
                document.head.appendChild(script);
            });
        };

        const jsPDFLib = await loadJsPDF();
        const { jsPDF } = jsPDFLib;
        if (!jsPDF) {
            throw new Error('jsPDF is not available');
        }

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        const maxWidth = pageWidth - 2 * margin;
        let yPosition = 0;

        // Color scheme - Modern 2025 colors
        const primaryColor = [45, 55, 72]; // Dark blue-gray
        const accentColor = [59, 130, 246]; // Modern blue
        const lightGray = [248, 250, 252];
        const textColor = [31, 41, 55];

        // Helper functions
        const addText = (text: string | string[], x: number, y: number, options: any = {}) => {
            if (text && typeof text === 'string' && text.trim()) {
                doc.text(text, x, y, options);
            } else if (Array.isArray(text) && text.length > 0) {
                doc.text(text, x, y, options);
            }
        };

        const addLine = (x1: number, y1: number, x2: number, y2: number, color = [200, 200, 200]) => {
            doc.setDrawColor(color[0], color[1], color[2]);
            doc.setLineWidth(0.5);
            doc.line(x1, y1, x2, y2);
        };

        const addSection = (title: string, yPos: number) => {
            // Add spacing before section
            yPos += 5;
            
            // Section title - Bold, uppercase, dark color
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            addText(title.toUpperCase(), margin, yPos);
            yPos += 6;
            
            // Section divider line - Blue accent line
            addLine(margin, yPos, pageWidth - margin, yPos, accentColor);
            yPos += 5;
            
            return yPos;
        };

        // Header Section with colored background - Dark blue header
        const headerHeight = 50;
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');

        // Name - Large, bold, white
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        addText(applicantName, margin, 22);

        // Job Title - Medium, white
        const role = data.jobTitle || resume.role || data.role || 'Professional';
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        addText(role, margin, 32);

        // Email in header - Small, white
        const email = applicant?.email || data.email || resume.email;
        if (email && email !== 'No Email') {
            doc.setFontSize(11);
            addText(email, margin, 40);
        }

        yPosition = headerHeight + 15;

        // Professional Summary
        if (data.summary) {
            yPosition = addSection('Professional Summary', yPosition);
            
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10.5);
            doc.setLineHeightFactor(1.5);
            const summaryLines = doc.splitTextToSize(data.summary, maxWidth);
            addText(summaryLines, margin, yPosition);
            yPosition += summaryLines.length * 5.5 + 8;
        }

        // Experience Section
        if (data.experience && data.experience.length > 0) {
            yPosition = addSection('Professional Experience', yPosition);
            
            data.experience.forEach((exp: any, index: number) => {
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = margin + 10;
                }

                // Job Title - Bold, dark color
                const jobTitle = exp.title || exp.position || exp.jobTitle || exp.role || 'Position';
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11.5);
                addText(jobTitle, margin, yPosition);
                yPosition += 5;

                // Company - Blue color, bold
                const company = exp.company || exp.employer || exp.organization || 'Company';
                doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                addText(company, margin, yPosition);
                
                // Duration aligned to right - Gray, italic
                const startDate = exp.startDate || exp.from || exp.start || '';
                const endDate = exp.endDate || exp.to || (exp.current ? 'Present' : (exp.end || ''));
                const duration = startDate && endDate ? `${startDate} - ${endDate}` : (startDate || endDate || '');
                if (duration) {
                    doc.setTextColor(120, 120, 120);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    const durationWidth = doc.getTextWidth(duration);
                    addText(duration, pageWidth - margin - durationWidth, yPosition);
                }
                yPosition += 5;

                // Description with bullet points
                if (exp.description || exp.responsibilities || exp.achievements || exp.duties) {
                    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9.5);
                    doc.setLineHeightFactor(1.4);
                    
                    // Combine all possible description fields
                    let description = '';
                    if (exp.description) description += exp.description + '\n';
                    if (exp.responsibilities) description += exp.responsibilities + '\n';
                    if (exp.achievements) description += exp.achievements + '\n';
                    if (exp.duties) description += exp.duties + '\n';
                    
                    // Handle array format
                    if (Array.isArray(exp.description)) {
                        description = exp.description.join('\n');
                    } else if (Array.isArray(exp.responsibilities)) {
                        description = exp.responsibilities.join('\n');
                    }
                    
                    const descriptions = description.split('\n').filter((desc: string) => desc.trim());
                    
                    if (descriptions.length > 0) {
                        descriptions.forEach((desc: string) => {
                            const cleanDesc = desc.replace(/^[•\-\*]\s*/, '').trim();
                            if (cleanDesc && cleanDesc.length > 0) {
                                if (yPosition > pageHeight - margin - 20) {
                                    doc.addPage();
                                    yPosition = margin + 10;
                                }
                                const bulletText = `• ${cleanDesc}`;
                                const descLines = doc.splitTextToSize(bulletText, maxWidth - 4);
                                addText(descLines, margin + 2, yPosition);
                                yPosition += descLines.length * 4.2;
                            }
                        });
                    } else if (exp.summary) {
                        // Fallback to summary if available
                        if (yPosition > pageHeight - margin - 20) {
                            doc.addPage();
                            yPosition = margin + 10;
                        }
                        const summaryLines = doc.splitTextToSize(`• ${exp.summary}`, maxWidth - 4);
                        addText(summaryLines, margin + 2, yPosition);
                        yPosition += summaryLines.length * 4.2;
                    }
                }
                
                yPosition += 6;
            });

            yPosition += 5;
        }

        // Education Section
        if (data.education && data.education.length > 0) {
            if (yPosition > pageHeight - 60) {
                doc.addPage();
                yPosition = margin + 10;
            }
            
            yPosition = addSection('Education', yPosition);
            
            data.education.forEach((edu: any) => {
                if (yPosition > pageHeight - margin - 30) {
                    doc.addPage();
                    yPosition = margin + 10;
                }
                
                // Degree with field of study - Bold
                let degree = edu.degree || edu.title || edu.qualification || 'Degree';
                if (edu.field || edu.fieldOfStudy || edu.major) {
                    const field = edu.field || edu.fieldOfStudy || edu.major;
                    degree = `${degree}${field ? ` in ${field}` : ''}`;
                }
                
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                addText(degree, margin, yPosition);
                
                // Year aligned to right
                const year = edu.graduationYear || edu.endDate || edu.year || edu.completionYear || edu.graduationDate;
                if (year) {
                    doc.setTextColor(120, 120, 120);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    const yearWidth = doc.getTextWidth(year.toString());
                    addText(year.toString(), pageWidth - margin - yearWidth, yPosition);
                }
                yPosition += 5;

                // Institution - Blue color
                const institution = edu.institution || edu.school || edu.university || edu.college || 'Institution';
                doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                addText(institution, margin, yPosition);
                
                yPosition += 7;
            });
        }

        // Skills Section with categories
        if (data.skills && data.skills.length > 0) {
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = margin + 10;
            }
            
            yPosition = addSection('Technical Skills', yPosition);
            
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            // Check if skills are categorized (have items or category property)
            const hasCategorizedSkills = Array.isArray(data.skills) && 
                data.skills.some((skill: any) => (skill.items && Array.isArray(skill.items)) || skill.category);
            
            if (hasCategorizedSkills) {
                // Handle categorized skills format: [{category: "Technical", items: [...]}, ...]
                data.skills.forEach((skillGroup: any) => {
                    if (!skillGroup || (!skillGroup.items && !skillGroup.category)) return;
                    
                    const category = skillGroup.category || 'Skills';
                    const items = skillGroup.items || [];
                    
                    if (items.length > 0) {
                        // Category header - Bold, dark color
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(10.5);
                        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                        addText(`${category}:`, margin, yPosition);
                        yPosition += 4.5;
                        
                        // Skills list - Normal, separated by bullets
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10);
                        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                        
                        const skillItems = items.map((item: any) => {
                            if (typeof item === 'string') return item;
                            return item.name || item.skill || item.title || String(item) || '';
                        }).filter((item: string) => item.trim() !== '');
                        
                        if (skillItems.length > 0) {
                            const skillText = skillItems.join(' • ');
                            const skillLines = doc.splitTextToSize(skillText, maxWidth - 3);
                            addText(skillLines, margin + 2, yPosition);
                            yPosition += skillLines.length * 4.5 + 4;
                        }
                    }
                });
            } else if (Array.isArray(data.skills)) {
                // Handle simple array format
                const skillsToDisplay = data.skills.map((skill: any) => {
                    if (typeof skill === 'string') {
                        return skill;
                    } else if (typeof skill === 'object' && skill !== null) {
                        return skill.name || skill.skill || skill.title || Object.values(skill)[0] || '';
                    }
                    return '';
                }).filter((skill: string) => skill.trim() !== '');
                
                if (skillsToDisplay.length > 0) {
                    const skillsText = skillsToDisplay.join(' • ');
                    const skillLines = doc.splitTextToSize(skillsText, maxWidth);
                    addText(skillLines, margin, yPosition);
                    yPosition += skillLines.length * 4.5 + 5;
                }
            } else if (typeof data.skills === 'object' && data.skills !== null) {
                // Handle object format like {technical: [...], soft: [...]}
                Object.entries(data.skills).forEach(([category, skills]: [string, any]) => {
                    if (Array.isArray(skills)) {
                        const categorySkills = skills.map((s: any) => 
                            typeof s === 'string' ? s : (s.name || s.skill || '')
                        ).filter((s: string) => s);
                        
                        if (categorySkills.length > 0) {
                            // Add category header - Bold
                            doc.setFont('helvetica', 'bold');
                            doc.setFontSize(10.5);
                            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                            addText(`${category.charAt(0).toUpperCase() + category.slice(1)}:`, margin, yPosition);
                            yPosition += 4.5;
                            
                            // Add skills - Normal, bullet separated
                            doc.setFont('helvetica', 'normal');
                            doc.setFontSize(10);
                            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                            const skillText = categorySkills.join(' • ');
                            const skillLines = doc.splitTextToSize(skillText, maxWidth - 3);
                            addText(skillLines, margin + 2, yPosition);
                            yPosition += skillLines.length * 4.5 + 4;
                        }
                    }
                });
            }
        }

        // Certifications Section
        if (data.certifications && data.certifications.length > 0) {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = margin + 10;
            }
            
            yPosition = addSection('Certifications', yPosition);
            
            data.certifications.forEach((cert: any) => {
                if (yPosition > pageHeight - margin - 25) {
                    doc.addPage();
                    yPosition = margin + 10;
                }
                
                const certName = typeof cert === 'string' ? cert : (cert.name || cert.title || cert.certification || 'Certification');
                
                // Certification name - Bold
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                addText(certName, margin, yPosition);
                
                // Add issuer if available (on same line with dash)
                if (typeof cert === 'object' && cert.issuer) {
                    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    addText(` - ${cert.issuer}`, margin + doc.getTextWidth(certName), yPosition);
                }
                
                // Add date if available (right-aligned)
                if (typeof cert === 'object' && (cert.date || cert.year || cert.issueDate)) {
                    const certDate = cert.date || cert.year || cert.issueDate;
                    const dateText = `(${certDate})`;
                    const dateWidth = doc.getTextWidth(dateText);
                    doc.setTextColor(120, 120, 120);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    addText(dateText, pageWidth - margin - dateWidth, yPosition);
                }
                
                yPosition += 6;
            });
        }

        // Languages Section
        if (data.languages && data.languages.length > 0) {
            if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = margin + 10;
            }
            
            yPosition = addSection('Languages', yPosition);
            
            doc.setTextColor(textColor[0], textColor[1], textColor[2]);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            const languages = data.languages.map((lang: any) => {
                if (typeof lang === 'string') return lang;
                const langName = lang.language || lang.name || lang.lang || '';
                const proficiency = lang.proficiency || lang.level || '';
                return langName && proficiency ? `${langName} (${proficiency})` : (langName || String(lang));
            }).filter((lang: string) => lang.trim() !== '');
            
            if (languages.length > 0) {
                const langText = languages.join(' • ');
                const langLines = doc.splitTextToSize(langText, maxWidth);
                addText(langLines, margin, yPosition);
                yPosition += langLines.length * 5 + 5;
            }
        }

        // Projects Section
        if (data.projects && data.projects.length > 0) {
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = margin + 10;
            }
            
            yPosition = addSection('Projects', yPosition);
            
            data.projects.forEach((project: any) => {
                if (yPosition > pageHeight - 40) {
                    doc.addPage();
                    yPosition = margin + 10;
                }
                
                // Project name
                const projectName = project.name || project.title || project.project || 'Project';
                doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                addText(projectName, margin, yPosition);
                yPosition += 6;
                
                // Technologies if available
                if (project.technologies || project.tech) {
                    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    const techText = `Technologies: ${project.technologies || project.tech}`;
                    addText(techText, margin + 3, yPosition);
                    yPosition += 5;
                }
                
                // Description
                if (project.description) {
                    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    const descLines = doc.splitTextToSize(project.description, maxWidth - 5);
                    addText(descLines, margin + 3, yPosition);
                    yPosition += descLines.length * 4.5;
                }
                
                // Links if available
                if (project.demoUrl || project.githubUrl || project.url) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(9);
                    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
                    const links = [];
                    if (project.demoUrl) links.push(`Demo: ${project.demoUrl}`);
                    if (project.githubUrl) links.push(`GitHub: ${project.githubUrl}`);
                    if (project.url && !project.demoUrl && !project.githubUrl) links.push(`URL: ${project.url}`);
                    if (links.length > 0) {
                        addText(links.join(' | '), margin + 3, yPosition);
                        yPosition += 5;
                    }
                }
                
                yPosition += 4;
            });
        }

        const filename = `Resume_${sanitizeFilename(applicantName)}.pdf`;
        doc.save(filename);
    } catch (error) {
        console.error('Error downloading resume:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to generate PDF: ${errorMessage}. Please check the console for more details.`);
    }
  };

  return (
    <Dialog open={!!resume} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden flex flex-col p-0" style={{ maxWidth: '1200px', width: '1200px' }}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold">Resume - {resume.parsedData?.name || 'Resume'}</DialogTitle>
              <DialogDescription>
                Full resume details for {resume.parsedData?.name || 'the candidate'}
              </DialogDescription>
            </div>
            <Button
              onClick={handleDownloadResume}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 bg-gray-100 p-8">
          <ResumeViewer resume={resume} applicant={applicant} jobs={jobs} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Resume Viewer Component
function ResumeViewer({ resume, applicant, jobs }: { resume: any, applicant?: Applicant | null, jobs?: Job[] }) {
  const data = resume.parsedData || {};
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);

  // Get job title from applicant job object or jobs array
  const getJobTitle = () => {
    if (!applicant) return 'Position';
    // First try to get from job object if it's populated
    if (typeof applicant.job === 'object' && applicant.job?.title) {
      return applicant.job.title;
    }
    // Fallback: try to find in jobs array using jobId
    if (applicant.jobId && jobs) {
      const job = jobs.find(j => j.id === applicant.jobId);
      if (job?.title) {
        return job.title;
      }
    }
    return 'Position';
  };

  // Get applicant name
  const getApplicantName = () => {
    if (applicant?.name) return applicant.name;
    return data.name || 'Candidate';
  };

  // Get applicant email
  const getApplicantEmail = () => {
    if (applicant?.email) return applicant.email;
    return data.email || '';
  };

  // Get applicant phone
  const getApplicantPhone = () => {
    if (applicant?.phone) return applicant.phone;
    return data.phone || '';
  };

  // Get applicant location
  const getApplicantLocation = () => {
    if (applicant?.location) return applicant.location;
    return data.location || '';
  };

  // Download cover letter as PDF
  const handleDownloadCoverLetter = async () => {
    if (!applicant?.coverLetter) return;
    
    const jobTitle = getJobTitle();
    const applicantName = getApplicantName();
    const coverLetterContent = applicant.coverLetter || '';
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Sanitize filename - remove special characters
    const sanitizeFilename = (str: string) => {
      return str.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    };

    // Dynamically load jsPDF from CDN
    const loadJsPDF = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        const win = window as any;
        
        // Check if already loaded (multiple possible formats)
        if (win.jspdf && win.jspdf.jsPDF) {
          resolve(win.jspdf);
          return;
        }
        if (win.jspdf?.jsPDF) {
          resolve(win.jspdf);
          return;
        }
        if (win.jsPDF) {
          resolve({ jsPDF: win.jsPDF });
          return;
        }
        
        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="jspdf"]');
        if (existingScript) {
          // Wait a bit and check again
          const checkInterval = setInterval(() => {
            if (win.jspdf && win.jspdf.jsPDF) {
              clearInterval(checkInterval);
              resolve(win.jspdf);
            } else if (win.jsPDF) {
              clearInterval(checkInterval);
              resolve({ jsPDF: win.jsPDF });
            }
          }, 100);
          
          setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('jsPDF loading timeout'));
          }, 5000);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          // Wait a moment for the library to initialize
          setTimeout(() => {
            // Try multiple ways to access jsPDF
            if (win.jspdf && win.jspdf.jsPDF) {
              resolve(win.jspdf);
            } else if (win.jspdf?.jsPDF) {
              resolve(win.jspdf);
            } else if (win.jsPDF) {
              resolve({ jsPDF: win.jsPDF });
            } else if ((window as any)['jspdf']) {
              const jspdfLib = (window as any)['jspdf'];
              if (jspdfLib.jsPDF) {
                resolve(jspdfLib);
              } else {
                reject(new Error('jsPDF loaded but jsPDF.jsPDF is not accessible'));
              }
            } else {
              console.error('jsPDF loading failed - available on window:', Object.keys(win).filter(k => k.toLowerCase().includes('pdf')));
              reject(new Error('jsPDF loaded but not accessible. Check console for details.'));
            }
          }, 200);
        };
        script.onerror = () => reject(new Error('Failed to load jsPDF script'));
        document.head.appendChild(script);
      });
    };

    try {
      const jsPDFLib = await loadJsPDF();
      const { jsPDF } = jsPDFLib;
      
      if (!jsPDF) {
        throw new Error('jsPDF is not available');
      }
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 25; // 25mm margin (approximately 1 inch)
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Set font
      doc.setFont('times', 'normal');
      doc.setFontSize(12);

      // Sender Information
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      const senderLines = doc.splitTextToSize(applicantName, maxWidth);
      doc.text(senderLines, margin, yPosition);
      yPosition += senderLines.length * 6;

      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      const email = getApplicantEmail();
      if (email) {
        doc.text(email, margin, yPosition);
        yPosition += 5;
      }
      const phone = getApplicantPhone();
      if (phone) {
        doc.text(phone, margin, yPosition);
        yPosition += 5;
      }
      const location = getApplicantLocation();
      if (location) {
        doc.text(location, margin, yPosition);
        yPosition += 5;
      }
      yPosition += 5;

      // Date (right-aligned)
      doc.setFontSize(12);
      const dateText = date;
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, pageWidth - margin - dateWidth, yPosition);
      yPosition += 10;

      // Recipient Information
      doc.text('Hiring Manager', margin, yPosition);
      yPosition += 5;
      doc.text('Company Name', margin, yPosition);
      yPosition += 10;

      // Subject Line
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      const subjectText = `Re: Application for ${jobTitle} Position`;
      const subjectLines = doc.splitTextToSize(subjectText, maxWidth);
      doc.text(subjectLines, margin, yPosition);
      yPosition += subjectLines.length * 6 + 5;

      // Cover Letter Content
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      const contentLines = doc.splitTextToSize(coverLetterContent, maxWidth);
      
      for (let i = 0; i < contentLines.length; i++) {
        if (yPosition > pageHeight - margin - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(contentLines[i], margin, yPosition);
        yPosition += 6;
      }

      yPosition += 10;

      // Closing
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text('Sincerely,', margin, yPosition);
      yPosition += 15;
      doc.setFont('times', 'bold');
      doc.text(applicantName, margin, yPosition);

      // Save PDF
      const filename = `Cover_Letter_${sanitizeFilename(applicantName)}_${sanitizeFilename(jobTitle)}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate PDF: ${errorMessage}. Please check the console for more details.`);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="space-y-6 bg-white shadow-xl p-8 text-gray-800 font-sans text-sm" style={{ width: '794px', minHeight: '1123px' }}>
        {/* Cover Letter Button */}
        {applicant?.coverLetter && (
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowCoverLetterModal(true)}
              className="mb-2"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Cover Letter
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="text-center pb-6 bg-gradient-to-r from-slate-700 to-slate-600 text-white p-6 -m-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">{getApplicantName()}</h1>
          <p className="text-xl mb-4">{data.jobTitle || resume.role || 'Professional'}</p>
          
          <div className="flex justify-center flex-wrap gap-4 text-sm opacity-90">
            {getApplicantEmail() && <span>Email: {getApplicantEmail()}</span>}
            {getApplicantPhone() && <span>Phone: {getApplicantPhone()}</span>}
            {getApplicantLocation() && <span>Location: {getApplicantLocation()}</span>}
            {data.linkedin && <span>LinkedIn: {data.linkedin}</span>}
            {data.github && <span>GitHub: {data.github}</span>}
          </div>
        </div>

      {/* Professional Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-3 uppercase tracking-wide border-b border-blue-500 pb-1">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4 uppercase tracking-wide border-b border-blue-500 pb-1">Professional Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-700">{exp.title || exp.role || exp.position || exp.jobTitle || 'Position'}</h3>
                  <span className="text-sm text-gray-500 italic">
                    {exp.startDate || exp.from || 'Start'} - {exp.endDate || exp.to || (exp.current ? 'Present' : 'End')}
                  </span>
                </div>
                <p className="text-blue-600 font-semibold text-sm mb-2">{exp.company || exp.organization || exp.employer || 'Company'}</p>
                {exp.location && <p className="text-sm text-gray-600 mb-2">{exp.location}</p>}
                {(exp.description || exp.responsibilities) && (
                  <div className="text-gray-600 text-sm">
                    {(exp.description || exp.responsibilities).split('\n').filter((desc: string) => desc.trim()).map((desc: string, i: number) => (
                      <p key={i} className="mb-1">• {desc.replace(/^[•\-\*]\s*/, '').trim()}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4 uppercase tracking-wide border-b border-blue-500 pb-1">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-700">{edu.degree || edu.title || edu.qualification || 'Degree'}</h3>
                    <p className="text-blue-600 font-semibold text-sm">{edu.school || edu.institution || edu.university || 'Institution'}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {edu.graduationYear || edu.graduationDate || edu.endDate || edu.year || edu.completionYear || ''}
                  </span>
                </div>
                {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4 uppercase tracking-wide border-b border-blue-500 pb-1">Technical Skills</h2>
          <div className="space-y-2">
            {(() => {
              // Handle different skill data formats
              if (typeof data.skills === 'object' && !Array.isArray(data.skills)) {
                return Object.entries(data.skills).map(([category, skills]: [string, any]) => (
                  <div key={category}>
                    <span className="font-semibold text-slate-700">{category.charAt(0).toUpperCase() + category.slice(1)}:</span>
                    <span className="ml-2 text-gray-600">
                      {Array.isArray(skills) 
                        ? skills.map(s => typeof s === 'string' ? s : s.name || s.skill || '').filter(s => s).join(' • ')
                        : ''
                      }
                    </span>
                  </div>
                ));
              } else if (Array.isArray(data.skills)) {
                // Check if it's categorized skills array
                if (data.skills.some((skill: any) => skill.items || skill.category)) {
                  return data.skills.map((skillGroup: any, idx: number) => (
                    skillGroup.items && skillGroup.items.length > 0 && (
                      <div key={idx}>
                        <span className="font-semibold text-slate-700">{skillGroup.category}:</span>
                        <span className="ml-2 text-gray-600">{skillGroup.items.join(' • ')}</span>
                      </div>
                    )
                  ));
                } else {
                  // Simple array of skills
                  const skillsText = data.skills.map((skill: any) => {
                    if (typeof skill === 'string') return skill;
                    if (typeof skill === 'object' && skill !== null) {
                      return skill.name || skill.skill || skill.title || Object.values(skill)[0] || '';
                    }
                    return '';
                  }).filter((skill: string) => skill.trim() !== '').join(' • ');
                  
                  return <p className="text-gray-600">{skillsText}</p>;
                }
              }
              return <p className="text-gray-600">Skills will be displayed here</p>;
            })()}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4 uppercase tracking-wide border-b border-blue-500 pb-1">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-slate-700">
                    {typeof cert === 'string' ? cert : (cert.name || cert.title || cert.certification || 'Certification')}
                  </span>
                  {typeof cert === 'object' && cert.issuer && (
                    <span className="ml-2 text-gray-600">- {cert.issuer}</span>
                  )}
                </div>
                {typeof cert === 'object' && (cert.date || cert.year || cert.issueDate) && (
                  <span className="text-sm text-gray-500">
                    ({cert.date || cert.year || cert.issueDate})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4 uppercase tracking-wide border-b border-blue-500 pb-1">Languages</h2>
          <p className="text-gray-600">
            {data.languages.map((lang: any) => 
              typeof lang === 'string' 
                ? lang 
                : `${lang.language || lang.name || 'Language'} ${lang.proficiency ? `(${lang.proficiency})` : ''}`
            ).filter(Boolean).join(' • ')}
          </p>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Projects</h2>
          <div className="space-y-3">
            {data.projects.map((project: any, idx: number) => (
              <div key={idx}>
                <h3 className="font-bold text-gray-900">{project.name || 'Project'}</h3>
                {project.technologies && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Technologies:</span> {project.technologies}
                  </p>
                )}
                {project.description && (
                  <p className="text-sm text-gray-700 mb-1">{project.description}</p>
                )}
                {(project.demoUrl || project.githubUrl) && (
                  <div className="text-xs text-blue-600">
                    {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">Demo</a>}
                    {project.demoUrl && project.githubUrl && <span> | </span>}
                    {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      {/* Cover Letter Modal */}
      {showCoverLetterModal && applicant?.coverLetter && (
        <Dialog open={showCoverLetterModal} onOpenChange={setShowCoverLetterModal}>
          <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] overflow-hidden flex flex-col p-0" style={{ maxWidth: '1200px', width: '1200px' }}>
            <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">Cover Letter - {getApplicantName()}</DialogTitle>
                <Button
                  onClick={handleDownloadCoverLetter}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 bg-gray-100 p-8 flex justify-center">
              {/* A4 Letter Format Container - 794px width (A4 at 96 DPI) */}
              <div 
                className="bg-white shadow-xl"
                style={{
                  width: '794px',
                  minHeight: '1123px',
                  padding: '96px',
                  fontFamily: 'Times New Roman, serif',
                  fontSize: '12pt',
                  lineHeight: '1.6',
                  color: '#000'
                }}
              >
                {/* Sender Information */}
                <div className="mb-8">
                  <div className="font-bold text-base mb-1">{getApplicantName()}</div>
                  {getApplicantEmail() && <div className="text-sm">{getApplicantEmail()}</div>}
                  {getApplicantPhone() && <div className="text-sm">{getApplicantPhone()}</div>}
                  {getApplicantLocation() && <div className="text-sm">{getApplicantLocation()}</div>}
                </div>

                {/* Date */}
                <div className="text-right mb-8">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>

                {/* Recipient Information */}
                <div className="mb-8">
                  <div>Hiring Manager</div>
                  <div>Company Name</div>
                </div>

                {/* Subject Line */}
                <div className="font-bold mb-6">
                  Re: Application for {getJobTitle()} Position
                </div>

                {/* Cover Letter Content */}
                <div className="whitespace-pre-wrap mb-8" style={{ textAlign: 'justify', lineHeight: '1.8' }}>
                  {applicant.coverLetter}
                </div>

                {/* Closing */}
                <div className="mt-12">
                  <div className="mb-8">Sincerely,</div>
                  <div className="mt-10 font-bold">{getApplicantName()}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}