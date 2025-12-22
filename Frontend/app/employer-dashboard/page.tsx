"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Building2, Briefcase, Users, Calendar, MessageCircle, Settings, CreditCard } from "lucide-react";
import { EmployerSidebar } from "@/components/employer/EmployerSidebar";
import { DashboardOverview } from "@/components/employer/DashboardOverview";
import { JobManagement } from "@/components/employer/JobManagement";
import { ApplicantTracking } from "@/components/employer/ApplicantTracking";
import { InterviewScheduling } from "@/components/employer/InterviewScheduling";
import { MessagingSystem } from "@/components/employer/MessagingSystem";
import { CompanyProfile } from "@/components/employer/CompanyProfile";
import { PlanBilling } from "@/components/employer/PlanBilling";
import { AccountSettings } from "@/components/employer/AccountSettings";
import { PostJobDialog } from "@/components/employer/PostJobDialog";
import { ViewJobDialog } from "@/components/employer/ViewJobDialog";

// Mock data (keep until fully removed if needed, but we are using real data now)
const mockCompany = {
  name: "TechCorp Solutions",
  email: "hr@techcorp.com",
  phone: "+1 234-567-8900",
  plan: "Professional",
  logo: "https://ui-avatars.com/api/?name=TechCorp+Solutions&background=0d47a1&color=fff",
  industry: "Technology",
  size: "51-200 employees",
  location: "San Francisco, CA",
};

const mockStats = {
  totalJobs: 24,
  activeJobs: 12,
  totalApplications: 145,
  hiresMade: 8,
};

const mockJobs: any[] = [];

export default function EmployerDashboard() {
  const [company, setCompany] = useState<any>({
    name: "Loading...",
    email: "",
    phone: "",
    plan: "Standard",
    logo: "",
    industry: "",
    size: "",
    location: "",
  });
  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState(mockStats);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Action states
  const [viewingJob, setViewingJob] = useState<any | null>(null);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [postJobMode, setPostJobMode] = useState<'create' | 'edit' | 'duplicate'>('create');

  const { toast } = useToast();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchJobs = async (showLoading = true) => {
    if (showLoading) setIsLoadingJobs(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/v1/jobs/employer/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Map backend jobs to the format expected by components
        const backendJobs = response.data.data;
        const mappedJobs = backendJobs.map((job: any) => ({
          ...job, // Preserve all original fields for editing
          id: job._id,
          title: job.title,
          department: job.category || job.industry,
          postedDate: new Date(job.createdAt).toLocaleDateString(),
          expiryDate: job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : 'No Deadline',
          applicantsCount: job.stats?.applications || 0,
          status: job.status === 'published' ? 'Open' :
            job.status === 'paused' ? 'Paused' :
              job.status === 'draft' ? 'Draft' : 'Closed'
        }));
        setJobs(mappedJobs);

        // Calculate real stats from fetched jobs
        const totalApps = backendJobs.reduce((sum: number, job: any) => sum + (job.stats?.applications || 0), 0);
        const activeCount = backendJobs.filter((job: any) => job.status === 'published').length;

        setStats(prev => ({
          ...prev,
          totalJobs: mappedJobs.length,
          activeJobs: activeCount,
          totalApplications: totalApps,
          // hiresMade can stay mock for now as it's not in the simple job model
        }));
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error fetching jobs",
        description: error.response?.data?.message || "Failed to load your job postings.",
        variant: "destructive",
      });
    } finally {
      if (showLoading) setIsLoadingJobs(false);
    }
  };

  const fetchCompanyData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${apiUrl}/api/v1/user-profiles/employer/company-data`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success && response.data.data) {
        setCompany(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanyData();
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to signin page
    window.location.href = '/';
  };

  const handleUpgrade = () => {
    console.log("Upgrade plan");
    // Implement upgrade functionality
  };

  const handlePostJob = () => {
    setPostJobMode('create');
    setEditingJob(null);
    setIsPostJobOpen(true);
  };

  const handleView = (job: any) => {
    setViewingJob(job);
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    setPostJobMode('edit');
    setIsPostJobOpen(true);
  };

  const handleDuplicate = (job: any) => {
    setEditingJob(job);
    setPostJobMode('duplicate');
    setIsPostJobOpen(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    // Optimistic Update: Immediately remove from UI
    setJobs(currentJobs => currentJobs.filter(job => job.id !== jobId));

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${apiUrl}/api/v1/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Job Deleted", description: "The job posting has been permanently removed." });
      fetchJobs(false); // Background sync, no loading spinner
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Error", description: "Failed to delete job.", variant: "destructive" });
      fetchJobs(false); // Revert state on error
    }
  };

  const handleToggleStatus = async (job: any) => {
    const newStatus = job.status === 'Open' ? 'paused' : 'published';
    const uiStatus = newStatus === 'published' ? 'Open' : 'Paused';

    // Optimistic Update
    setJobs(currentJobs => currentJobs.map(j =>
      j.id === job.id ? { ...j, status: uiStatus } : j
    ));

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/api/v1/jobs/${job.id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Status Updated", description: `Job is now ${uiStatus}.` });
      fetchJobs(false); // Background sync
    } catch (error) {
      console.error("Status update error:", error);
      toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
      fetchJobs(false); // Revert
    }
  };

  return (
    <ProtectedLayout requiredRole="employer">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex">
        {/* Employer Sidebar */}
        <EmployerSidebar
          company={company}
          activeSection={activeSection}
          onNavigate={setActiveSection}
          onLogout={handleLogout}
          onUpgrade={handleUpgrade}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2" style={{ borderColor: '#02243b' }}>
                  <AvatarImage src={company.logo} alt={company.name} />
                  <AvatarFallback style={{ backgroundColor: '#f5f3f0' }}>
                    <Building2 className="h-5 w-5" style={{ color: '#02243b' }} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{company.name}</p>
                  <Badge className="text-xs" style={{ backgroundColor: '#f5f3f0', color: '#02243b' }}>
                    {company.plan}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10 pt-16 lg:pt-10">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Employer Dashboard</h1>
                <p className="text-gray-600">Manage your job postings, applicants, and company profile</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handlePostJob} style={{ backgroundColor: '#02243b' }} className="hover:opacity-80">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Post New Job
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Main Content - Show selected section only */}
            <div className="max-w-6xl mx-auto">
              {isLoadingJobs && (activeSection === "overview" || activeSection === "jobs") ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderTopColor: '#02243b', borderBottomColor: '#02243b' }}></div>
                  <p className="mt-4 text-gray-500 animate-pulse font-medium">Fetching your dashboard data...</p>
                </div>
              ) : (
                <>
                  {activeSection === "overview" && (
                    <DashboardOverview
                      company={company}
                      stats={stats}
                      recentJobs={jobs.slice(0, 3)}
                      onPostJob={handlePostJob}
                    />
                  )}

                  {activeSection === "jobs" && (
                    <JobManagement
                      jobs={jobs}
                      onPostJob={handlePostJob}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onToggleStatus={handleToggleStatus}
                      onDelete={handleDelete}
                    />
                  )}
                </>
              )}

              {activeSection === "applicants" && (
                <ApplicantTracking
                  jobs={jobs}
                />
              )}

              {activeSection === "interviews" && (
                <InterviewScheduling />
              )}

              {activeSection === "messages" && (
                <MessagingSystem />
              )}

              {activeSection === "profile" && (
                <CompanyProfile
                  company={company}
                  onUpdateCompany={setCompany}
                />
              )}

              {activeSection === "billing" && (
                <PlanBilling
                  company={company}
                  onUpgrade={handleUpgrade}
                />
              )}

              {activeSection === "settings" && (
                <AccountSettings
                  company={company}
                  onUpdateCompany={setCompany}
                />
              )}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
              <div className="flex justify-around">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col gap-1 ${activeSection === "overview" ? "" : ""}`}
                  style={activeSection === "overview" ? { color: '#02243b' } : {}}
                  onClick={() => setActiveSection("overview")}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs">Dashboard</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col gap-1`}
                  style={activeSection === "jobs" ? { color: '#02243b' } : {}}
                  onClick={() => setActiveSection("jobs")}
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs">Jobs</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col gap-1`}
                  style={activeSection === "applicants" ? { color: '#02243b' } : {}}
                  onClick={() => setActiveSection("applicants")}
                >
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Applicants</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col gap-1`}
                  style={activeSection === "settings" ? { color: '#02243b' } : {}}
                  onClick={() => setActiveSection("settings")}
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-xs">Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PostJobDialog
        open={isPostJobOpen}
        onOpenChange={setIsPostJobOpen}
        onSuccess={() => fetchJobs(false)} // No loading spinner on refresh
        jobToEdit={editingJob}
        mode={postJobMode}
      />
      <ViewJobDialog
        open={!!viewingJob}
        onOpenChange={(open) => !open && setViewingJob(null)}
        job={viewingJob}
      />
    </ProtectedLayout>
  );
}