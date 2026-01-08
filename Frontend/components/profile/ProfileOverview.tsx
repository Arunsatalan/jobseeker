"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  FileText,
  Eye,
  Check,
  X,
  Edit2,
  Save,
  Plus,
  Trash2,
  Camera,
  Globe,
  Mail,
  Phone,
  Calendar,
  Sparkles
} from "lucide-react";

// Use process.env for API base URL
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

interface ProfileOverviewProps {
  user: {
    name: string;
    email: string;
    phone: string;
    profilePic: string;
  };
  onProfileUpdate?: (data: any) => void;
}

export function ProfileOverview({ user, onProfileUpdate }: ProfileOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [fetchedProfileData, setFetchedProfileData] = useState<any>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    city: "",
    province: "",
    postalCode: "",
    headline: "",
    careerObjective: "",
    currentJobTitle: "",
    company: "",
    yearsOfExperience: "",
    industry: "",
    employmentType: [],
    skills: [],
    languages: [],
    education: [],
    profileVisibility: false,
    openToWork: false,
    showInSearch: false,
    preferredWorkTypes: [],
  });

  const [newSkill, setNewSkill] = useState("");
  const [newSkillTitle, setNewSkillTitle] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newLanguageProficiency, setNewLanguageProficiency] = useState("");

  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    description: ""
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfilePicUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('profilePic', file);

    try {
      const response = await axios.post('/api/v1/user-profiles/upload-profile-pic', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const profilePicUrl = response.data.data.profilePic;
        setProfilePhotoUrl(profilePicUrl);
        onProfileUpdate?.({ profilePic: profilePicUrl });
        alert('Profile picture uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture. Please try again.');
    }
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/api/v1/user-profiles/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          const profileData = response.data.data;
          setFetchedProfileData(profileData);

          if (profileData.profilePhoto) {
            const photoUrl = typeof profileData.profilePhoto === 'string'
              ? profileData.profilePhoto
              : profileData.profilePhoto?.url;
            if (photoUrl) setProfilePhotoUrl(photoUrl);
          }

          setFormData({
            firstName: profileData.firstName || user?.name?.split(" ")[0] || "",
            lastName: profileData.lastName || user?.name?.split(" ")[1] || "",
            email: profileData.email || user?.email || "",
            phone: profileData.phone || user?.phone || "",
            dateOfBirth: "1995-03-15",
            gender: "Male",
            nationality: "Canadian",
            city: profileData.location?.split(', ')[0] || "",
            province: profileData.location?.split(', ')[1] || "",
            postalCode: profileData.location?.split(', ')[2] || "",
            headline: profileData.headline || "",
            careerObjective: profileData.bio || "",
            currentJobTitle: profileData.jobSeekerProfile?.currentJobTitle || "",
            company: profileData.jobSeekerProfile?.company || "",
            yearsOfExperience: profileData.jobSeekerProfile?.yearsOfExperience?.toString() || "",
            industry: profileData.jobSeekerProfile?.preferredIndustries?.[0] || "Information Technology",
            employmentType: profileData.jobSeekerProfile?.preferredEmploymentTypes || ["Full-time"],
            skills: profileData.jobSeekerProfile?.skills || [],
            languages: profileData.jobSeekerProfile?.languages || [],
            education: profileData.education || [],
            profileVisibility: profileData.privacy?.profileVisibility === 'public',
            openToWork: profileData.privacy?.allowMessages ?? false,
            showInSearch: profileData.privacy?.showEmail ?? false,
            preferredWorkTypes: profileData.jobSeekerProfile?.preferredWorkTypes || [],
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token, user]);

  useEffect(() => {
    if (!fetchedProfileData) return;

    const totalFields = 13;
    let completedFields = 0;
    const missing: string[] = [];

    if (fetchedProfileData.firstName) completedFields++; else missing.push('First Name');
    if (fetchedProfileData.lastName) completedFields++; else missing.push('Last Name');
    if (fetchedProfileData.email) completedFields++; else missing.push('Email');
    if (fetchedProfileData.phone) completedFields++; else missing.push('Phone');
    if (fetchedProfileData.location) completedFields++; else missing.push('Location');
    if (fetchedProfileData.jobSeekerProfile?.skills?.length > 0) completedFields++; else missing.push('Skills');
    if (fetchedProfileData.jobSeekerProfile?.languages?.length > 0) completedFields++; else missing.push('Languages');
    if (fetchedProfileData.headline) completedFields++; else missing.push('Headline');
    if (fetchedProfileData.jobSeekerProfile?.currentJobTitle) completedFields++; else missing.push('Job Title');
    if (fetchedProfileData.jobSeekerProfile?.company) completedFields++; else missing.push('Company');
    if (fetchedProfileData.jobSeekerProfile?.preferredWorkTypes?.length > 0) completedFields++; else missing.push('Work Types');
    if (fetchedProfileData.jobSeekerProfile?.yearsOfExperience !== undefined && fetchedProfileData.jobSeekerProfile?.yearsOfExperience !== null) completedFields++; else missing.push('Experience');
    if (fetchedProfileData.education?.length > 0) completedFields++; else missing.push('Education');

    const completionPercentage = Math.round((completedFields / totalFields) * 100);
    setProfileCompletion(completionPercentage);
    setMissingFields(missing);
  }, [fetchedProfileData]);

  const handleSave = async () => {
    try {
      const payload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: `${formData.city}, ${formData.province}, ${formData.postalCode}`,
        bio: formData.careerObjective,
        headline: formData.headline,
        jobSeekerProfile: {
          skills: formData.skills,
          languages: formData.languages,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          preferredIndustries: [formData.industry],
          preferredEmploymentTypes: formData.employmentType,
          preferredWorkTypes: formData.preferredWorkTypes,
          openToRemote: formData.preferredWorkTypes.includes('Remote'),
          currentJobTitle: formData.currentJobTitle,
          company: formData.company,
          salaryExpectation: { min: 0, max: 0, currency: 'CAD' },
        },
        education: formData.education,
        privacy: {
          profileVisibility: formData.profileVisibility ? 'public' : 'private',
          showEmail: formData.showInSearch,
          allowMessages: formData.openToWork,
        },
      };

      const response = await axios.post("/api/v1/user-profiles", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const savedData = response.data.data;
        setFetchedProfileData(savedData);
        onProfileUpdate?.(savedData);
        setIsEditing(false);
        alert('Profile saved successfully!');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Failed to save profile changes.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Profile Header Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <Card className="relative p-8 bg-white/90 backdrop-blur-xl border-amber-100/50 shadow-xl rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Avatar Section */}
            <div className="relative group/avatar">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-2xl ring-4 ring-amber-50">
                  <AvatarImage className="object-cover" src={profilePhotoUrl || user?.profilePic || `https://ui-avatars.com/api/?name=${user?.email}`} />
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-3xl font-bold">
                    {formData.firstName?.[0]}{formData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2.5 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 hover:scale-110 transition-all duration-200 group-hover/avatar:opacity-100 opacity-0"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePicUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {formData.firstName} {formData.lastName}
                  {profileCompletion === 100 && <Sparkles className="inline-block h-6 w-6 ml-2 text-amber-500 animate-pulse" />}
                </h1>
                <p className="text-lg text-amber-700 font-medium flex items-center justify-center md:justify-start gap-2">
                  <Briefcase className="h-4 w-4" />
                  {formData.headline || "Add your professional headline"}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1">
                  <MapPin className="h-3 w-3 mr-1.5" />
                  {formData.city || "City"}, {formData.province || "Province"}
                </Badge>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1">
                  <Mail className="h-3 w-3 mr-1.5" />
                  {formData.email}
                </Badge>
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 px-3 py-1 cursor-help" title={`Missing: ${missingFields.join(', ')}`}>
                  {profileCompletion}% Complete
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 min-w-[140px]">
              <Button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`w-full shadow-lg transition-all duration-300 ${isEditing
                  ? "bg-green-600 hover:bg-green-700 text-white hover:scale-105"
                  : "bg-amber-600 hover:bg-amber-700 text-white hover:scale-105"
                  }`}
              >
                {isEditing ? (
                  <>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                  </>
                )}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Progress Bar (Subtle) */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 transition-all duration-1000 ease-out"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="personal" className="w-full space-y-8">
        <TabsList className="w-full justify-start p-1 bg-white/50 backdrop-blur-md rounded-xl border border-gray-200/50 shadow-sm overflow-x-auto">
          {[
            { id: 'personal', icon: User, label: 'Personal' },
            { id: 'career', icon: Briefcase, label: 'Career' },
            { id: 'education', icon: GraduationCap, label: 'Education' },
            { id: 'skills', icon: Code, label: 'Skills' },
            { id: 'visibility', icon: Eye, label: 'Visibility' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex-1 min-w-[100px] gap-2 data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all duration-300 rounded-lg py-2.5"
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TabsContent value="personal" className="mt-0">
            <Card className="p-8 border-gray-100 shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur rounded-2xl">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <User className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
                  <p className="text-sm text-gray-500">Manage your identity and contact info</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isEditing ? (
                  <>
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">First Name</Label>
                          <Input value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className="bg-gray-50/50 border-gray-200 focus:border-amber-500 focus:ring-amber-200" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Last Name</Label>
                          <Input value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="bg-gray-50/50 border-gray-200 focus:border-amber-500 focus:ring-amber-200" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          <Input value={formData.email} disabled className="pl-10 bg-gray-100/50 text-gray-500 cursor-not-allowed border-gray-200" />
                          <Check className="absolute right-3 top-2.5 h-4 w-4 text-green-500" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</Label>
                        <Input value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="+1 (555) 000-0000" className="bg-gray-50/50 border-gray-200 focus:border-amber-500 focus:ring-amber-200" />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Location</Label>
                          <Input value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} placeholder="City, Province" className="bg-gray-50/50 border-gray-200 focus:border-amber-500 focus:ring-amber-200" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Postal</Label>
                          <Input value={formData.postalCode} onChange={(e) => handleInputChange("postalCode", e.target.value)} placeholder="Zip" className="bg-gray-50/50 border-gray-200 focus:border-amber-500 focus:ring-amber-200" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Nationality</Label>
                          <Input value={formData.nationality} onChange={(e) => handleInputChange("nationality", e.target.value)} className="bg-gray-50/50 border-gray-200 focus:border-amber-500 focus:ring-amber-200" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Gender</Label>
                          <select value={formData.gender} onChange={(e) => handleInputChange("gender", e.target.value)} className="w-full flex h-10 rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-200">
                            <option>Male</option>
                            <option>Female</option>
                            <option>Prefer Not to Say</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-50/80 transition-colors">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
                          <p className="text-lg font-semibold text-gray-900 mt-0.5">{formData.firstName} {formData.lastName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-50/80 transition-colors">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                          <p className="text-lg font-semibold text-gray-900 mt-0.5">{formData.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-50/80 transition-colors">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                          <p className="text-lg font-semibold text-gray-900 mt-0.5">{formData.phone || "Not provided"}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-50/80 transition-colors">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-400">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Location</p>
                          <p className="text-lg font-semibold text-gray-900 mt-0.5">{formData.city || "N/A"}, {formData.province || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="career" className="mt-0">
            <Card className="p-8 border-gray-100 shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur rounded-2xl">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Career Profile</h3>
                  <p className="text-sm text-gray-500">Your professional journey and goals</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    Headline
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-normal uppercase">Visible</span>
                  </Label>
                  {isEditing ? (
                    <Input value={formData.headline} onChange={(e) => handleInputChange("headline", e.target.value)} placeholder="e.g. Senior Product Designer" className="text-lg font-medium border-gray-200 focus:border-blue-500" />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-lg font-medium text-gray-500 italic">
                      {formData.headline || "Add a professional headline..."}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-800">Current Role</Label>
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input value={formData.currentJobTitle} onChange={(e) => handleInputChange("currentJobTitle", e.target.value)} placeholder="Job Title" />
                        <Input value={formData.company} onChange={(e) => handleInputChange("company", e.target.value)} placeholder="Company" />
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="font-semibold text-gray-900">{formData.currentJobTitle || "Not specified"}</p>
                        <p className="text-gray-500 text-sm">{formData.company}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-gray-800">Total Experience</Label>
                    {isEditing ? (
                      <div className="flex items-center gap-3">
                        <Input type="number" value={formData.yearsOfExperience} onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)} className="w-24" />
                        <span className="text-gray-500">Years</span>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="font-semibold text-gray-900 text-2xl">{formData.yearsOfExperience !== undefined && formData.yearsOfExperience !== "" ? formData.yearsOfExperience : 0} <span className="text-sm font-normal text-gray-500">Years</span></p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold text-gray-800">Career Objective</Label>
                  {isEditing ? (
                    <Textarea value={formData.careerObjective} onChange={(e) => handleInputChange("careerObjective", e.target.value)} rows={4} className="resize-none border-gray-200" />
                  ) : (
                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 leading-relaxed italic">
                      "{formData.careerObjective || "Share your professional goals..."}"
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Placeholder tabs for brevity, can be fully expanded similarly */}
          <TabsContent value="education" className="mt-0">
            <Card className="p-8 border-gray-100 shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur rounded-2xl">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
                <div className="p-2 bg-green-50 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Education</h3>
                  <p className="text-sm text-gray-500">Your academic background</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* List Existing Education */}
                {formData.education.map((edu: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                    <div className="mt-1">
                      <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900">{edu.institution}</h4>
                          <p className="text-blue-600 font-medium">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{edu.startDate ? new Date(edu.startDate).getFullYear() : '?'} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}</span>
                          </div>
                          {edu.description && <p className="text-sm text-gray-600 mt-2">{edu.description}</p>}
                        </div>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              const newEduList = formData.education.filter((_, i) => i !== index);
                              handleInputChange("education", newEduList);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {formData.education.length === 0 && !isEditing && (
                  <div className="text-center py-8 text-gray-500">
                    No education details added yet.
                  </div>
                )}

                {/* Add New Education Form */}
                {isEditing && (
                  <div className="mt-6 p-6 border border-dashed border-gray-300 rounded-xl bg-gray-50/30">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Add Education
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Institution / School</Label>
                        <Input
                          value={newEducation.institution}
                          onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                          placeholder="University of ..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Degree</Label>
                        <Input
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                          placeholder="Bachelor's, Master's, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Field of Study</Label>
                        <Input
                          value={newEducation.fieldOfStudy}
                          onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
                          placeholder="Computer Science, Business, etc."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-xs">Start Date</Label>
                          <Input
                            type="date"
                            value={newEducation.startDate}
                            onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">End Date</Label>
                          <Input
                            type="date"
                            value={newEducation.endDate}
                            onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 space-y-2">
                      <Label className="text-xs">Description (Optional)</Label>
                      <Textarea
                        value={newEducation.description}
                        onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                        placeholder="Activities, societies, etc."
                        className="h-20 resize-none"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (newEducation.institution && newEducation.degree) {
                          handleInputChange("education", [...formData.education, newEducation]);
                          setNewEducation({
                            institution: "",
                            degree: "",
                            fieldOfStudy: "",
                            startDate: "",
                            endDate: "",
                            description: ""
                          });
                        } else {
                          alert("Please enter at least Institution and Degree.");
                        }
                      }}
                      className="w-full bg-gray-900 text-white hover:bg-black"
                    >
                      Add Education
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="skills" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Skills & Languages
              </h3>

              {!isEditing ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill: any) => (
                        <Badge key={skill} className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang: any) => (
                        <Badge key={lang} className="bg-green-100 text-green-700 hover:bg-green-100">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-3">Technical Skills</p>
                    <div className="space-y-2 mb-3">
                      {formData.skills.map((skill: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div className="flex-1">
                            <span className="text-sm font-medium block">{skill}</span>
                          </div>
                          <button
                            onClick={() => {
                              const newSkills = formData.skills.filter((_: any, i: number) => i !== idx);
                              handleInputChange('skills', newSkills);
                            }}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Skill Name</Label>
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="e.g., React, Python, Project Management"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newSkill.trim()) {
                              handleInputChange('skills', [...formData.skills, newSkill.trim()]);
                              setNewSkill('');
                              setNewSkillTitle('');
                            }
                          }}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          if (newSkill.trim()) {
                            handleInputChange('skills', [...formData.skills, newSkill.trim()]);
                            setNewSkill('');
                            setNewSkillTitle('');
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Skill
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-3">Languages</p>
                    <div className="space-y-2 mb-3">
                      {formData.languages.map((lang: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <div className="flex-1">
                            <span className="text-sm font-medium block">{lang}</span>
                          </div>
                          <button
                            onClick={() => {
                              const newLanguages = formData.languages.filter((_: any, i: number) => i !== idx);
                              handleInputChange('languages', newLanguages);
                            }}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">Language</Label>
                        <Input
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="e.g., English, Spanish, French"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newLanguage.trim()) {
                              handleInputChange('languages', [...formData.languages, newLanguage.trim()]);
                              setNewLanguage('');
                              setNewLanguageProficiency('');
                            }
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Proficiency Level</Label>
                        <select
                          value={newLanguageProficiency}
                          onChange={(e) => setNewLanguageProficiency(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        >
                          <option value="">Select Proficiency</option>
                          <option>Native</option>
                          <option>Fluent</option>
                          <option>Intermediate</option>
                          <option>Basic</option>
                        </select>
                      </div>
                      <Button
                        onClick={() => {
                          if (newLanguage.trim()) {
                            const langDisplay = newLanguageProficiency
                              ? `${newLanguage.trim()} (${newLanguageProficiency})`
                              : newLanguage.trim();
                            handleInputChange('languages', [...formData.languages, langDisplay]);
                            setNewLanguage('');
                            setNewLanguageProficiency('');
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Language
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="visibility" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Profile Visibility & Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-900">Make profile public to employers</label>
                  <Switch
                    checked={formData.profileVisibility}
                    onCheckedChange={(checked) => handleInputChange("profileVisibility", checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-900">Open to work opportunities</label>
                  <Switch
                    checked={formData.openToWork}
                    onCheckedChange={(checked) => handleInputChange("openToWork", checked)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-900">Show in search results</label>
                  <Switch
                    checked={formData.showInSearch}
                    onCheckedChange={(checked) => handleInputChange("showInSearch", checked)}
                    disabled={!isEditing}
                  />
                </div>

                {isEditing && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Preferred Work Types</Label>
                    <div className="space-y-2">
                      {["Remote", "Hybrid", "On-site"].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.preferredWorkTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange("preferredWorkTypes", [
                                  ...formData.preferredWorkTypes,
                                  type,
                                ]);
                              } else {
                                handleInputChange(
                                  "preferredWorkTypes",
                                  formData.preferredWorkTypes.filter((t: any) => t !== type)
                                );
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-gray-200 flex justify-end gap-3 z-50 md:sticky md:bottom-4 md:bg-transparent md:border-none md:p-0">
          <Button variant="outline" onClick={() => setIsEditing(false)} className="shadow-lg bg-white">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white shadow-lg">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
}
