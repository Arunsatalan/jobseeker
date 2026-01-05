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
  Lock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast"; // Ensure this path is correct

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
}

const navigationItems = [
  { id: "user-info", label: "Profile Overview", icon: User },
  { id: "preferences", label: "Job Preferences", icon: Briefcase },
  { id: "resumes", label: "Resume Management", icon: FileText },

  { id: "progress", label: "Interview Management", icon: TrendingUp },
  // { id: "tools", label: "Tools & Resources", icon: Wrench },
  { id: "settings", label: "Account Settings", icon: Settings },
];

const getEffectivePlan = (user: SidebarProps['user']) => {
  let plan = 'free';

  const subPlan = user.subscription?.plan?.toLowerCase().trim();
  const subStatus = user.subscription?.status?.toLowerCase().trim();
  const accType = user.accountType?.toLowerCase().trim();

  // If subscription info exists, it takes precedence
  if (subPlan) {
    if (subStatus === 'active') {
      plan = subPlan;
    } else {
      // Inactive subscription overrides accountType -> Free
      plan = 'free';
    }
  } else if (accType) {
    // Fallback if no subscription object at all
    plan = accType;
  }

  return plan;
};

export function Sidebar({ user, activeSection = "user-info", onNavigate, onLogout }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleNavigate = (sectionId: string) => {
    // Determine effective plan
    const plan = getEffectivePlan(user);
    console.log("Sidebar User:", user);
    console.log("Effective Sidebar Plan:", plan);

    const isFree = plan === 'free';
    const isLocked = isFree && sectionId !== "user-info";

    if (isLocked) {
      toast({
        title: "Upgrade to Pro",
        description: "This feature is available only for Pro members. Upgrade now to unlock all features!",
        action: (
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/billing'}>
            Upgrade
          </Button>
        ),
      });
      return;
    }

    onNavigate?.(sectionId);
    setOpen(false);
  };

  const SidebarContent = () => {
    const plan = getEffectivePlan(user);
    const isFree = plan === 'free';

    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-amber-50 to-white border-r border-gray-200">
        {/* Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-12 w-12 border-2 border-amber-700">
              <AvatarImage src={user.profilePic || `https://ui-avatars.com/api/?name=${user.email}`} alt={user.name || user.email} />
              <AvatarFallback>
                <User className="h-6 w-6 text-amber-700" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name || user.email}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
              <Badge
                className={`mt-1 text-xs ${!isFree
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {isFree ? 'Free' : 'Pro'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            // STRICT LOCK: Only unlock 'user-info' if plan is free.
            const isLocked = isFree && item.id !== "user-info";

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                disabled={isLocked && false}
                className={`group w-full flex items-center justify-between px-4 py-3 mb-1.5 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-900/20 translate-x-1"
                  : "text-gray-600 hover:bg-amber-50 hover:text-amber-800 hover:translate-x-1 hover:shadow-sm"
                  } ${isLocked ? "opacity-70 cursor-not-allowed bg-gray-50/50 grayscale-[0.5]" : ""}`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}

                <div className="flex items-center gap-3.5 z-10">
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-white/20" : "bg-transparent group-hover:bg-amber-100/50"
                    }`}>
                    <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-amber-700"}`} />
                  </div>
                  <span className={`text-sm font-semibold tracking-wide ${isActive ? "text-white" : "text-gray-700 group-hover:text-amber-900"}`}>
                    {item.label}
                  </span>
                </div>

                <div className="z-10">
                  {isLocked ? (
                    <Lock className="h-4 w-4 text-gray-400 group-hover:text-amber-600/70 transition-colors" />
                  ) : (
                    isActive && <ChevronRight className="h-4 w-4 text-white/80 animate-in fade-in slide-in-from-left-1" />
                  )}
                </div>
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
  };

  return (
    <>
      {/* Mobile Sidebar Toggle - Only visible on small screens if not using bottom nav */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full bg-white/90 backdrop-blur border-gray-200 shadow-sm hover:bg-amber-50"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 border-r-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Fills the parent container */}
      <div className="hidden lg:block w-full h-full">
        <SidebarContent />
      </div>
    </>
  );
}
