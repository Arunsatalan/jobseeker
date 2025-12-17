
"use client";
import { useState } from "react";
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

// Mock data
const mockUser = {
  name: "Arun Kumar",
  email: "arun@example.com",
  phone: "+1 234-567-8901",
  accountType: "Free" as const,
  profilePic: "https://ui-avatars.com/api/?name=Arun+Kumar",
};

const mockResumes = [
  {
    filename: "ArunKumar_Frontend_v2.pdf",
    version: "v2",
    date: "2025-12-01",
    atsScore: 85,
    parsed: true,
  },
  {
    filename: "ArunKumar_Frontend_v1.pdf",
    version: "v1",
    date: "2025-10-15",
    atsScore: 72,
    parsed: false,
  },
];

const mockJobPreferences = {
  desiredRoles: ["Frontend Developer", "UI Engineer"],
  locations: ["Remote", "Toronto"],
  salaryRange: "$90k+",
  workType: ["Full-time"],
  availability: "Immediately",
};

const mockSkillGaps = ["TypeScript", "React.js", "Next.js"];

export default function ProfilePage() {
  const [profileVisible, setProfileVisible] = useState(true);
  const [userResumes, setUserResumes] = useState(mockResumes);
  const [user, setUser] = useState(mockUser);
  const [activeSection, setActiveSection] = useState("user-info");
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);

  const handleResumeDelete = (index: number) => {
    setUserResumes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResumeEdit = (index: number) => {
    console.log("Edit resume:", index);
    setEditingResumeId(`resume-${index}`);
  };

  const handleResumeDownload = (index: number) => {
    console.log("Download resume:", index);
    // Implement download functionality
  };

  const handleCreateNewResume = () => {
    console.log("Create new resume");
    setEditingResumeId("new-resume");
  };

  const handleResumeBuilderSave = (data: any) => {
    console.log("Resume saved:", data);
    // Add resume to list
    if (editingResumeId === "new-resume") {
      const newResume = {
        id: `resume-${Date.now()}`,
        filename: data.name || "New Resume",
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
    }
    setEditingResumeId(null);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    // Implement logout functionality
  };

  const handleUpgrade = () => {
    console.log("Upgrade to pro");
    // Implement upgrade functionality
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
                <AvatarImage src={user.profilePic} alt={user.name} />
                <AvatarFallback className="bg-amber-100">
                  <User className="h-5 w-5 text-amber-700" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <Badge className="text-xs bg-amber-100 text-amber-700">
                  {user.accountType}
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
                  onSave={handleResumeBuilderSave}
                  onBack={() => setEditingResumeId(null)}
                />
              </div>
            )}

            {!editingResumeId && activeSection === "user-info" && (
              <ProfileOverview user={user} />
            )}

            {!editingResumeId && activeSection === "resumes" && (
              <ResumeListView
                resumes={userResumes.map((r, idx) => ({
                  id: `resume-${idx}`,
                  filename: r.filename,
                  version: r.version,
                  date: r.date,
                  atsScore: r.atsScore,
                  parsed: r.parsed,
                  tags: [],
                  isDefault: false,
                  applicationCount: 0,
                }))}
                onEdit={(id) => {
                  const idx = parseInt(id.split('-')[1]);
                  handleResumeEdit(idx);
                }}
                onDownload={(id) => {
                  const idx = parseInt(id.split('-')[1]);
                  handleResumeDownload(idx);
                }}
                onDelete={(id) => {
                  const idx = parseInt(id.split('-')[1]);
                  if (!isNaN(idx)) handleResumeDelete(idx);
                }}
                onCreateNew={handleCreateNewResume}
              />
            )}

            {!editingResumeId && activeSection === "preferences" && (
              <JobPreferences
                preferences={mockJobPreferences}
                profileVisible={profileVisible}
                onProfileVisibilityChange={setProfileVisible}
              />
            )}

            {!editingResumeId && activeSection === "progress" && (
              <CareerProgress
                jobMatchScore={87}
                savedJobs={12}
                applications={5}
                skillGaps={mockSkillGaps}
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
    </div>
  );
}
