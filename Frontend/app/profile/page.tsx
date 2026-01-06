"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, FileText, Briefcase, Settings, Loader2, TrendingUp, X } from "lucide-react";
import { Sidebar } from "@/components/profile/Sidebar";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ResumeListView } from "@/components/profile/ResumeListView";

import { ResumeBuilder } from "@/components/profile/ResumeBuilder";
import { JobPreferences } from "@/components/profile/JobPreferences";
import { CareerProgress } from "@/components/profile/CareerProgress";
import { ToolsAccess } from "@/components/profile/ToolsAccess";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { MatchedJobs } from "@/components/profile/MatchedJobs";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth()
  const userAny = user as any;
  const [userResumes, setUserResumes] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState("overview"); // Default to Overview (Dashboard)
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [showPreviewByDefault, setShowPreviewByDefault] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
  const [previewResumeData, setPreviewResumeData] = useState<any>(null);

  const [aiMode, setAiMode] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const searchParams = useSearchParams();

  // Check URL parameters for deep linking
  useEffect(() => {
    const resumeIdParam = searchParams.get('resumeId');
    const aiModeParam = searchParams.get('aiMode');

    if (resumeIdParam) {
      setEditingResumeId(resumeIdParam);
      if (aiModeParam === 'true') {
        setAiMode(true);
      }
    }
  }, [searchParams]);

  // Check if user needs to complete profile
  useEffect(() => {
    if (user && user.profileCompleted === false) {
      setNeedsProfileCompletion(true);
    }
  }, [user]);

  // Fetch user resumes on component mount
  useEffect(() => {
    const fetchUserResumes = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/v1/resumes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserResumes(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching resumes:', error);
      }
    };

    fetchUserResumes();
  }, [user]);

  const handleResumeDelete = async (index: number) => {
    const resume = userResumes[index];
    if (!resume || !resume._id) {
      console.error('Resume ID not found');
      alert('Unable to delete resume. Please try again.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${resume.filename || resume.title || 'Resume'}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        alert('Authentication failed. Please log in again.');
        return;
      }

      const response = await fetch(`/api/v1/resumes/${resume._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      setUserResumes((prev) => prev.filter((_, i) => i !== index));
      alert('Resume deleted successfully!');
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    }
  };

  const handleResumeEdit = (index: number) => {
    const resume = userResumes[index];
    if (resume) {
      setEditingResumeId(resume._id || resume.id);
      setAiMode(false);
    }
  };

  const handleCreateNewResume = () => {
    setEditingResumeId("new-resume");
    setAiMode(false);
  };

  const handleResumePreview = (index: number) => {
    const resume = userResumes[index];
    if (resume) {
      setPreviewResumeId(resume._id || resume.id);
      setPreviewResumeData(resume);
    }
  };

  const handleResumeDownload = (index: number) => {
    // Placeholder for download functionality
    console.log("Download requested for index:", index);
    alert("Resume download started...");
  };

  const handleResumeBuilderSave = async (data: any) => {
    console.log("Resume saved:", data);
    try {
      const token = localStorage.getItem('token');
      let response;
      let result;

      if (editingResumeId && editingResumeId !== "new-resume") {
        response = await fetch(`/api/v1/resumes/${editingResumeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: data.title,
            role: data.role,
            parsedData: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              location: data.location,
              linkedin: data.linkedin,
              github: data.github,
              summary: data.summary,
              experience: data.experience || [],
              education: data.education || [],
              skills: data.skills?.map((group: any) => ({
                category: group.category || 'other',
                items: group.items && Array.isArray(group.items) ? group.items.filter((item: any) => item && item.trim()) : []
              })) || [],
              certifications: data.certifications || [],
              languages: data.languages || [],
              projects: data.projects || [],
              references: data.references || [],
              optimizationMetadata: data.optimizationMetadata || {}
            }
          })
        });
      } else {
        response = await fetch('/api/v1/resumes/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }

      result = await response.json();
      console.log('Resume saved to database:', result);
      alert('Resume saved successfully!');

      if (editingResumeId === "new-resume") {
        const newResume = {
          _id: result.data._id,
          title: data.title,
          filename: data.title || data.name || "New Resume",
          version: "v1",
          date: new Date().toISOString().split("T")[0],
          atsScore: 75,
          parsed: true,
          tags: ["edited"],
          isDefault: false,
          applicationCount: 0,
          lastUsed: new Date().toISOString(),
        };
        setUserResumes((prev) => [newResume, ...prev]);
      } else if (editingResumeId) {
        setUserResumes((prev) => prev.map(r =>
          r._id === editingResumeId
            ? { ...r, title: data.title, filename: data.title || data.name, role: data.role }
            : r
        ));
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Failed to save resume. Please try again.');
    }

    setEditingResumeId(null);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      router.push('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-100 overflow-hidden flex items-center justify-center font-sans selection:bg-amber-100 selection:text-amber-900">

      {/* Blurred Background Layer - Simulating "Jobs List" underneath */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop')", // Office background
        }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-md" /> {/* The Blur Effect */}
      </div>

      {/* The "A4 / Modal" Window Container */}
      <div className="relative z-10 w-full max-w-[1200px] h-[90vh] bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2rem] overflow-hidden transform flex flex-col md:flex-row animate-in zoom-in-95 duration-500">

        {/* Close Button - Navigates to Jobs */}
        <div className="absolute top-6 right-6 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black/5 hover:bg-red-100 hover:text-red-600 backdrop-blur-md transition-all"
            onClick={() => router.push('/jobs')}
            title="Close Profile"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar - Contained within this box due to 'transform' on parent */}
        <Sidebar
          user={userAny}
          activeSection={activeSection}
          onNavigate={setActiveSection}
          onLogout={handleLogout}
        />

        {/* Content Area */}
        <main className="flex-1 h-full overflow-y-auto pl-24 pr-8 py-8 md:pl-28 md:pr-12 relative scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">

          {/* Dynamic Background Blobs inside the card */}
          <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />
          <div className="fixed bottom-0 left-20 w-[300px] h-[300px] bg-purple-200/20 rounded-full blur-[80px] -z-10 pointer-events-none translate-y-1/2" />

          {/* Content */}
          <div className="max-w-5xl mx-auto min-h-full">
            {editingResumeId ? (
              <ResumeBuilder
                resumeId={editingResumeId}
                isAIMode={aiMode}
                onSave={handleResumeBuilderSave}
                onBack={() => {
                  setEditingResumeId(null);
                  setAiMode(false);
                  setShowPreviewByDefault(false);
                }}
                defaultShowPreview={showPreviewByDefault}
              />
            ) : (
              <>
                {activeSection === "overview" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Dashboard / Overview Content */}
                    <div className="bg-white/60 backdrop-blur-md border border-white/50 shadow-sm rounded-3xl p-8 md:p-10 text-center relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-400 to-purple-500" />

                      <div className="flex flex-col items-center">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 rounded-full scale-150 animate-pulse" />
                          <Avatar className="h-32 w-32 border-4 border-white shadow-xl relative z-10 ring-4 ring-amber-50">
                            <AvatarImage src={user.profilePic || `https://ui-avatars.com/api/?name=${user.email}`} className="object-cover" />
                            <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 text-4xl font-bold">
                              {user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute bottom-2 right-2 z-20 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-sm" title="Online" />
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                        <p className="text-gray-500 font-medium mb-6 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          {userAny?.headline || "Job Seeker"}
                        </p>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => setActiveSection("user-info")}
                            className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6 shadow-lg hover:-translate-y-0.5 transition-all"
                          >
                            Edit Profile
                          </Button>

                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/60 hover:bg-white/80 transition-colors cursor-pointer group" onClick={() => setActiveSection('resumes')}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform"><FileText className="w-5 h-5 text-blue-600" /></div>
                          <span className="text-2xl font-bold text-gray-800">{userResumes.length}</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Saved Resumes</p>
                      </div>
                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/60 hover:bg-white/80 transition-colors cursor-pointer group" onClick={() => setActiveSection('progress')}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
                          <span className="text-2xl font-bold text-gray-800">12</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Applications</p>
                      </div>
                      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/60 hover:bg-white/80 transition-colors cursor-pointer group" onClick={() => setActiveSection('preferences')}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-2 bg-amber-100 rounded-xl group-hover:scale-110 transition-transform"><Briefcase className="w-5 h-5 text-amber-600" /></div>
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Active</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Job Preferences</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "user-info" && <ProfileOverview user={userAny} />}
                {activeSection === "resumes" && (
                  <ResumeListView
                    resumes={userResumes.map((r, idx) => ({
                      id: r._id || r.id || `resume-${idx}`,
                      title: r.title,
                      filename: r.filename || r.title || r.name || `Resume ${idx + 1}`,
                      role: r.role,
                      version: r.version || "v1",
                      date: r.date || r.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
                      atsScore: r.atsScore || 75,
                      parsed: r.parsed !== undefined ? r.parsed : true,
                      tags: r.tags || [],
                      isDefault: r.isDefault || false,
                      applicationCount: r.applicationCount || 0,
                    }))}
                    onEdit={(id) => {
                      const resumeIndex = userResumes.findIndex(r => (r._id || r.id) === id);
                      if (resumeIndex >= 0) handleResumeEdit(resumeIndex);
                    }}
                    onPreview={(id) => {
                      const resumeIndex = userResumes.findIndex(r => (r._id || r.id) === id);
                      if (resumeIndex >= 0) handleResumePreview(resumeIndex);
                    }}
                    onDownload={(id) => {
                      const resumeIndex = userResumes.findIndex(r => (r._id || r.id) === id);
                      if (resumeIndex >= 0) handleResumeDownload(resumeIndex);
                    }}
                    onDelete={(id) => {
                      const resumeIndex = userResumes.findIndex(r => (r._id || r.id) === id);
                      if (resumeIndex >= 0) handleResumeDelete(resumeIndex);
                    }}
                    onCreateNew={handleCreateNewResume}
                    onOptimize={(id) => console.log('Optimize:', id)}
                  />
                )}
                {activeSection === "preferences" && (
                  <JobPreferences
                    preferences={{
                      desiredRoles: userAny?.preferredJobTitles || [],
                      locations: userAny?.preferredLocations || [],
                      salaryMin: userAny?.salaryExpectation?.min,
                      salaryMax: userAny?.salaryExpectation?.max,
                      salaryPeriod: userAny?.salaryExpectation?.period,
                      experienceLevel: userAny?.experienceLevel,
                      workType: userAny?.preferredEmploymentTypes || [],
                      availability: "Immediately",
                      industries: userAny?.preferredIndustries || [],
                      companySize: userAny?.preferredCompanySizes || [],
                      benefits: userAny?.preferredBenefits || [],
                      growthOpportunities: userAny?.preferredGrowthOpportunities || [],
                    }}
                    profileVisible={profileVisible}
                    onProfileVisibilityChange={setProfileVisible}
                  />
                )}
                {activeSection === "matches" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Your Matched Jobs</h2>
                      <Badge variant="outline" className="text-amber-600 bg-amber-50">AI Powered</Badge>
                    </div>
                    <MatchedJobs
                      userPreferences={{
                        desiredRoles: userAny?.preferredJobTitles || [],
                        locations: userAny?.preferredLocations || [],
                        salaryMin: userAny?.salaryExpectation?.min,
                        salaryMax: userAny?.salaryExpectation?.max,
                        salaryPeriod: userAny?.salaryExpectation?.period,
                        experienceLevel: userAny?.experienceLevel,
                        workType: userAny?.preferredEmploymentTypes || [],
                        industries: userAny?.preferredIndustries || [],
                        companySize: userAny?.preferredCompanySizes || [],
                        benefits: userAny?.preferredBenefits || [],
                        growthOpportunities: userAny?.preferredGrowthOpportunities || [],
                      }}
                      onJobSelect={(job: any) => router.push(`/jobs/${job._id}`)}
                    />
                  </div>
                )}
                {activeSection === "progress" && (
                  <CareerProgress
                    jobMatchScore={87}
                    savedJobs={12}
                    applications={5}
                    skillGaps={userAny?.skills?.filter((skill: any) => skill.category === 'gap')?.map((s: any) => s.name) || []}
                  />
                )}
                {activeSection === "tools" && <ToolsAccess />}
                {activeSection === "settings" && (
                  <AccountSettings
                    email={user.email}
                    language="en"
                    notificationsEnabled={true}
                    onDeleteAccount={() => console.log("Delete account")}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <Dialog open={needsProfileCompletion} onOpenChange={setNeedsProfileCompletion}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>Please complete your profile information.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setNeedsProfileCompletion(false)}>Skip</Button>
            <Button onClick={() => { setNeedsProfileCompletion(false); setActiveSection("user-info"); }}>Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewResumeId} onOpenChange={(open) => !open && setPreviewResumeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
          {previewResumeData && (
            <div className="bg-white p-8">
              <h1 className="text-2xl font-bold">{previewResumeData.parsedData?.name}</h1>
              {/* Simplified for brevity in this view, typically renders PDF preview here */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
