"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
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
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface NavbarProps {
  savedJobsCount?: number;
}

export default function Navbar({
  savedJobsCount = 0,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      // Auto-refresh notifications every 30 seconds (less frequent than admin)
      const interval = setInterval(() => {
        if (!isDropdownOpen) {
          fetchNotifications();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isDropdownOpen]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoadingNotifications(true);
      setNotificationError(null);
      const token = localStorage.getItem('token');

      if (!token) return;

      const response = await fetch('http://localhost:5000/api/v1/notifications?limit=10', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.notifications) {
        setNotifications(data.data.notifications);
        const unreadCount = data.data.notifications.filter((n: Notification) => !n.isRead).length;
        setNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('[Navbar Notifications] Error:', error);
      setNotificationError('Failed to load notifications');
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('[Navbar Notifications] Error marking as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'application_update':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'job_match':
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      case 'job_posted':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'admin_new_job':
        return <AlertCircle className="h-4 w-4 text-amber-600" />;
      case 'job_deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const toggleNotificationExpansion = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    logout();
    router.push('/');
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
            {pathname === "profile" && (
              <>
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
              </>
            )}


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
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
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
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <p className="text-sm text-gray-500">
                        {notificationCount} unread notification{notificationCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchNotifications}
                      disabled={isLoadingNotifications}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {isLoadingNotifications ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : notificationError ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <AlertCircle className="h-8 w-8 mb-2 text-red-500" />
                      <p className="text-sm text-gray-600 text-center">{notificationError}</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Bell className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No notifications yet</p>
                      <p className="text-xs text-gray-400 mt-1">We'll notify you of important updates</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const isExpanded = expandedNotifications.has(notification._id);
                      return (
                        <div
                          key={notification._id}
                          className={`border-b px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''
                            }`}
                          onClick={() => {
                            if (!notification.isRead) {
                              markNotificationAsRead(notification._id);
                            }
                            toggleNotificationExpansion(notification._id);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm text-gray-900">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className={`text-sm text-gray-600 mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-400">
                                  {formatDate(notification.createdAt)}
                                </p>
                                <button
                                  className="text-xs text-blue-600 hover:text-blue-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNotificationExpansion(notification._id);
                                  }}
                                >
                                  {isExpanded ? 'Show less' : 'Show more'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-3 text-center">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Notifications
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile Dropdown */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                  title="User menu"
                >
                  <div className="h-8 w-8 bg-linear-to-br from-slate-600 to-amber-800 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 hidden sm:block ${showUserMenu ? "rotate-180" : "rotate-0"
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Profile - Show for all users */}
                      <Link
                        href={user.role === "employer" ? "/employer-dashboard/profile" : "/profile"}
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

                      {/* Show additional items only for non-employer users */}
                      {user.role !== "employer" && (
                        <>
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
                        </>
                      )}

                      {/* My Plan - Show for all users */}
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
            ) : (
              /* Sign In Button for unauthenticated users */
              <Button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-linear-to-r from-primary-500 to-secondary-400 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Sign In
              </Button>
            )}
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
