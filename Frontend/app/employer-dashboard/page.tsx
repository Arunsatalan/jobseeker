"use client";
import { useState } from "react";
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


// Mock data
const mockCompany = {
  name: "TechCorp Solutions",
  email: "hr@techcorp.com",
  phone: "+1 234-567-8900",
  plan: "Professional" as const,
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

const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    postedDate: "2025-12-01",
    expiryDate: "2025-12-31",
    applicantsCount: 23,
    status: "Open" as const,
  },
  {
    id: "2",
    title: "Product Manager",
    department: "Product",
    postedDate: "2025-11-28",
    expiryDate: "2025-12-28",
    applicantsCount: 15,
    status: "Open" as const,
  },
  {
    id: "3",
    title: "UX Designer",
    department: "Design",
    postedDate: "2025-11-25",
    expiryDate: "2025-12-25",
    applicantsCount: 31,
    status: "Paused" as const,
  },
];

export default function EmployerDashboard() {
  const [company, setCompany] = useState(mockCompany);
  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState(mockStats);
  const [jobs, setJobs] = useState(mockJobs);

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
    console.log("Post new job");
    // Navigate to job posting form
  };

  return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-amber-50 flex">
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
              />
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
  );
}