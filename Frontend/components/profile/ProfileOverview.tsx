"use client";
import { useState } from "react";
import axios from "axios"; // Import axios for API calls
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
  const [profileCompletion, setProfileCompletion] = useState(68);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillTitle, setNewSkillTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newLanguageProficiency, setNewLanguageProficiency] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: "1995-03-15",
    gender: "Male",
    nationality: "Canadian",
    city: "Toronto",
    province: "Ontario",
    postalCode: "M5V 3A8",
    headline: "Frontend Developer | React & Next.js Specialist",
    careerObjective: "Seeking a challenging role as a Senior Frontend Developer to lead modern web applications",
    currentJobTitle: "Frontend Developer",
    company: "Tech Corp",
    yearsOfExperience: "5",
    industry: "Information Technology",
    employmentType: ["Full-time"],
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    languages: ["English (Native)", "Spanish (Basic)"],
    education: [
      {
        degree: "Bachelor's Degree",
        fieldOfStudy: "Computer Science",
        institution: "University of Toronto",
        graduationYear: "2020",
      },
    ],
    profileVisibility: true,
    openToWork: true,
    showInSearch: true,
    preferredWorkTypes: ["Remote", "Hybrid"],
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const token = localStorage.getItem("token"); // Retrieve token from local storage

  const handleSave = async () => {
    try {
      // Transform formData to match backend schema
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
        // Update formData with saved data
        setFormData({
          firstName: savedData.firstName || '',
          lastName: savedData.lastName || '',
          email: savedData.email || '',
          phone: savedData.phone || '',
          dateOfBirth: formData.dateOfBirth, // Keep local if not in response
          gender: formData.gender,
          nationality: formData.nationality,
          city: savedData.location?.split(', ')[0] || '',
          province: savedData.location?.split(', ')[1] || '',
          postalCode: savedData.location?.split(', ')[2] || '',
          headline: savedData.headline || '',
          careerObjective: savedData.bio || '',
          currentJobTitle: savedData.jobSeekerProfile?.currentJobTitle || formData.currentJobTitle,
          company: savedData.jobSeekerProfile?.company || formData.company,
          yearsOfExperience: savedData.jobSeekerProfile?.yearsOfExperience || formData.yearsOfExperience,
          industry: savedData.jobSeekerProfile?.preferredIndustries?.[0] || formData.industry,
          employmentType: savedData.jobSeekerProfile?.preferredEmploymentTypes || formData.employmentType,
          skills: savedData.jobSeekerProfile?.skills || formData.skills,
          languages: savedData.jobSeekerProfile?.languages || formData.languages,
          education: savedData.education || formData.education,
          profileVisibility: savedData.privacy?.profileVisibility === 'public' || formData.profileVisibility,
          openToWork: savedData.privacy?.allowMessages ?? formData.openToWork,
          showInSearch: savedData.privacy?.showEmail ?? formData.showInSearch,
          preferredWorkTypes: (savedData.jobSeekerProfile?.preferredWorkTypes && savedData.jobSeekerProfile.preferredWorkTypes.length > 0) 
            ? savedData.jobSeekerProfile.preferredWorkTypes 
            : (savedData.jobSeekerProfile?.openToRemote ? ['Remote'] : formData.preferredWorkTypes),
        });
        onProfileUpdate?.(savedData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Tracker */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-purple-50 border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Profile Completion</h3>
          <Badge className="bg-amber-600 text-white">{profileCompletion}%</Badge>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-amber-500 to-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${profileCompletion}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Complete these sections to improve your profile visibility and job matches
        </p>
      </Card>

      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "default" : "outline"}
          className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="personal" className="text-xs sm:text-sm">
            <User className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="career" className="text-xs sm:text-sm">
            <Briefcase className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Career</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="text-xs sm:text-sm">
            <GraduationCap className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs sm:text-sm">
            <Code className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="visibility" className="text-xs sm:text-sm">
            <Eye className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Visibility</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </h3>

            {isEditing ? (
              <div className="space-y-4">
                {/* Profile Picture */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-amber-600">
                      <AvatarImage src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.email}`} alt={user?.name || user?.email} />
                      <AvatarFallback>
                        <User className="h-10 w-10 text-amber-700" />
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Upload New Photo
                    </Button>
                  </div>
                </div>

                {/* First & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input type="email" value={formData.email} disabled className="bg-gray-50" />
                    <p className="text-xs text-green-600 mt-1">✓ Verified</p>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (XXX) XXX-XXXX"
                    />
                  </div>
                </div>

                {/* DOB, Gender, Nationality */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer Not to Say</option>
                    </select>
                  </div>
                  <div>
                    <Label>Nationality</Label>
                    <Input
                      value={formData.nationality}
                      onChange={(e) => handleInputChange("nationality", e.target.value)}
                      placeholder="e.g., Canadian"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Toronto"
                      />
                    </div>
                    <div>
                      <Label>Province</Label>
                      <Input
                        value={formData.province}
                        onChange={(e) => handleInputChange("province", e.target.value)}
                        placeholder="Ontario"
                      />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        placeholder="M5V 3A8"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-semibold">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="font-semibold flex items-center gap-2">
                      {formData.email}
                      <Check className="h-4 w-4 text-green-600" />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone</p>
                    <p className="font-semibold">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="font-semibold">{formData.city}, {formData.province}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Career Information Tab */}
        <TabsContent value="career" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Career Information
            </h3>

            {isEditing ? (
              <div className="space-y-4">
                {/* Professional Headline */}
                <div>
                  <Label>Professional Headline</Label>
                  <Input
                    value={formData.headline}
                    onChange={(e) => handleInputChange("headline", e.target.value)}
                    placeholder="e.g., Frontend Developer | React & Next.js Specialist"
                  />
                  <p className="text-xs text-gray-500 mt-1">Shown on your resume and profile</p>
                </div>

                {/* Career Objective */}
                <div>
                  <Label>Career Objective</Label>
                  <Textarea
                    value={formData.careerObjective}
                    onChange={(e) => handleInputChange("careerObjective", e.target.value)}
                    placeholder="What are your career goals?"
                    rows={4}
                  />
                </div>

                {/* Employment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Job Title</Label>
                    <Input
                      value={formData.currentJobTitle}
                      onChange={(e) => handleInputChange("currentJobTitle", e.target.value)}
                      placeholder="Frontend Developer"
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <Label>Industry</Label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange("industry", e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option>Information Technology</option>
                      <option>Finance</option>
                      <option>Healthcare</option>
                      <option>Education</option>
                      <option>Retail</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Professional Headline</p>
                  <p className="font-semibold text-amber-700">{formData.headline}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Position</p>
                  <p className="font-semibold">{formData.currentJobTitle} at {formData.company}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Experience</p>
                  <p className="font-semibold">{formData.yearsOfExperience} years</p>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </h3>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newEducation = [
                      ...formData.education,
                      { degree: '', fieldOfStudy: '', institution: '', graduationYear: '' },
                    ];
                    handleInputChange('education', newEducation);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Education #{idx + 1}</h4>
                      {formData.education.length > 1 && (
                        <button
                          onClick={() => {
                            const newEducation = formData.education.filter((_, i) => i !== idx);
                            handleInputChange('education', newEducation);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Degree</Label>
                        <select
                          value={edu.degree}
                          onChange={(e) => {
                            const newEducation = formData.education.map((item, i) =>
                              i === idx ? { ...item, degree: e.target.value } : item
                            );
                            handleInputChange('education', newEducation);
                          }}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        >
                          <option value="">Select Degree</option>
                          <option>Bachelor's Degree</option>
                          <option>Master's Degree</option>
                          <option>PhD</option>
                          <option>Diploma</option>
                          <option>Certificate</option>
                        </select>
                      </div>
                      <div>
                        <Label>Field of Study</Label>
                        <Input
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const newEducation = formData.education.map((item, i) =>
                              i === idx ? { ...item, fieldOfStudy: e.target.value } : item
                            );
                            handleInputChange('education', newEducation);
                          }}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => {
                            const newEducation = formData.education.map((item, i) =>
                              i === idx ? { ...item, institution: e.target.value } : item
                            );
                            handleInputChange('education', newEducation);
                          }}
                          placeholder="University Name"
                        />
                      </div>
                      <div>
                        <Label>Graduation Year</Label>
                        <Input
                          type="number"
                          value={edu.graduationYear}
                          onChange={(e) => {
                            const newEducation = formData.education.map((item, i) =>
                              i === idx ? { ...item, graduationYear: e.target.value } : item
                            );
                            handleInputChange('education', newEducation);
                          }}
                          placeholder="2020"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500 mb-1">Education #{idx + 1}</p>
                    <p className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-sm text-gray-700">{edu.institution} ({edu.graduationYear})</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
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
                    {formData.skills.map((skill) => (
                      <Badge key={skill} className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((lang) => (
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
                    {formData.skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <div className="flex-1">
                          <span className="text-sm font-medium block">{skill}</span>
                        </div>
                        <button
                          onClick={() => {
                            const newSkills = formData.skills.filter((_, i) => i !== idx);
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
                    {formData.languages.map((lang, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div className="flex-1">
                          <span className="text-sm font-medium block">{lang}</span>
                        </div>
                        <button
                          onClick={() => {
                            const newLanguages = formData.languages.filter((_, i) => i !== idx);
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

        {/* Visibility & Preferences Tab */}
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
                                formData.preferredWorkTypes.filter((t) => t !== type)
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
      </Tabs>

      {/* Save/Cancel Buttons */}
      {isEditing && (
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
}
