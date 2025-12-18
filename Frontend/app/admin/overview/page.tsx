"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OverviewDashboard } from "@/components/admin/OverviewDashboard";
import { JobManagement } from "@/components/admin/JobManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { ResumeInsights } from "@/components/admin/ResumeInsights";
import { ApplicationsManagement } from "@/components/admin/ApplicationsManagement";
import { MessagingAndNotifications } from "@/components/admin/MessagingAndNotifications";
import { PaymentsAndBilling } from "@/components/admin/PaymentsAndBilling";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { ModerationTools } from "@/components/admin/ModerationTools";
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  FileText, 
  MessageSquare,
  CreditCard,
  Settings,
  Flag,
  Shield,
  Brain,
  UserCog
} from "lucide-react";

// Mock admin user data
const mockAdmin = {
  name: "Admin User",
  email: "admin@canadajobs.com",
  role: "Super Admin",
  avatar: "https://ui-avatars.com/api/?name=Admin+User&background=02243b&color=fff",
};

// Navigation items configuration
export const adminNavItems = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
    href: "/admin/overview",
    badge: null,
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    href: "/admin/users",
    badge: "2.4k",

  },
  {
    id: "jobs",
    label: "Job Management",
    icon: Briefcase,
    href: "/admin/jobs",
    badge: "156",
  },
  {
    id: "resumes",
    label: "Resume Insights",
    icon: FileText,
    href: "/admin/resumes",
    badge: null,
  },
  {
    id: "applications",
    label: "Applications",
    icon: FileText,
    href: "/admin/applications",
    badge: "1.2k",
  },
  {
    id: "messaging",
    label: "Messaging",
    icon: MessageSquare,
    href: "/admin/messaging",
    badge: "12",
  },
  {
    id: "billing",
    label: "Payments & Billing",
    icon: CreditCard,
    href: "/admin/billing",
    badge: null,
  },
//   {
//     id: "platform",
//     label: "Platform Settings",
//     icon: Settings,
//     href: "/admin/platform",
//     badge: null,
//   },
  {
    id: "content",
    label: "Content Management",
    icon: FileText,
    href: "/admin/content",
    badge: null,
  },
  {
    id: "moderation",
    label: "Moderation",
    icon: Flag,
    href: "/admin/moderation",
    badge: "8",
  },
//   {
//     id: "ai-features",
//     label: "AI Features",
//     icon: Brain,
//     href: "/admin/ai-features",
//     badge: null,
//   },
//   {
//     id: "team-access",
//     label: "Team Access",
//     icon: UserCog,
//     href: "/admin/team",
//     badge: null,
//   },
];

export default function AdminDashboardLayout() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom CSS Variables for Admin Theme */}
      <style jsx global>{`
        :root {
          --admin-primary: #02243b;
          --admin-secondary: #8a4b04;
          --admin-primary-50: oklch(from #02243b calc(l + 0.4) c h);
          --admin-primary-100: oklch(from #02243b calc(l + 0.3) c h);
          --admin-primary-200: oklch(from #02243b calc(l + 0.2) c h);
          --admin-primary-300: oklch(from #02243b calc(l + 0.1) c h);
          --admin-primary-400: oklch(from #02243b calc(l + 0.05) c h);
          --admin-primary-500: #02243b;
          --admin-primary-600: oklch(from #02243b calc(l - 0.05) c h);
          --admin-secondary-50: oklch(from #8a4b04 calc(l + 0.4) c h);
          --admin-secondary-100: oklch(from #8a4b04 calc(l + 0.3) c h);
          --admin-secondary-400: oklch(from #8a4b04 calc(l + 0.05) c h);
          --admin-secondary-500: #8a4b04;
          --admin-accent-50: oklch(0.98 0.02 55);
          --admin-accent-100: oklch(0.95 0.05 55);
          --admin-accent-500: oklch(0.7 0.18 55);
        }
      `}</style>

      {/* Sidebar */}
      <AdminSidebar
        admin={mockAdmin}
        navItems={adminNavItems}
        activeSection={activeSection}
        collapsed={sidebarCollapsed}
        onNavigate={setActiveSection}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <AdminHeader
          admin={mockAdmin}
          activeSection={activeSection}
          navItems={adminNavItems}
        />

        {/* Page Content */}
        <main className="p-6">
          {activeSection === "overview" && <OverviewDashboard />}
          {activeSection === "users" && <UserManagement />}
          {activeSection === "jobs" && <JobManagement />}
          {activeSection === "resumes" && <ResumeInsights />}
          {activeSection === "applications" && <ApplicationsManagement />}
          {activeSection === "messaging" && <MessagingAndNotifications />}
          {activeSection === "billing" && <PaymentsAndBilling />}
          {activeSection === "platform" && <PlatformSettings />}
          {activeSection === "content" && <ContentManagement />}
          {activeSection === "moderation" && <ModerationTools />}
        </main>
      </div>
    </div>
  );
}