"use client";
import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, FileText, Briefcase, Settings } from "lucide-react";
import { Sidebar } from "@/components/profile/Sidebar";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ResumeListView } from "@/components/profile/ResumeListView";

import { ResumeBuilder } from "@/components/profile/ResumeBuilder";
import { JobPreferences } from "@/components/profile/JobPreferences";
import { CareerProgress } from "@/components/profile/CareerProgress";
import { ToolsAccess } from "@/components/profile/ToolsAccess";
import { AccountSettings } from "@/components/profile/AccountSettings";
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
  const { user, logout, isLoading } = useAuth()
  const [profileVisible, setProfileVisible] = useState(true);
  const [userResumes, setUserResumes] = useState([]);
  const [activeSection, setActiveSection] = useState("user-info");
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const [showPreviewByDefault, setShowPreviewByDefault] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [previewResumeId, setPreviewResumeId] = useState<string | null>(null);
  const [previewResumeData, setPreviewResumeData] = useState<any>(null);

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

    // Ask for confirmation
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

      // Remove from state after successful deletion
      setUserResumes((prev) => prev.filter((_, i) => i !== index));
      alert('Resume deleted successfully!');
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    }
  };

  const handleResumeBuilderSave = async (data: any) => {
    console.log("Resume saved:", data);
    
    try {
      const token = localStorage.getItem('token');
      
      let response;
      let result;
      
      if (editingResumeId && editingResumeId !== "new-resume") {
        // Update existing resume
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
              skills: data.skills?.map(group => ({
                category: group.category || 'other',
                items: group.items && Array.isArray(group.items) ? group.items.filter(item => item && item.trim()) : []
              })) || [],
              certifications: data.certifications || [],
              languages: data.languages || [],
              projects: data.projects || [],
              references: data.references || [],
            }
          })
        });
      } else {
        // Create new resume
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
      
      // Update resume in list
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
        // Update existing resume in the list
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

  return (
    <ProtectedLayout>
      {/* Show loading while auth is being checked */}
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
        </div>
      ) : !user ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading user data...</div>
        </div>
      ) : (
        <ProfilePageContent 
          user={user}
          userResumes={userResumes}
          setUserResumes={setUserResumes}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          editingResumeId={editingResumeId}
          setEditingResumeId={setEditingResumeId}
          showPreviewByDefault={showPreviewByDefault}
          setShowPreviewByDefault={setShowPreviewByDefault}
          previewResumeId={previewResumeId}
          setPreviewResumeId={setPreviewResumeId}
          previewResumeData={previewResumeData}
          setPreviewResumeData={setPreviewResumeData}
          needsProfileCompletion={needsProfileCompletion}
          setNeedsProfileCompletion={setNeedsProfileCompletion}
          onResumeDelete={handleResumeDelete}
          onResumeBuilderSave={handleResumeBuilderSave}
          logout={logout}
        />
      )}
    </ProtectedLayout>
  );
}

function ProfilePageContent({
  user,
  userResumes,
  setUserResumes,
  activeSection,
  setActiveSection,
  editingResumeId,
  setEditingResumeId,
  showPreviewByDefault,
  setShowPreviewByDefault,
  previewResumeId,
  setPreviewResumeId,
  previewResumeData,
  setPreviewResumeData,
  needsProfileCompletion,
  setNeedsProfileCompletion,
  onResumeDelete,
  onResumeBuilderSave,
  logout,
}: any) {
  const [profileVisible, setProfileVisible] = useState(true);

  const handleResumeEdit = (index: number) => {
    const resume = userResumes[index];
    if (resume && resume._id) {
      console.log("Edit resume:", resume._id);
      setEditingResumeId(resume._id);
      setShowPreviewByDefault(false);
      // Scroll to top for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.log("Edit resume (new):", index);
      setEditingResumeId("new-resume");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResumePreview = async (index: number) => {
    const resume = userResumes[index];
    if (resume && resume._id) {
      console.log("Preview resume:", resume._id);
      setPreviewResumeId(resume._id);
      
      // Load resume data for preview
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/v1/resumes/${resume._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPreviewResumeData(data.data);
        }
      } catch (error) {
        console.error('Error loading resume for preview:', error);
      }
    }
  };

  const handleResumeDownload = (index: number) => {
    const resume = userResumes[index];
    if (!resume || !resume._id) {
      console.error('Resume ID not found');
      return;
    }

    // Trigger download via backend API
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const downloadUrl = `/api/v1/resumes/${resume._id}/download`;
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = resume.filename || 'resume.pdf';
    anchor.click();
  };

  const handleResumeDelete = async (index: number) => {
    try {
      const resume = userResumes[index];
      if (!resume || !resume._id) {
        console.error('Resume ID not found');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`/api/v1/resumes/${resume._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from local state
        setUserResumes(userResumes.filter((_, i) => i !== index));
        console.log('Resume deleted successfully');
      } else {
        console.error('Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
    }
  };

  const handleCreateNewResume = () => {
    console.log("Create new resume");
    setEditingResumeId("new-resume");
  };

  const handleLogout = () => {
    logout();
  };

  const handleUpgrade = () => {
    console.log("Upgrade to pro");
    // Implement upgrade functionality
  };

  const handleCompleteProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/profile/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update localStorage with the updated user data
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setNeedsProfileCompletion(false);
        console.log('Profile completed successfully');
      } else {
        console.error('Failed to complete profile');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-purple-50 flex">
      {/* Professional Sidebar */}
      <Sidebar
        user={user}
        activeSection={activeSection}
        onNavigate={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-amber-500">
                <AvatarImage src={user.profilePic || `https://ui-avatars.com/api/?name=${user.email}`} alt={user.name || user.email} />
                <AvatarFallback className="bg-amber-100">
                  <User className="h-5 w-5 text-amber-700" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{user.name || user.email}</p>
                <Badge className="text-xs bg-amber-100 text-amber-700">
                  {user.accountType || 'Free'}
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Dashboard</h1>
              <p className="text-gray-600">Manage your profile, resumes, and job preferences</p>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Main Content - Show selected section only */}
          <div className="max-w-4xl mx-auto">
            {editingResumeId && (
              <div className="mb-8">
                <ResumeBuilder
                  resumeId={editingResumeId}
                  onSave={onResumeBuilderSave}
                  onBack={() => {
                    setEditingResumeId(null);
                    setShowPreviewByDefault(false);
                  }}
                  defaultShowPreview={showPreviewByDefault}
                />
              </div>
            )}

            {!editingResumeId && activeSection === "user-info" && (
              <ProfileOverview user={user} />
            )}

            {!editingResumeId && activeSection === "resumes" && (
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
                  if (resumeIndex >= 0) {
                    handleResumeEdit(resumeIndex);
                  }
                }}
                onPreview={(id) => {
                  const resumeIndex = userResumes.findIndex(r => (r._id || r.id) === id);
                  if (resumeIndex >= 0) {
                    handleResumePreview(resumeIndex);
                  }
                }}
                onDownload={(id) => {
                  const resumeIndex = userResumes.findIndex(r => (r._id || r.id) === id);
                  if (resumeIndex >= 0) {
                    handleResumeDownload(resumeIndex);
                  }
                }}
                onDelete={(id) => {
                  const resumeIndex = userResumes.findIndex(r => (r._id || r.id) === id);
                  if (resumeIndex >= 0) {
                    handleResumeDelete(resumeIndex);
                  } else {
                    console.error('Resume not found:', id);
                  }
                }}
                onCreateNew={handleCreateNewResume}
                onOptimize={(id) => {
                  console.log('Optimize resume:', id);
                  // Implement optimize functionality
                }}
              />
            )}

            {!editingResumeId && activeSection === "preferences" && (
              <JobPreferences
                preferences={{
                  desiredRoles: user?.preferredJobTitles || [],
                  locations: user?.preferredLocations || [],
                  salaryRange: user?.salaryExpectation ? `$${user.salaryExpectation.min}-${user.salaryExpectation.max}` : "",
                  workType: user?.preferredEmploymentTypes || [],
                  availability: "Immediately",
                }}
                profileVisible={profileVisible}
                onProfileVisibilityChange={setProfileVisible}
              />
            )}

            {!editingResumeId && activeSection === "progress" && (
              <CareerProgress
                jobMatchScore={87}
                savedJobs={12}
                applications={5}
                skillGaps={user?.skills?.filter(skill => skill.category === 'gap')?.map(s => s.name) || []}
              />
            )}

            {!editingResumeId && activeSection === "tools" && (
              <ToolsAccess />
            )}

            {!editingResumeId && activeSection === "settings" && (
              <AccountSettings
                email={user.email}
                language="en"
                notificationsEnabled={true}
                onDeleteAccount={() => console.log("Delete account")}
              />
            )}
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
            <div className="flex justify-around">
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col gap-1 ${activeSection === "user-info" ? "text-amber-600" : ""}`}
                onClick={() => setActiveSection("user-info")}
              >
                <User className="h-4 w-4" />
                <span className="text-xs">Profile</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col gap-1 ${activeSection === "resumes" ? "text-amber-600" : ""}`}
                onClick={() => setActiveSection("resumes")}
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs">Resumes</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col gap-1 ${activeSection === "preferences" ? "text-amber-600" : ""}`}
                onClick={() => setActiveSection("preferences")}
              >
                <Briefcase className="h-4 w-4" />
                <span className="text-xs">Jobs</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col gap-1 ${activeSection === "settings" ? "text-amber-600" : ""}`}
                onClick={() => setActiveSection("settings")}
              >
                <Settings className="h-4 w-4" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Modal */}
      <Dialog open={needsProfileCompletion} onOpenChange={setNeedsProfileCompletion}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            To get the most out of our platform, please complete your profile information.
            This will help employers find you and improve your job search experience.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setNeedsProfileCompletion(false)}
          >
            Skip for Now
          </Button>
          <Button
            onClick={() => {
              setNeedsProfileCompletion(false);
              setActiveSection("user-info");
            }}
          >
            Complete Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Resume Preview Modal */}
    <Dialog open={!!previewResumeId} onOpenChange={(open) => {
      if (!open) {
        setPreviewResumeId(null);
        setPreviewResumeData(null);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
          <DialogDescription>Professional PDF Format</DialogDescription>
        </DialogHeader>
        
        {previewResumeData && (
          <div className="space-y-4">
            {/* Preview Panel - PDF Style */}
            <div className="bg-white p-8 border-2 border-gray-300 rounded-lg font-serif text-sm leading-relaxed max-h-[600px] overflow-y-auto">
              {/* Header */}
              <div className="mb-6 border-b-2 border-gray-400 pb-4">
                <h1 className="text-2xl font-bold text-center text-gray-900">
                  {previewResumeData.parsedData?.name || "Your Name"}
                </h1>
                {previewResumeData.role && (
                  <p className="text-lg text-blue-600 font-medium text-center mt-1">
                    {previewResumeData.role}
                  </p>
                )}
                <div className="text-center text-xs text-gray-700 space-y-1 mt-2">
                  {previewResumeData.parsedData?.email && (
                    <p>{previewResumeData.parsedData.email}</p>
                  )}
                  {previewResumeData.parsedData?.phone && (
                    <p>{previewResumeData.parsedData.phone}</p>
                  )}
                  {previewResumeData.parsedData?.location && (
                    <p>{previewResumeData.parsedData.location}</p>
                  )}
                  <div className="space-x-4 text-xs">
                    {previewResumeData.parsedData?.linkedin && (
                      <span>{previewResumeData.parsedData.linkedin}</span>
                    )}
                    {previewResumeData.parsedData?.github && (
                      <span>{previewResumeData.parsedData.github}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              {previewResumeData.parsedData?.summary && (
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    PROFESSIONAL SUMMARY
                  </h2>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {previewResumeData.parsedData.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {previewResumeData.parsedData?.experience && previewResumeData.parsedData.experience.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    EXPERIENCE
                  </h2>
                  <div className="space-y-3">
                    {previewResumeData.parsedData.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">{exp.title}</span>
                          <span className="text-gray-700">{exp.duration}</span>
                        </div>
                        <div className="text-gray-800">{exp.company}</div>
                        {exp.description && (
                          <p className="text-gray-700 mt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {previewResumeData.parsedData?.education && previewResumeData.parsedData.education.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    EDUCATION
                  </h2>
                  <div className="space-y-2">
                    {previewResumeData.parsedData.education.map((edu: any, idx: number) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-900">{edu.degree}</span>
                          <span className="text-gray-700">{edu.year}</span>
                        </div>
                        <div className="text-gray-800">{edu.school}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {previewResumeData.parsedData?.skills && previewResumeData.parsedData.skills.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    SKILLS
                  </h2>
                  <div className="space-y-2">
                    {/* Technical Skills */}
                    {(() => {
                      const technicalSkills = previewResumeData.parsedData.skills.find((skillGroup: any) =>
                        skillGroup.category === "Technical"
                      );
                      return technicalSkills?.items && technicalSkills.items.length > 0 ? (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-700 mb-1">Technical Skills</h3>
                          <p className="text-xs text-gray-800">
                            {technicalSkills.items.filter((item: any) => item && item.trim && item.trim().length > 0).join(" • ")}
                          </p>
                        </div>
                      ) : null;
                    })()}

                    {/* Soft Skills */}
                    {(() => {
                      const softSkills = previewResumeData.parsedData.skills.find((skillGroup: any) =>
                        skillGroup.category === "Soft Skills"
                      );
                      return softSkills?.items && softSkills.items.length > 0 ? (
                        <div>
                          <h3 className="text-xs font-semibold text-gray-700 mb-1">Soft Skills</h3>
                          <p className="text-xs text-gray-800">
                            {softSkills.items.filter((item: any) => item && item.trim && item.trim().length > 0).join(" • ")}
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {previewResumeData.parsedData?.certifications && previewResumeData.parsedData.certifications.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    CERTIFICATIONS
                  </h2>
                  <div className="space-y-2">
                    {previewResumeData.parsedData.certifications.map((cert: any, idx: number) => (
                      <div key={idx} className="text-xs">
                        <p className="font-bold">{cert.title}</p>
                        <p className="text-gray-700">{cert.issuer}{cert.date && ` • ${cert.date}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {previewResumeData.parsedData?.languages && previewResumeData.parsedData.languages.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    LANGUAGES
                  </h2>
                  <p className="text-xs text-gray-800">
                    {previewResumeData.parsedData.languages.map((lang: any) => `${lang.language} (${lang.proficiency})`).join(" • ")}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setPreviewResumeId(null);
                setPreviewResumeData(null);
              }}>
                Close Preview
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                // Download functionality
                const resumeName = previewResumeData.filename || "resume.pdf";
                // Call download API
                window.location.href = `/api/v1/resumes/${previewResumeId}/download`;
              }}>
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  );
}
