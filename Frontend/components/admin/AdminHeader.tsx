"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Globe,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  metadata?: any;
}

interface AdminHeaderProps {
  admin: {
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
  activeSection: string;
  navItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
  }>;
  onRefresh?: () => void;
}

export function AdminHeader({ admin, activeSection, navItems, onRefresh }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const maxRetries = 3;

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh notifications every 5 seconds, but pause when dropdown is open
    const interval = setInterval(() => {
      if (!isDropdownOpen) {
        fetchNotifications();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isDropdownOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      setNotificationError(null);
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token) {
        console.log('[Notifications] No token found in localStorage');
        setNotificationError('Not authenticated');
        return;
      }

      if (!user) {
        console.log('[Notifications] No user data found');
        setNotificationError('User data missing');
        return;
      }

      // console.log('[Notifications] Fetching with token:', token.substring(0, 20) + '...');
      // console.log('[Notifications] User:', user);
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications?limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('[Notifications] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[Notifications] API error:', response.status, errorData);
        
        if (response.status === 401) {
          setNotificationError('Authentication expired');
        } else if (response.status === 404) {
          setNotificationError('API endpoint not found');
        } else {
          setNotificationError(`Error: ${response.status}`);
        }
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Notifications] API response:', data);
      
      if (data.success && data.data?.notifications) {
        console.log('[Notifications] Notifications received:', data.data.notifications.length);
        setNotifications(data.data.notifications);
        setRetryCount(0);
        
        // Count unread notifications
        const unreadCount = data.data.notifications.filter((n: Notification) => !n.isRead).length;
        setNotificationCount(unreadCount);
        console.log('[Notifications] Unread count:', unreadCount);
      } else {
        console.warn('[Notifications] Unexpected response format:', data);
        setNotificationError('Invalid response format');
      }
    } catch (error: any) {
      console.error('[Notifications] Error fetching notifications:', error);
      
      if (error.name === 'AbortError') {
        setNotificationError('Request timeout');
      } else if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setNotificationError('Cannot connect to server');
      } else {
        setNotificationError(error.message || 'Failed to fetch notifications');
      }
      
      if (retryCount < maxRetries) {
        console.log(`[Notifications] Retrying... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(retryCount + 1);
        }, 2000);
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admin_notification':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
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

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Update local state immediately for better UX
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        
        // Update unread count
        setNotificationCount(prev => Math.max(0, prev - 1));
        
        console.log('[Notifications] Marked as read:', notificationId);
      }
    } catch (error) {
      console.error('[Notifications] Error marking as read:', error);
    }
  };

  const activeItem = navItems.find(item => item.id === activeSection);
  const pageTitle = activeItem?.label || "Dashboard";

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left: Page Title & Breadcrumb */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-500">
              Manage and monitor your platform
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users, jobs, content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Actions */}
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="hidden md:flex"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Globe className="h-4 w-4 mr-2" />
            View Site
          </Button>

          {/* Notifications */}
          <DropdownMenu onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                    style={{ backgroundColor: 'var(--admin-secondary)' }}
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
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
              
              <div className="max-h-96 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                ) : notificationError ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4">
                    <AlertCircle className="h-8 w-8 mb-2 text-red-500" />
                    <p className="text-sm text-gray-600 text-center">{notificationError}</p>
                    <p className="text-xs text-gray-400 mt-2">Check browser console for details</p>
                    {retryCount < maxRetries && (
                      <p className="text-xs text-gray-400 mt-1">Retrying... ({retryCount}/{maxRetries})</p>
                    )}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                    <p className="text-xs text-gray-400 mt-1">Register a new user to see notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`border-b px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.isRead) {
                          markNotificationAsRead(notification._id);
                        }
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
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
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

          {/* Help */}
          <Button variant="ghost" size="sm">
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Admin Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={admin.avatar} alt={admin.name} />
                  <AvatarFallback style={{ backgroundColor: 'var(--admin-accent-100)' }}>
                    {admin.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{admin.name}</p>
                  <p className="text-xs text-gray-500">{admin.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">{admin.name}</p>
                <p className="text-xs text-gray-500">{admin.email}</p>
              </div>
              
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Admin Settings
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}