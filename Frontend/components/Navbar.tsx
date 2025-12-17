"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Heart,
  FileText,
  MessageCircle,
  Bell,
  User,
  LogOut,
  Settings,
  Zap,
  Star,
  Download,
  ChevronDown,
} from "lucide-react";

interface NavbarProps {
  savedJobsCount?: number;
  notificationCount?: number;
}

export default function Navbar({
  savedJobsCount = 0,
  notificationCount = 0,
}: NavbarProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // TODO: Implement logout logic
    router.push("/login");
    setShowUserMenu(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ===== LEFT: LOGO ===== */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-linear-to-br from-slate-700 to-amber-900 group-hover:shadow-lg transition-shadow">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-slate-800 to-amber-900 bg-clip-text text-transparent hidden sm:inline">
              CanadaJobs
            </span>
          </Link>

          {/* ===== CENTER: NAVIGATION MENU ===== */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/jobs"
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors flex items-center gap-2"
            >
              <Briefcase className="h-4 w-4" />
              Jobs
            </Link>

            <Link
              href="/saved"
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors flex items-center gap-2 relative"
            >
              <Heart className="h-4 w-4" />
              Schedule
              {savedJobsCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {savedJobsCount > 9 ? "9+" : savedJobsCount}
                </span>
              )}
            </Link>

            <Link
              href="/applications"
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Applications
            </Link>
          </div>

          {/* ===== RIGHT: ACTION BUTTONS ===== */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Messages Button */}
            <button
              className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Messages"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-amber-700 rounded-full"></span>
            </button>

            {/* Notifications Button */}
            <button
              className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                title="User menu"
              >
                <div className="h-8 w-8 bg-linear-to-br from-slate-600 to-amber-800 rounded-full flex items-center justify-center text-white font-semibold">
                  AK
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 hidden sm:block ${
                    showUserMenu ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      Arun Kumar
                    </p>
                    <p className="text-xs text-gray-600">arun@example.com</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Resume */}
                    <Link
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-slate-50 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-slate-700" />
                      <div>
                        <p className="text-sm font-medium">Profile</p>
                        <p className="text-xs text-gray-600">
                          Manage your profile
                        </p>{" "}
                      </div>
                    </Link>

                    {/* Tools */}
                    <Link
                      href="/tools"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      <Zap className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Tools</p>
                        <p className="text-xs text-gray-600">
                          Interview prep & more
                        </p>
                      </div>
                    </Link>

                    {/* Recommended */}
                    <Link
                      href="/recommended"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 transition-colors"
                    >
                      <Star className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium">Recommended</p>
                        <p className="text-xs text-gray-600">
                          Jobs picked for you
                        </p>
                      </div>
                    </Link>

                    {/* Settings */}
                    <Link
                      href="/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium">Settings</p>
                        <p className="text-xs text-gray-600">
                          Account preferences
                        </p>
                      </div>
                    </Link>

                    {/* My Plan */}
                    <Link
                      href="/my-plan"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-amber-50 transition-colors"
                    >
                      <div className="h-4 w-4 rounded border-2 border-amber-700 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 bg-amber-700 rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">My Plan</p>
                        <p className="text-xs text-amber-700 font-semibold">
                          Premium
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-700 hover:bg-red-50 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2 py-2 border-t border-gray-100 text-sm">
          <Link
            href="/jobs"
            className="flex-1 px-3 py-1 rounded text-center text-gray-700 hover:bg-gray-100"
          >
            Jobs
          </Link>
          <Link
            href="/"
            className="flex-1 px-3 py-1 rounded text-center text-gray-700 hover:bg-gray-100"
          >
            Schedule
          </Link>
          <Link
            href="/applications"
            className="flex-1 px-3 py-1 rounded text-center text-gray-700 hover:bg-gray-100"
          >
            Apps
          </Link>
        </div>
      </div>
    </nav>
  );
}
