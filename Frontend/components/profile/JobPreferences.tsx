"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, DollarSign, Briefcase, Clock, Eye } from "lucide-react";

interface JobPreferencesProps {
  preferences: {
    desiredRoles: string[];
    locations: string[];
    salaryRange: string;
    workType: string[];
    availability: string;
  };
  profileVisible: boolean;
  onProfileVisibilityChange: (visible: boolean) => void;
  onPreferencesChange?: (preferences: any) => void;
}

export function JobPreferences({
  preferences,
  profileVisible,
  onProfileVisibilityChange,
}: JobPreferencesProps) {
  return (
    <Card className="p-6 mb-6 bg-white border-0 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Job Preferences</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Desired Roles */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Desired Roles
                </label>
                <div className="flex gap-2 flex-wrap">
                  {preferences.desiredRoles.map((role) => (
                    <Badge key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Jobs matching these roles will be highlighted</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Locations */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Locations
                </label>
                <div className="flex gap-2 flex-wrap">
                  {preferences.locations.map((location) => (
                    <Badge key={location} variant="secondary">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Where you're willing to work</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Salary Range */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Salary Expectation
                </label>
                <Badge variant="secondary">{preferences.salaryRange}</Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Minimum salary you expect</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Work Type */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Work Type
                </label>
                <div className="flex gap-2 flex-wrap">
                  {preferences.workType.map((type) => (
                    <Badge key={type} variant="secondary">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Full-time, Remote, Hybrid, etc.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Availability */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Availability
                </label>
                <Badge variant="secondary">{preferences.availability}</Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>When you're available to start</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Profile Visibility */}
      <div className="border-t pt-4 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Eye className="h-4 w-4" />
          Make profile visible to employers
        </label>
        <Switch checked={profileVisible} onCheckedChange={onProfileVisibilityChange} />
      </div>
    </Card>
  );
}
