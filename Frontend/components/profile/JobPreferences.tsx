"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, DollarSign, Briefcase, Clock, Eye, Plus, X, Save, Loader2, Trash2, Target } from "lucide-react";
import { MatchedJobs } from "./MatchedJobs";

interface JobPreferencesProps {
  preferences?: {
    desiredRoles: string[];
    locations: string[];
    salaryMin?: number;
    salaryMax?: number;
    salaryPeriod?: string;
    experienceLevel?: string;
    workType: string[];
    availability: string;
  };
  profileVisible?: boolean;
  onProfileVisibilityChange?: (visible: boolean) => void;
  onPreferencesChange?: (preferences: any) => void;
}

const SALARY_MIN_OPTIONS = [40000, 50000, 60000, 75000, 90000, 100000, 120000, 150000];
const SALARY_MAX_OPTIONS = [50000, 60000, 75000, 90000, 100000, 120000, 150000, 200000];
const SALARY_PERIOD_OPTIONS = ["yearly", "monthly", "weekly", "hourly"];
const EXPERIENCE_LEVEL_OPTIONS = ["Entry Level", "Junior", "Mid-level", "Senior", "Lead", "Manager", "Director"];
const WORK_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Temporary", "Remote", "Hybrid"];
const AVAILABILITY_OPTIONS = ["Immediately", "2 weeks", "1 month", "2 months", "Not decided"];

// Helper function to format salary based on period
const formatSalaryDisplay = (min: number | undefined, max: number | undefined, period: string | undefined): string => {
  if (!min || !max) return "Not set";
  
  const convertSalary = (amount: number, fromPeriod: string): number => {
    // Convert from yearly to other periods
    if (fromPeriod === "yearly") return amount;
    if (fromPeriod === "monthly") return Math.round(amount / 12);
    if (fromPeriod === "weekly") return Math.round(amount / 52);
    if (fromPeriod === "hourly") return Math.round(amount / (52 * 40)); // 52 weeks * 40 hours
    return amount;
  };

  const displayPeriod = period || "yearly";
  
  let minDisplay = min;
  let maxDisplay = max;
  let periodLabel = displayPeriod.charAt(0).toUpperCase() + displayPeriod.slice(1);
  
  // If stored as yearly, convert to other formats for display
  if (displayPeriod !== "yearly") {
    minDisplay = convertSalary(min, displayPeriod);
    maxDisplay = convertSalary(max, displayPeriod);
  }

  return `$${minDisplay.toLocaleString()} - $${maxDisplay.toLocaleString()}/${displayPeriod.charAt(0)}`;
};

// Helper function to get salary options based on period
const getSalaryOptions = (period: string, isMin: boolean = true) => {
  const yearlyMinOptions = [40000, 50000, 60000, 75000, 90000, 100000, 120000, 150000];
  const yearlyMaxOptions = [50000, 60000, 75000, 90000, 100000, 120000, 150000, 200000];

  if (period === "yearly" || period === "yearly") {
    return isMin ? yearlyMinOptions : yearlyMaxOptions;
  }

  if (period === "monthly") {
    return isMin ? yearlyMinOptions.map(s => Math.round(s / 12)) : yearlyMaxOptions.map(s => Math.round(s / 12));
  }

  if (period === "weekly") {
    return isMin ? yearlyMinOptions.map(s => Math.round(s / 52)) : yearlyMaxOptions.map(s => Math.round(s / 52));
  }

  if (period === "hourly") {
    return isMin ? yearlyMinOptions.map(s => Math.round(s / (52 * 40))) : yearlyMaxOptions.map(s => Math.round(s / (52 * 40)));
  }

  return isMin ? yearlyMinOptions : yearlyMaxOptions;
};

export function JobPreferences({
  preferences: initialPreferences,
  profileVisible: initialVisible = false,
  onProfileVisibilityChange,
  onPreferencesChange,
}: JobPreferencesProps) {
  // State Management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profileVisible, setProfileVisible] = useState(initialVisible);
  const [showMatchedJobs, setShowMatchedJobs] = useState(false);
  const [hasValidPreferences, setHasValidPreferences] = useState(false);

  // Form State
  const [preferences, setPreferences] = useState({
    desiredRoles: initialPreferences?.desiredRoles || [],
    locations: initialPreferences?.locations || [],
    salaryMin: initialPreferences?.salaryMin || 60000,
    salaryMax: initialPreferences?.salaryMax || 100000,
    salaryPeriod: initialPreferences?.salaryPeriod || "yearly",
    experienceLevel: initialPreferences?.experienceLevel || "Mid-level",
    workType: initialPreferences?.workType || [],
    availability: initialPreferences?.availability || "Immediately",
  });

  // Input State for new items
  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Fetch preferences from database on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  // Check if user has enough preferences for matching
  useEffect(() => {
    const hasRoles = preferences.desiredRoles.length > 0;
    const hasLocations = preferences.locations.length > 0 || preferences.workType.includes('Remote');
    const hasSalary = preferences.salaryMin > 0 && preferences.salaryMax > 0;
    
    setHasValidPreferences(hasRoles && (hasLocations || hasSalary));
  }, [preferences]);

  // Fetch Preferences from Database
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/v1/jobseeker/preferences", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data && response.data.data) {
        const data = response.data.data;
        setPreferences({
          desiredRoles: data.desiredRoles || [],
          locations: data.locations || [],
          salaryMin: data.salaryMin || 60000,
          salaryMax: data.salaryMax || 100000,
          salaryPeriod: data.salaryPeriod || "yearly",
          experienceLevel: data.experienceLevel || "Mid-level",
          workType: data.workType || [],
          availability: data.availability || "Immediately",
        });
        setProfileVisible(data.profileVisible ?? false);
      }
    } catch (err) {
      console.log("No preferences found, using defaults");
    } finally {
      setLoading(false);
    }
  };

  // Save Preferences to Database
  const savePreferences = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await axios.post(
        "/api/v1/jobseeker/preferences",
        {
          ...preferences,
          profileVisible,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccess("Preferences saved successfully!");
      setIsEditing(false);
      onPreferencesChange?.(preferences);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  // Update Preferences (Partial Update)
  const updatePreferences = async (updates: Partial<typeof preferences>) => {
    try {
      console.log('Updating preferences:', updates);
      await axios.put(
        "/api/v1/jobseeker/preferences",
        updates,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log('Preferences updated successfully');
    } catch (err) {
      console.error("Failed to update preferences:", err);
      throw err; // Re-throw so the caller can handle it
    }
  };

  // Delete Preferences (Reset to defaults)
  const deletePreferences = async () => {
    if (!confirm("Are you sure you want to reset all preferences?")) return;

    try {
      await axios.delete("/api/v1/jobseeker/preferences", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setPreferences({
        desiredRoles: [],
        locations: [],
        salaryMin: 60000,
        salaryMax: 100000,
        salaryPeriod: "yearly",
        experienceLevel: "Mid-level",
        workType: [],
        availability: "Immediately",
      });
      setProfileVisible(false);
      setSuccess("Preferences reset successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to reset preferences");
    }
  };

  // Add Role
  const addRole = () => {
    if (newRole.trim() && !preferences.desiredRoles.includes(newRole)) {
      const updated = [...preferences.desiredRoles, newRole];
      setPreferences({ ...preferences, desiredRoles: updated });
      updatePreferences({ desiredRoles: updated });
      setNewRole("");
    }
  };

  // Remove Role
  const removeRole = (role: string) => {
    console.log('removeRole called with:', role);
    console.log('Current desiredRoles:', preferences.desiredRoles);
    console.log('Role type:', typeof role, 'length:', role.length);
    console.log('Role trimmed:', role.trim());
    
    const updated = preferences.desiredRoles.filter((r) => {
      console.log('Comparing:', r, 'with:', role, 'equal:', r === role);
      return r !== role;
    });
    
    console.log('Updated roles:', updated);
    setPreferences((prev) => ({ ...prev, desiredRoles: updated }));
    updatePreferences({ desiredRoles: updated });
  };

  // Add Location
  const addLocation = () => {
    if (newLocation.trim() && !preferences.locations.includes(newLocation)) {
      const updated = [...preferences.locations, newLocation];
      setPreferences({ ...preferences, locations: updated });
      updatePreferences({ locations: updated });
      setNewLocation("");
    }
  };

  // Remove Location
  const removeLocation = (location: string) => {
    console.log('Removing location:', location, 'from:', preferences.locations);
    const updated = preferences.locations.filter((l) => l !== location);
    console.log('Updated locations:', updated);
    setPreferences((prev) => ({ ...prev, locations: updated }));
    updatePreferences({ locations: updated });
  };

  // Toggle Work Type
  const toggleWorkType = (type: string) => {
    const updated = preferences.workType.includes(type)
      ? preferences.workType.filter((t) => t !== type)
      : [...preferences.workType, type];
    setPreferences({ ...preferences, workType: updated });
    updatePreferences({ workType: updated });
  };

  // Update Salary Min
  const updateSalaryMin = (salary: number) => {
    setPreferences({ ...preferences, salaryMin: salary });
    updatePreferences({ salaryMin: salary });
  };

  // Update Salary Max
  const updateSalaryMax = (salary: number) => {
    setPreferences({ ...preferences, salaryMax: salary });
    updatePreferences({ salaryMax: salary });
  };

  // Update Salary Period
  const updateSalaryPeriod = (period: string) => {
    setPreferences({ ...preferences, salaryPeriod: period });
    updatePreferences({ salaryPeriod: period });
  };

  // Update Experience Level
  const updateExperienceLevel = (level: string) => {
    setPreferences({ ...preferences, experienceLevel: level });
    updatePreferences({ experienceLevel: level });
  };

  // Update Availability
  const updateAvailability = (availability: string) => {
    setPreferences({ ...preferences, availability });
    updatePreferences({ availability });
  };

  // Handle Profile Visibility
  const handleVisibilityChange = async (visible: boolean) => {
    setProfileVisible(visible);
    try {
      await axios.put(
        "/api/v1/jobseeker/preferences",
        { profileVisible: visible },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      onProfileVisibilityChange?.(visible);
    } catch (err) {
      console.error("Failed to update visibility:", err);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 mb-6 bg-white border-0 shadow-md">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-6 w-6 animate-spin text-amber-700" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 mb-6 bg-white border-0 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Job Preferences</h3>
          <div className="flex gap-2">
            {isEditing && (
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
              size="sm"
              className={isEditing ? "bg-amber-700 hover:bg-amber-800" : ""}
            >
              {isEditing ? "Done" : "Edit"}
            </Button>
          </div>
        </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6">
          {/* Edit Mode */}

          {/* Desired Roles */}
          <div>
            <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Desired Roles
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a role (e.g., Software Engineer)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addRole()}
                className="flex-1"
              />
              <Button onClick={addRole} size="sm" className="bg-amber-700 hover:bg-amber-800">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.desiredRoles.map((role) => (
                <Badge key={role} variant="secondary" className="flex items-center gap-1">
                  {role}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('X clicked for role:', role);
                      removeRole(role);
                    }}
                    className="ml-1 inline-flex items-center justify-center"
                    aria-label={`Remove ${role}`}
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a location (e.g., Toronto, ON)"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLocation()}
                className="flex-1"
              />
              <Button onClick={addLocation} size="sm" className="bg-amber-700 hover:bg-amber-800">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.locations.map((location) => (
                <Badge key={location} variant="secondary" className="flex items-center gap-1">
                  {location}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('X clicked for location:', location);
                      removeLocation(location);
                    }}
                    className="ml-1 inline-flex items-center justify-center"
                    aria-label={`Remove ${location}`}
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-red-500" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Salary Min
              </label>
              <select
                value={preferences.salaryMin}
                onChange={(e) => updateSalaryMin(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700"
              >
                {getSalaryOptions(preferences.salaryPeriod, true).map((salary) => (
                  <option key={salary} value={salary}>
                    ${salary.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
                Salary Max
              </label>
              <select
                value={preferences.salaryMax}
                onChange={(e) => updateSalaryMax(parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700"
              >
                {getSalaryOptions(preferences.salaryPeriod, false).map((salary) => (
                  <option key={salary} value={salary}>
                    ${salary.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
                Period
              </label>
              <select
                value={preferences.salaryPeriod}
                onChange={(e) => updateSalaryPeriod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700"
              >
                {SALARY_PERIOD_OPTIONS.map((period) => (
                  <option key={period} value={period}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Experience Level
            </label>
            <select
              value={preferences.experienceLevel}
              onChange={(e) => updateExperienceLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700"
            >
              {EXPERIENCE_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Work Type */}
          <div>
            <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Work Type (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {WORK_TYPE_OPTIONS.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.workType.includes(type)}
                    onChange={() => toggleWorkType(type)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="flex text-sm font-semibold text-gray-900 mb-2 items-center gap-2">
              <Clock className="h-4 w-4" />
              Availability
            </label>
            <select
              value={preferences.availability}
              onChange={(e) => updateAvailability(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700"
            >
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Profile Visibility */}
          <div className="border-t pt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Eye className="h-4 w-4" />
              Make profile visible to employers
            </label>
            <Switch
              checked={profileVisible}
              onCheckedChange={handleVisibilityChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={savePreferences}
              disabled={saving}
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All
                </>
              )}
            </Button>
            <Button
              onClick={deletePreferences}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Reset All
            </Button>
          </div>
        </div>
      ) : (
        // View Mode
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Desired Roles */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <label className="flex text-xs font-semibold text-gray-700 mb-2 items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      Desired Roles
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {preferences.desiredRoles.length > 0 ? (
                        preferences.desiredRoles.map((role) => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not set</span>
                      )}
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
                    <label className="flex text-xs font-semibold text-gray-700 mb-2 items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Locations
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {preferences.locations.length > 0 ? (
                        preferences.locations.map((location) => (
                          <Badge key={location} variant="secondary">
                            {location}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not set</span>
                      )}
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
                    <label className="flex text-xs font-semibold text-gray-700 mb-2 items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Salary Expectation
                    </label>
                    <div className="flex gap-2 flex-wrap items-center">
                      <Badge variant="secondary">
                        {formatSalaryDisplay(preferences.salaryMin, preferences.salaryMax, preferences.salaryPeriod)}
                      </Badge>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Expected salary range ({preferences.salaryPeriod || "yearly"})</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Experience Level */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <label className="flex text-xs font-semibold text-gray-700 mb-2 items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      Experience Level
                    </label>
                    <Badge variant="secondary">{preferences.experienceLevel || "Not set"}</Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your professional experience level</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Work Type */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <label className="flex text-xs font-semibold text-gray-700 mb-2 items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      Work Type
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {preferences.workType.length > 0 ? (
                        preferences.workType.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not set</span>
                      )}
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
                    <label className="flex text-xs font-semibold text-gray-700 mb-2 items-center gap-1">
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
            <Switch checked={profileVisible} onCheckedChange={handleVisibilityChange} />
          </div>

          {/* Find Jobs Action */}
          {hasValidPreferences && !showMatchedJobs && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => setShowMatchedJobs(true)}
                className="w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Target className="h-5 w-5" />
                Find Matching Jobs with AI
              </Button>
            </div>
          )}
        </div>
      )}
      </Card>

      {/* AI-Matched Jobs Section */}
      {showMatchedJobs && hasValidPreferences && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Jobs Matched For You</h3>
            <Button
              onClick={() => setShowMatchedJobs(false)}
              variant="outline"
              size="sm"
            >
              Hide Matches
            </Button>
          </div>
          <MatchedJobs 
            userPreferences={preferences} 
            onJobSelect={(job) => {
              console.log('Selected job:', job);
              // You can add job detail modal or navigation here
            }}
          />
        </div>
      )}

      {/* Preferences Required Message */}
      {showMatchedJobs && !hasValidPreferences && (
        <Card className="mt-6 p-6 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <Target className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Set Your Preferences First
            </h3>
            <p className="text-yellow-700 mb-4">
              To find matching jobs, please add at least one desired role and location (or select Remote work).
            </p>
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Edit Preferences
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
