"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  MessageCircle,
  Settings,
  CreditCard,
  LogOut,
  Menu,
  ChevronRight,
  Zap,
  TrendingUp,
  UserCheck,
  Clock,
  Lock,
} from "lucide-react";

interface Company {
  name: string;
  email: string;
  phone: string;
  plan: string;
  logo: string;
  industry: string;
  size: string;
  location: string;
}

interface EmployerSidebarProps {
  company: Company;
  activeSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  onUpgrade: () => void;
  stats?: {
    activeJobs: number;
    totalApplications: number;
    hiresMade?: number;
  };
}

const navigationItems = [
  { id: "overview", label: "Dashboard", icon: Building2, description: "Overview & stats" },
  { id: "jobs", label: "Job Posts", icon: Briefcase, description: "Manage job listings" },
  { id: "applicants", label: "Applicants", icon: Users, description: "Track candidates" },
  { id: "interviews", label: "Interviews", icon: Calendar, description: "Schedule & manage" },
  { id: "messages", label: "Messages", icon: MessageCircle, description: "Communication" },
  { id: "profile", label: "Company Profile", icon: Building2, description: "Company details" },
  { id: "billing", label: "Plan & Billing", icon: CreditCard, description: "Subscription & payments" },
  { id: "settings", label: "Account Settings", icon: Settings, description: "Team & preferences" },
];

function SidebarContent({ company, activeSection, onNavigate, onLogout, onUpgrade, stats }: EmployerSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Company Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2" style={{ borderColor: '#02243b' }}>
            <AvatarImage src={company.logo} alt={company.name} />
            <AvatarFallback style={{ backgroundColor: '#f5f3f0' }}>
              <Building2 className="h-6 w-6" style={{ color: '#02243b' }} />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{company.name}</p>
            <p className="text-sm text-gray-600 truncate">{company.email}</p>
            <Badge className="text-xs mt-1" style={{ backgroundColor: '#f5f3f0', color: '#02243b' }}>
              {company.plan}
            </Badge>
          </div>
        </div>

        {/* Quick Stats - Real Data */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">{stats?.activeJobs || 0}</p>
            <p className="text-xs text-gray-600">Active Jobs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{stats?.totalApplications || 0}</p>
            <p className="text-xs text-gray-600">Applications</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">{stats?.hiresMade || 0}</p>
            <p className="text-xs text-gray-600">Hired</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button size="sm" className="w-full text-white" style={{ backgroundColor: '#02243b' }}>
            <Briefcase className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" style={{ color: '#02243b', borderColor: '#02243b' }} className="hover:bg-slate-50">
              <UserCheck className="h-4 w-4 mr-1" />
              Review
            </Button>
            <Button size="sm" variant="outline" style={{ color: '#8a4b04', borderColor: '#8a4b04' }} className="hover:bg-amber-50">
              <Clock className="h-4 w-4 mr-1" />
              Schedule
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            // Lock logic: Free users can only access Overview, Job Posts, Profile, Billing, Settings.
            // Restricted: Applicants, Interviews, Messages.

            // Normalize plan string
            const normalizedPlan = (company.plan || "").toLowerCase();
            const isFree = normalizedPlan === "free";

            // If user is paid, status should be unlocking everything
            // User provided metadata: { plan: "free", status: "inactive" }

            const restrictedTabs = ["applicants", "interviews", "messages", "analytics"];
            const isRestricted = isFree && restrictedTabs.includes(item.id);

            // Debug log to trace why it might be failing
            // useEffect(() => { console.log("Plan:", company.plan, "Normalized:", normalizedPlan, "Restricted:", isRestricted); }, [company.plan]);

            return (
              <Button
                key={item.id}
                variant="ghost"
                disabled={isRestricted}
                className={`w-full justify-start h-auto p-3 group relative ${isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-50"
                  } ${isRestricted ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !isRestricted && onNavigate(item.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.label}</p>
                      {isRestricted && <Lock className="h-3 w-3 text-gray-400" />}
                    </div>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
                </div>

                {/* Tooltip for restricted items */}
                {isRestricted && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-48 bg-gray-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    Upgrade to Professional plan to unlock {item.label}.
                  </div>
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Upgrade Section */}
      {company.plan === "Free" && (
        <div className="p-4 border-t border-gray-100">
          <div className="bg-linear-to-r from-slate-700 to-amber-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-slate-100 mb-3">
              Unlock unlimited job posts, advanced analytics, and priority support.
            </p>
            <Button
              size="sm"
              className="w-full text-slate-700 hover:bg-slate-200"
              style={{ backgroundColor: '#f5f3f0' }}
              onClick={onUpgrade}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <Button
          variant="ghost"
          className="w-full text-gray-700 hover:bg-red-50 hover:text-red-600"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function EmployerSidebar(props: EmployerSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 h-screen sticky top-0">
        <SidebarContent {...props} stats={props.stats} />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-40">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent {...props} stats={props.stats} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}