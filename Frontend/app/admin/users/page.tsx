"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UserManagement } from "@/components/admin/UserManagement";

// Mock admin user data
const mockAdmin = {
  name: "Admin User",
  email: "admin@canadajobs.com",
  role: "Super Admin",
  avatar: "https://ui-avatars.com/api/?name=Admin+User&background=02243b&color=fff",
};

// Import navigation configuration
import { adminNavItems } from "../overview/page";

export default function UsersPage() {
  const [activeSection, setActiveSection] = useState("users");
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
          <UserManagement />
        </main>
      </div>
    </div>
  );
}