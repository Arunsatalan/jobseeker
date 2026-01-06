"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  FileText,
  Briefcase,
  TrendingUp,
  Settings,
  LogOut,
  Lock,
  Menu,
  X,
  Sparkles
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    accountType?: "Free" | "Pro";
    subscription?: {
      plan?: string;
      status?: string;
    };
    profilePic: string;
  };
  activeSection?: string;
  onNavigate?: (section: string) => void;
  onLogout?: () => void;
  collapsed?: boolean;
}

const navigationItems = [
  { id: "user-info", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Briefcase },
  { id: "resumes", label: "Resumes", icon: FileText },
  { id: "progress", label: "Interviews", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

const getEffectivePlan = (user: SidebarProps['user']) => {
  let plan = 'free';
  const subPlan = user.subscription?.plan?.toLowerCase().trim();
  const subStatus = user.subscription?.status?.toLowerCase().trim();
  const accType = user.accountType?.toLowerCase().trim();

  if (subPlan && subStatus === 'active') {
    plan = subPlan;
  } else if (accType) {
    plan = accType;
  }
  return plan;
};

export function Sidebar({ user, activeSection = "user-info", onNavigate, onLogout }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const plan = getEffectivePlan(user);
  const isFree = plan === 'free';

  const handleNavigate = (sectionId: string) => {
    // Relaxed locking for UX demo purposes, feel free to tighten
    const isLocked = isFree && sectionId !== "user-info" && sectionId !== "settings" && sectionId !== "preferences" && sectionId !== "resumes" && sectionId !== "progress";

    if (isLocked) {
      toast({
        title: "Pro Feature",
        description: "Upgrade to Pro to access this feature.",
        action: (
          <Button variant="default" size="sm" onClick={() => window.location.href = '/billing'} className="bg-amber-600 hover:bg-amber-700">
            Upgrade
          </Button>
        ),
      });
      return;
    }

    onNavigate?.(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Floating Dock */}
      <div
        className={`hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col transition-all duration-500 ease-in-out ${isHovered ? "w-64 scale-100" : "w-20 scale-95"
          }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="bg-white/90 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden ring-1 ring-black/5">

          {/* Header */}
          <div className={`p-4 flex items-center ${isHovered ? "justify-start gap-4" : "justify-center"} transition-all duration-300 border-b border-gray-100/50 bg-gradient-to-b from-amber-50/50 to-transparent`}>
            <div className="relative group">
              <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-2 ring-amber-50 transition-transform duration-300 hover:scale-105">
                <AvatarImage src={user.profilePic || `https://ui-avatars.com/api/?name=${user.email}`} className="object-cover" />
                <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${isFree ? 'bg-gray-400' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse'}`} />
            </div>

            <div className={`transition-all duration-300 overflow-hidden ${isHovered ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0"}`}>
              <p className="font-bold text-gray-900 truncate text-sm">{user.name}</p>
              <Badge variant="secondary" className="mt-0.5 text-[10px] h-5 bg-amber-100 text-amber-800 border-0 font-medium">
                {isFree ? "Free Plan" : "Pro Member"}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <div className="py-4 px-3 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              const isLocked = isFree && item.id !== "user-info" && item.id !== "settings" && item.id !== "preferences" && item.id !== "resumes" && item.id !== "progress";

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`relative w-full flex items-center p-3 rounded-2xl transition-all duration-300 group overflow-hidden ${isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25"
                      : "text-gray-500 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                >
                  {/* Active Indicator Line (only visible when collapsed) */}
                  {!isHovered && isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-amber-600 rounded-r-full" />
                  )}

                  <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />

                  <span className={`whitespace-nowrap font-medium text-sm ml-4 transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                    {item.label}
                  </span>

                  {isLocked && isHovered && (
                    <Lock className="h-3 w-3 ml-auto text-amber-600/50" />
                  )}

                  {/* Sparkle effect on hover for active items */}
                  {isActive && (
                    <div className="absolute inset-0 bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100/50 bg-gray-50/30">
            <button
              onClick={onLogout}
              className={`w-full flex items-center p-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className={`whitespace-nowrap font-medium text-sm ml-4 transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Glassmorphic) */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl p-2 flex justify-between items-center px-6 ring-1 ring-black/5">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isActive ? "text-amber-600 -translate-y-2" : "text-gray-400"
                  }`}
              >
                <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? "bg-amber-100 shadow-sm" : "bg-transparent"}`}>
                  <Icon className={`h-5 w-5 ${isActive ? "fill-amber-600 text-amber-600" : ""}`} />
                </div>
              </button>
            );
          })}

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-400 hover:text-gray-600"
          >
            <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Menu className="h-5 w-5" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Full Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl p-6 lg:hidden animate-in fade-in slide-in-from-bottom-10 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full hover:bg-gray-100">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center p-4 rounded-xl text-lg font-medium transition-all duration-200 ${activeSection === item.id
                    ? "bg-amber-50 text-amber-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <item.icon className={`h-6 w-6 mr-4 ${activeSection === item.id ? "text-amber-600" : "text-gray-400"}`} />
                {item.label}
              </button>
            ))}

            <Separator className="my-6" />

            <button
              onClick={onLogout}
              className="w-full flex items-center p-4 rounded-xl text-lg font-medium text-red-600 bg-red-50/50 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
            >
              <LogOut className="h-6 w-6 mr-4" />
              Sign Out
            </button>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-amber-500 to-amber-700 rounded-3xl text-white text-center shadow-xl shadow-amber-600/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all" />
            <div className="z-10 relative">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-90" />
              <h3 className="font-bold text-xl mb-1 tracking-tight">{isFree ? "Upgrade to Pro" : "Pro Member"}</h3>
              <p className="text-white/80 text-sm mb-4">
                {isFree ? "Unlock unlimited resumes and AI features." : "You have access to all premium features."}
              </p>
              {isFree && (
                <Button onClick={() => window.location.href = '/billing'} className="bg-white text-amber-700 hover:bg-white/90 w-full rounded-xl font-bold shadow-lg">
                  Upgrade Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
