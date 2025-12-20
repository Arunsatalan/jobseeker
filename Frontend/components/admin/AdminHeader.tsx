"use client";

import { useState } from "react";
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
} from "lucide-react";

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
}

export function AdminHeader({ admin, activeSection, navItems }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount] = useState(3);

  const activeItem = navItems.find(item => item.id === activeSection);
  const pageTitle = activeItem?.label || "Dashboard";

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to home page
    window.location.href = '/';
  };

  const notifications = [
    {
      id: 1,
      title: "New user registration",
      message: "5 new job seekers registered",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Flagged content",
      message: "Job post requires review",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Payment processed",
      message: "Premium subscription activated",
      time: "3 hours ago",
      unread: false,
    },
  ];

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
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Globe className="h-4 w-4 mr-2" />
            View Site
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-white text-xs flex items-center justify-center"
                    style={{ backgroundColor: 'var(--admin-secondary)' }}
                  >
                    {notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-3 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-gray-500">{notificationCount} unread</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3 w-full">
                      <div 
                        className={`h-2 w-2 rounded-full mt-2 ${
                          notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                        }`} 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
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