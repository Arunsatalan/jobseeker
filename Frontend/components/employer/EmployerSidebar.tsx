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
} from "lucide-react";

interface Company {
  name: string;
  email: string;
  phone: string;
  plan: "Free" | "Professional" | "Enterprise";
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

function SidebarContent({ company, activeSection, onNavigate, onLogout, onUpgrade }: EmployerSidebarProps) {
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

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">12</p>
            <p className="text-xs text-gray-600">Active Jobs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">145</p>
            <p className="text-xs text-gray-600">Applications</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">8</p>
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

      {/* Navigation Items */}
      <div className="flex-1 p-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full justify-start h-auto p-3 ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
                </div>
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
        <SidebarContent {...props} />
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
            <SidebarContent {...props} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}