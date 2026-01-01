import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
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
  Loader2,
  X
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
  const [selectedResume, setSelectedResume] = useState<any | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);

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
            console.error('Resume not found. Available resumes:', resumes.map(r => ({
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
function ApplicantDetails({ applicant, jobs, onStatusChange, onViewResume, loadingResume }: { applicant: Applicant, jobs: Job[], onStatusChange: (status: string) => void, onViewResume: (applicant: Applicant) => void, loadingResume: boolean }) {
  const [notes, setNotes] = useState(applicant.notes || "");
  const [rating, setRating] = useState(applicant.rating || 0);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);

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
        alert('Please log in to download resume');
        return;
      }

      // Try to download via API if resume has _id
      if (resume._id) {
        try {
          const response = await fetch(`/api/v1/resumes/${resume._id}/download`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${resume.parsedData?.name || 'resume'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return;
          }
        } catch (error) {
          console.warn('API download failed, trying client-side generation:', error);
        }
      }

      // Generate PDF client-side using jsPDF
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
          if (win.jspdf && win.jspdf.jsPDF) {
            resolve(win.jspdf);
            return;
          }
          if (win.jsPDF) {
            resolve({ jsPDF: win.jsPDF });
            return;
          }
          
          const existingScript = document.querySelector('script[src*="jspdf"]');
          if (existingScript) {
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
            setTimeout(() => {
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
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      const nameLines = doc.splitTextToSize(applicantName, maxWidth);
      doc.text(nameLines, margin, yPosition);
      yPosition += nameLines.length * 8 + 3;

      const role = resume.role || data.jobTitle || 'Professional';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.text(role, margin, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      const contactInfo = [];
      if (data.email) contactInfo.push(data.email);
      if (data.phone) contactInfo.push(data.phone);
      if (data.location) contactInfo.push(data.location);
      if (contactInfo.length > 0) {
        doc.text(contactInfo.join(' | '), margin, yPosition);
        yPosition += 6;
      }
      
      if (data.linkedin || data.github) {
        const links = [];
        if (data.linkedin) links.push(`LinkedIn: ${data.linkedin}`);
        if (data.github) links.push(`GitHub: ${data.github}`);
        doc.text(links.join(' | '), margin, yPosition);
        yPosition += 6;
      }
      yPosition += 5;

      // Professional Summary
      if (data.summary) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('PROFESSIONAL SUMMARY', margin, yPosition);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(data.summary, maxWidth);
        for (let i = 0; i < summaryLines.length; i++) {
          if (yPosition > pageHeight - margin - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(summaryLines[i], margin, yPosition);
          yPosition += 5;
        }
        yPosition += 5;
      }

      // Experience
      if (data.experience && data.experience.length > 0) {
        if (yPosition > pageHeight - margin - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('PROFESSIONAL EXPERIENCE', margin, yPosition);
        yPosition += 7;
        
        for (const exp of data.experience) {
          if (yPosition > pageHeight - margin - 30) {
            doc.addPage();
            yPosition = margin;
          }
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          const roleText = exp.role || exp.position || 'Position';
          doc.text(roleText, margin, yPosition);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const dateStr = `${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
          const dateWidth = doc.getTextWidth(dateStr);
          doc.text(dateStr, pageWidth - margin - dateWidth, yPosition);
          yPosition += 6;
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          const company = exp.company || exp.organization || 'Company';
          doc.text(company, margin, yPosition);
          if (exp.location) {
            doc.setFont('helvetica', 'normal');
            doc.text(` | ${exp.location}`, margin + doc.getTextWidth(company), yPosition);
          }
          yPosition += 6;
          
          if (exp.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const descLines = doc.splitTextToSize(exp.description, maxWidth);
            for (let i = 0; i < descLines.length; i++) {
              if (yPosition > pageHeight - margin - 20) {
                doc.addPage();
                yPosition = margin;
              }
              doc.text(descLines[i], margin, yPosition);
              yPosition += 4.5;
            }
          }
          yPosition += 4;
        }
      }

      // Education
      if (data.education && data.education.length > 0) {
        if (yPosition > pageHeight - margin - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('EDUCATION', margin, yPosition);
        yPosition += 7;
        
        for (const edu of data.education) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          const degreeText = `${edu.degree || 'Degree'}${edu.field ? ` in ${edu.field}` : ''}`;
          doc.text(degreeText, margin, yPosition);
          if (edu.graduationDate) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const gradWidth = doc.getTextWidth(edu.graduationDate);
            doc.text(edu.graduationDate, pageWidth - margin - gradWidth, yPosition);
          }
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const school = edu.school || edu.institution || 'School';
          doc.text(school, margin, yPosition);
          if (edu.gpa) {
            doc.text(`GPA: ${edu.gpa}`, margin + doc.getTextWidth(school) + 5, yPosition);
          }
          yPosition += 5;
        }
        yPosition += 3;
      }

      // Skills
      if (data.skills && data.skills.length > 0) {
        if (yPosition > pageHeight - margin - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('SKILLS', margin, yPosition);
        yPosition += 7;
        
        for (const skillGroup of data.skills) {
          if (skillGroup.items && skillGroup.items.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(`${skillGroup.category}:`, margin, yPosition);
            yPosition += 5;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const skillsText = skillGroup.items.join(', ');
            const skillLines = doc.splitTextToSize(skillsText, maxWidth);
            for (let i = 0; i < skillLines.length; i++) {
              if (yPosition > pageHeight - margin - 20) {
                doc.addPage();
                yPosition = margin;
              }
              doc.text(skillLines[i], margin, yPosition);
              yPosition += 4.5;
            }
            yPosition += 2;
          }
        }
      }

      // Certifications
      if (data.certifications && data.certifications.length > 0) {
        if (yPosition > pageHeight - margin - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('CERTIFICATIONS', margin, yPosition);
        yPosition += 7;
        
        for (const cert of data.certifications) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(cert.title || 'Certification', margin, yPosition);
          yPosition += 5;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const certInfo = [];
          if (cert.issuer) certInfo.push(cert.issuer);
          if (cert.date) certInfo.push(cert.date);
          if (certInfo.length > 0) {
            doc.text(certInfo.join(' - '), margin, yPosition);
            yPosition += 5;
          }
        }
        yPosition += 3;
      }

      // Languages
      if (data.languages && data.languages.length > 0) {
        if (yPosition > pageHeight - margin - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('LANGUAGES', margin, yPosition);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const langText = data.languages.map((lang: any) => 
          `${lang.language || lang.name} (${lang.proficiency})`
        ).join(', ');
        doc.text(langText, margin, yPosition);
        yPosition += 6;
      }

      // Projects
      if (data.projects && data.projects.length > 0) {
        if (yPosition > pageHeight - margin - 30) {
          doc.addPage();
          yPosition = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('PROJECTS', margin, yPosition);
        yPosition += 7;
        
        for (const project of data.projects) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(project.name || 'Project', margin, yPosition);
          yPosition += 5;
          
          if (project.technologies) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Technologies: ${project.technologies}`, margin, yPosition);
            yPosition += 5;
          }
          
          if (project.description) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const projLines = doc.splitTextToSize(project.description, maxWidth);
            for (let i = 0; i < projLines.length; i++) {
              if (yPosition > pageHeight - margin - 20) {
                doc.addPage();
                yPosition = margin;
              }
              doc.text(projLines[i], margin, yPosition);
              yPosition += 4.5;
            }
          }
          yPosition += 3;
        }
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
        <div className="text-center pb-6 border-b-2 border-blue-600">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{data.name || 'Candidate Name'}</h1>
        <p className="text-lg text-blue-600 font-medium mb-3">{resume.role || 'Professional'}</p>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex flex-wrap justify-center gap-3">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>|</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>|</span>}
            {data.location && <span>{data.location}</span>}
          </div>
          {(data.linkedin || data.github) && (
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {data.linkedin && <span>LinkedIn: {data.linkedin}</span>}
              {data.github && data.linkedin && <span>|</span>}
              {data.github && <span>GitHub: {data.github}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Summary</h2>
          <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900">{exp.role || exp.position || 'Job Title'}</h3>
                  <span className="text-sm text-gray-600">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-medium">{exp.company || exp.organization || 'Company'}</p>
                {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                {exp.description && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'} in {edu.field || 'Field'}</h3>
                  <span className="text-sm text-gray-600">{edu.graduationDate}</span>
                </div>
                <p className="text-sm text-gray-700">{edu.school || edu.institution || 'School'}</p>
                {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Skills</h2>
          <div className="space-y-2">
            {data.skills.map((skillGroup: any, idx: number) => (
              skillGroup.items && skillGroup.items.length > 0 && (
                <div key={idx}>
                  <p className="text-sm font-medium text-gray-900">{skillGroup.category}:</p>
                  <p className="text-sm text-gray-700">{skillGroup.items.join(', ')}</p>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert: any, idx: number) => (
              <div key={idx} className="flex items-start">
                <span className="mr-2 text-gray-600 font-bold">•</span>
                <p className="text-sm text-gray-700">
                  <span className="font-bold">{cert.title || 'Certification'}</span>
                  {cert.issuer && <span> - {cert.issuer}</span>}
                  {cert.date && <span> ({cert.date})</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {data.languages && data.languages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Languages</h2>
          <p className="text-sm text-gray-700">
            {data.languages.map((lang: any) => `${lang.language || lang.name} (${lang.proficiency})`).join(', ')}
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