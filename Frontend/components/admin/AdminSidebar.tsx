"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Settings as SettingsIcon,
  Bell,
} from "lucide-react";

interface AdminSidebarProps {
  admin: {
    name: string;
    email: string;
    role: string;
    avatar: string;
  };
  navItems: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    href: string;
    badge?: string | null;
    subItems?: Array<{
      id: string;
      label: string;
      href: string;
    }>;
  }>;
  activeSection: string;
  collapsed: boolean;
  onNavigate: (section: string) => void;
  onToggleCollapse: () => void;
}

export function AdminSidebar({
  admin,
  navItems,
  activeSection,
  collapsed,
  onNavigate,
  onToggleCollapse,
}: AdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleLogout = () => {
    console.log("Admin logout");
    // Implement logout logic
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-40 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--admin-primary)' }}
              >
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg" style={{ color: 'var(--admin-primary)' }}>
                  Admin Panel
                </h2>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="p-1"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Admin Profile */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2" style={{ ringColor: 'var(--admin-primary)' }}>
              <AvatarImage src={admin.avatar} alt={admin.name} />
              <AvatarFallback style={{ backgroundColor: 'var(--admin-accent-100)' }}>
                {admin.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {admin.name}
              </p>
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ 
                  backgroundColor: 'var(--admin-accent-100)', 
                  color: 'var(--admin-primary)' 
                }}
              >
                {admin.role}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.id);

          return (
            <div key={item.id} className="mb-1">
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start text-left h-auto py-3 px-3 ${
                  isActive 
                    ? 'text-white shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive ? { backgroundColor: 'var(--admin-primary)' } : {}}
                onClick={() => {
                  if (hasSubItems) {
                    toggleExpanded(item.id);
                  } else {
                    onNavigate(item.id);
                  }
                }}
              >
                <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge 
                        variant="outline" 
                        className="ml-2 text-xs"
                        style={{ 
                          borderColor: isActive ? 'rgba(255,255,255,0.3)' : 'var(--admin-secondary)',
                          color: isActive ? 'white' : 'var(--admin-secondary)'
                        }}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {hasSubItems && (
                      <ChevronRight 
                        className={`h-3 w-3 ml-2 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                      />
                    )}
                  </>
                )}
              </Button>

              {/* Sub Items */}
              {hasSubItems && isExpanded && !collapsed && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => (
                    <Button
                      key={subItem.id}
                      variant="ghost"
                      className="w-full justify-start text-left text-sm py-2 px-3 text-gray-600 hover:bg-gray-50"
                      onClick={() => onNavigate(subItem.id)}
                    >
                      {subItem.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full mb-2 text-gray-600 hover:bg-gray-50"
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          className={`${collapsed ? 'w-full' : 'w-full'} text-red-600 hover:bg-red-50 border-red-200`}
          onClick={handleLogout}
        >
          <LogOut className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
}