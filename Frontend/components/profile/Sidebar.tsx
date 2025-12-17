"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Menu,
  X,
  User,
  FileText,
  Briefcase,
  TrendingUp,
  Wrench,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    accountType: "Free" | "Pro";
    profilePic: string;
  };
  activeSection?: string;
  onNavigate?: (section: string) => void;
  onLogout?: () => void;
}

const navigationItems = [
  { id: "user-info", label: "Profile Overview", icon: User },
  { id: "resumes", label: "Resume Management", icon: FileText },
  { id: "preferences", label: "Job Preferences", icon: Briefcase },
  { id: "progress", label: "Career Progress", icon: TrendingUp },
  { id: "tools", label: "Tools & Resources", icon: Wrench },
  { id: "settings", label: "Account Settings", icon: Settings },
];

export function Sidebar({ user, activeSection = "user-info", onNavigate, onLogout }: SidebarProps) {
  const [open, setOpen] = useState(false);

  const handleNavigate = (sectionId: string) => {
    onNavigate?.(sectionId);
    setOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-amber-50 to-white border-r border-gray-200">
      {/* Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-12 w-12 border-2 border-amber-700">
            <AvatarImage src={user.profilePic} alt={user.name} />
            <AvatarFallback>
              <User className="h-6 w-6 text-amber-700" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <Badge
              className={`mt-1 text-xs ${
                user.accountType === "Pro"
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {user.accountType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-amber-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={onLogout}
          variant="destructive"
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-lg bg-white border-gray-300"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 h-screen sticky top-0">
        <SidebarContent />
      </div>
    </>
  );
}
