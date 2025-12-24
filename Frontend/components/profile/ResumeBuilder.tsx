"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  ArrowLeft,
  Sparkles,
  Copy,
  Download,
} from "lucide-react";

interface ResumeBuilderProps {
  resumeId?: string;
  onSave?: (data: any) => void;
  onBack?: () => void;
  defaultShowPreview?: boolean;
}

export function ResumeBuilder({ resumeId, onSave, onBack, defaultShowPreview }: ResumeBuilderProps) {
  const [resumeData, setResumeData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    summary: "",
    experience: [],
    education: [],
    skills: [
      { id: "1", category: "Technical", items: [] },
      { id: "2", category: "Soft Skills", items: [] },
    ],
    certifications: [],
    languages: [],
    projects: [],
  });

  const [showPreview, setShowPreview] = useState(defaultShowPreview || false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user data and resume data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (resumeId && resumeId !== "new-resume") {
        await loadResumeData();
      } else {
        await fetchUserData();
      }
    };
    loadData();
  }, [resumeId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      // Fetch user profile data
      const profileResponse = await fetch('/api/v1/user-profiles/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const profile = profileData.data;
        
        // Fetch user basic info
        const userResponse = await fetch('/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const user = userData.data;
          
          // Populate resume data with user information
          setResumeData({
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
            email: user.email || '',
            phone: user.phone || profile.phone || '',
            location: profile.city && profile.province ? `${profile.city}, ${profile.province}` : (profile.city || profile.province || ''),
            linkedin: profile.linkedin || '',
            github: profile.github || '',
            summary: profile.summary || profile.bio || '',
            experience: profile.experience?.map((exp, index) => ({
              id: (index + 1).toString(),
              company: exp.company || '',
              role: exp.position || exp.role || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || exp.current ? 'Present' : '',
              location: exp.location || '',
              description: exp.description || exp.responsibilities?.join('\n') || '',
            })) || [],
            education: profile.education?.map((edu, index) => ({
              id: (index + 1).toString(),
              school: edu.institution || edu.school || '',
              degree: edu.degree || '',
              field: edu.fieldOfStudy || edu.field || '',
              graduationDate: edu.graduationYear || edu.endDate || '',
              gpa: edu.gpa || '',
            })) || [],
            skills: [
              { 
                id: "1", 
                category: "Technical", 
                items: profile.skills?.filter(skill => skill.category === 'technical' || skill.type === 'technical')?.map(s => s.name || s.skill) || []
              },
              { 
                id: "2", 
                category: "Soft Skills", 
                items: profile.skills?.filter(skill => skill.category === 'soft' || skill.type === 'soft')?.map(s => s.name || s.skill) || []
              },
            ],
            certifications: profile.certifications?.map((cert, index) => ({
              id: (index + 1).toString(),
              title: cert.name || cert.title || '',
              issuer: cert.issuer || cert.organization || '',
              date: cert.year || cert.date || '',
            })) || [],
            languages: profile.languages?.map((lang, index) => ({
              id: (index + 1).toString(),
              language: lang.name || lang.language || '',
              proficiency: lang.proficiency || 'Intermediate',
            })) || [],
            projects: profile.projects?.map((project, index) => ({
              id: (index + 1).toString(),
              name: project.name || project.title || '',
              technologies: project.technologies?.join(', ') || project.tech || '',
              demoUrl: project.demoUrl || project.liveUrl || '',
              githubUrl: project.githubUrl || project.repoUrl || '',
              description: project.description || '',
            })) || [],
          });
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Don't show error - allow resume builder to work without pre-filled data
      setIsLoading(false);
    }
  };

  const loadResumeData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/v1/resumes/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const resume = data.data;
        
        // Load existing resume data
        if (resume.parsedData) {
          setResumeData({
            name: resume.parsedData.name || '',
            email: resume.parsedData.email || '',
            phone: resume.parsedData.phone || '',
            location: resume.parsedData.location || '',
            linkedin: resume.parsedData.linkedin || '',
            github: resume.parsedData.github || '',
            summary: resume.parsedData.summary || '',
            experience: resume.parsedData.experience?.map((exp, idx) => ({
              id: idx.toString(),
              company: exp.company || '',
              role: exp.role || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              location: exp.location || '',
              description: exp.description || '',
            })) || [],
            education: resume.parsedData.education?.map((edu, idx) => ({
              id: idx.toString(),
              school: edu.school || '',
              degree: edu.degree || '',
              field: edu.field || '',
              graduationDate: edu.graduationDate || '',
              gpa: edu.gpa || '',
            })) || [],
            skills: resume.parsedData.skills ? 
              // Handle array of skill groups with categories (new format - recommended)
              Array.isArray(resume.parsedData.skills) && resume.parsedData.skills.length > 0 && resume.parsedData.skills[0]?.category ?
                resume.parsedData.skills.map((skillGroup, idx) => ({
                  id: (idx + 1).toString(),
                  category: skillGroup.category || 'Other',
                  items: Array.isArray(skillGroup.items) ? skillGroup.items : []
                })) :
                // Handle flat array of skills (old format) - try to categorize
                Array.isArray(resume.parsedData.skills) ? [
                  {
                    id: "1",
                    category: "Technical",
                    items: resume.parsedData.skills.filter(s => 
                      (typeof s === 'object' && (s.category === 'technical' || s.category === 'Technical' || s.type === 'technical')) ||
                      (typeof s === 'string' && /^(javascript|react|nodejs?|python|java|sql|database|typescript|css|html|mongodb|postgresql|mysql|git|docker|aws|api|backend|frontend|framework|library)$/i.test(s))
                    )?.map(s => typeof s === 'object' ? (s.name || s.skill || s) : s) || [],
                  },
                  {
                    id: "2",
                    category: "Soft Skills",
                    items: resume.parsedData.skills.filter(s => 
                      (typeof s === 'object' && (s.category === 'soft' || s.category === 'Soft Skills' || s.type === 'soft')) ||
                      (typeof s === 'string' && /^(communication|leadership|teamwork|problem.solving|time.management|analytical|adaptability|presentation|writing|collaboration|management|planning|organization)$/i.test(s))
                    )?.map(s => typeof s === 'object' ? (s.name || s.skill || s) : s) || [],
                  },
                ] : [
                  { id: "1", category: "Technical", items: [] },
                  { id: "2", category: "Soft Skills", items: [] },
                ]
              : [
                { id: "1", category: "Technical", items: [] },
                { id: "2", category: "Soft Skills", items: [] },
              ],
            certifications: resume.parsedData.certifications?.map((cert, idx) => ({
              id: idx.toString(),
              title: cert.title || '',
              issuer: cert.issuer || '',
              date: cert.date || '',
            })) || [],
            languages: resume.parsedData.languages?.map((lang, idx) => ({
              id: idx.toString(),
              language: lang.language || '',
              proficiency: lang.proficiency || 'Intermediate',
            })) || [],
            projects: resume.parsedData.projects?.map((proj, idx) => ({
              id: idx.toString(),
              name: proj.name || '',
              technologies: proj.technologies || '',
              demoUrl: proj.demoUrl || '',
              githubUrl: proj.githubUrl || '',
              description: proj.description || '',
            })) || [],
          });
        }
      } else {
        // Resume not found, try to load user data as fallback
        await fetchUserData();
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      // Fallback to user data
      await fetchUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Prepare the data with proper skills structure - keep all categories
      const dataToSave = {
        ...resumeData,
        skills: resumeData.skills.map(skillGroup => ({
          category: skillGroup.category,
          items: skillGroup.items.filter(item => item && item.trim && item.trim().length > 0)
        }))
      };

      console.log('Data being prepared for save:', JSON.stringify(dataToSave, null, 2));

      // Call the onSave prop for handling the actual save
      onSave?.(dataToSave);
    } catch (error) {
      console.error('Error preparing resume data:', error);
      alert('Failed to prepare resume data. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/cv/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${resumeData.name || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Helper functions for managing resume data
  const addExperience = () => {
    const newExp = {
      id: (resumeData.experience.length + 1).toString(),
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      location: "",
      description: "",
    };
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExp]
    });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...resumeData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setResumeData({ ...resumeData, experience: updated });
  };

  const addEducation = () => {
    const newEdu = {
      id: (resumeData.education.length + 1).toString(),
      school: "",
      degree: "",
      field: "",
      graduationDate: "",
      gpa: "",
    };
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEdu]
    });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    });
  };

  const addCertification = () => {
    const newCert = {
      id: (resumeData.certifications.length + 1).toString(),
      title: "",
      issuer: "",
      date: "",
    };
    setResumeData({
      ...resumeData,
      certifications: [...resumeData.certifications, newCert]
    });
  };

  const addLanguage = () => {
    const newLang = {
      id: (resumeData.languages.length + 1).toString(),
      language: "",
      proficiency: "Intermediate",
    };
    setResumeData({
      ...resumeData,
      languages: [...resumeData.languages, newLang]
    });
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchUserData}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-sm text-gray-600">Edit your resume content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="gap-2"
          >
            {isGeneratingPDF ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
          <Button 
            onClick={handleSave} 
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Save Resume
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="header" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6">
              <TabsTrigger value="header" className="text-xs">Header</TabsTrigger>
              <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
              <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
              <TabsTrigger value="education" className="text-xs">Education</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
              <TabsTrigger value="extra" className="text-xs">More</TabsTrigger>
            </TabsList>

            {/* Header Tab */}
            <TabsContent value="header" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={resumeData.name}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={resumeData.email}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={resumeData.phone}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={resumeData.location}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>LinkedIn</Label>
                      <Input
                        value={resumeData.linkedin}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, linkedin: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>GitHub</Label>
                      <Input
                        value={resumeData.github}
                        onChange={(e) =>
                          setResumeData({ ...resumeData, github: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Professional Summary</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAISuggestions(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI Rewrite
                  </Button>
                </div>
                <Textarea
                  value={resumeData.summary}
                  onChange={(e) =>
                    setResumeData({ ...resumeData, summary: e.target.value })
                  }
                  rows={6}
                  placeholder="Write a compelling professional summary..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  2-3 sentences highlighting your key strengths
                </p>
              </Card>
            </TabsContent>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Work Experience</h3>
                  <Button size="sm" variant="outline" onClick={addExperience}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Button>
                </div>

                {resumeData.experience.length > 0 ? (
                  resumeData.experience.map((exp, idx) => (
                    <div key={exp.id} className="mb-4 pb-4 border-b">
                      <div className="flex gap-3 mb-3">
                        <GripVertical className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <Input 
                              value={exp.company} 
                              onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                              placeholder="Company" 
                            />
                            <Input 
                              value={exp.role} 
                              onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                              placeholder="Job Title" 
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <Input 
                              type="month" 
                              value={exp.startDate} 
                              onChange={(e) => updateExperience(idx, 'startDate', e.target.value)}
                              placeholder="Start Date" 
                            />
                            <Input 
                              type="month" 
                              value={exp.endDate === 'Present' ? '' : exp.endDate} 
                              onChange={(e) => updateExperience(idx, 'endDate', e.target.value)}
                              placeholder="End Date" 
                            />
                            <Input 
                              value={exp.location || ''} 
                              onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                              placeholder="Location" 
                            />
                          </div>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                            placeholder="• Describe your achievements and responsibilities\n• Use bullet points and quantify results\n• Focus on impact and results"
                            rows={4}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 h-8 w-8 p-0"
                          onClick={() => removeExperience(exp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No work experience added yet.</p>
                    <Button size="sm" variant="outline" onClick={addExperience} className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Your First Job
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <Button size="sm" variant="outline" onClick={addEducation}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Education
                  </Button>
                </div>

                {resumeData.education.length > 0 ? (
                  resumeData.education.map((edu, idx) => (
                    <div key={edu.id} className="mb-4 pb-4 border-b last:border-b-0">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <Input
                              value={edu.school}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[idx] = { ...updated[idx], school: e.target.value };
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="School/University"
                            />
                            <Input
                              value={edu.degree}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[idx] = { ...updated[idx], degree: e.target.value };
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="Degree"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              value={edu.field}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[idx] = { ...updated[idx], field: e.target.value };
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="Field of Study"
                            />
                            <Input
                              type="number"
                              value={edu.graduationDate}
                              onChange={(e) => {
                                const updated = [...resumeData.education];
                                updated[idx] = { ...updated[idx], graduationDate: e.target.value };
                                setResumeData({ ...resumeData, education: updated });
                              }}
                              placeholder="Graduation Year"
                            />
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 h-8 w-8 p-0"
                          onClick={() => removeEducation(edu.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No education added yet.</p>
                    <Button size="sm" variant="outline" onClick={addEducation} className="mt-2">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Education
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Skills</h3>
                {resumeData.skills.map((skillGroup, idx) => (
                  <div key={skillGroup.id} className="mb-4">
                    <Label className="font-semibold mb-2 block">{skillGroup.category}</Label>
                    <Textarea
                      value={skillGroup.items.join(", ")}
                      onChange={(e) => {
                        const updated = [...resumeData.skills];
                        updated[idx] = {
                          ...updated[idx],
                          items: e.target.value.split(",").map((s) => s.trim()).filter(s => s.length > 0),
                        };
                        setResumeData({ ...resumeData, skills: updated });
                      }}
                      placeholder={`Enter ${skillGroup.category.toLowerCase()} skills separated by commas`}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {skillGroup.items.length} skills • Separate with commas
                    </p>
                  </div>
                ))}
              </Card>
            </TabsContent>

            {/* Extra Tab */}
            <TabsContent value="extra" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Certifications & Languages</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Certifications</h4>
                    {resumeData.certifications.map((cert, idx) => (
                      <div key={cert.id} className="mb-3 p-3 bg-gray-50 rounded">
                        <Input
                          value={cert.title}
                          onChange={(e) => {
                            const updated = [...resumeData.certifications];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setResumeData({ ...resumeData, certifications: updated });
                          }}
                          placeholder="Certification Title"
                          className="mb-2"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={cert.issuer}
                            onChange={(e) => {
                              const updated = [...resumeData.certifications];
                              updated[idx] = { ...updated[idx], issuer: e.target.value };
                              setResumeData({ ...resumeData, certifications: updated });
                            }}
                            placeholder="Issuer"
                          />
                          <Input
                            type="number"
                            value={cert.date}
                            onChange={(e) => {
                              const updated = [...resumeData.certifications];
                              updated[idx] = { ...updated[idx], date: e.target.value };
                              setResumeData({ ...resumeData, certifications: updated });
                            }}
                            placeholder="Year"
                          />
                        </div>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" className="w-full" onClick={addCertification}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Certification
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Languages</h4>
                    {resumeData.languages.map((lang, idx) => (
                      <div key={lang.id} className="mb-3 grid grid-cols-2 gap-2">
                        <Input
                          value={lang.language}
                          onChange={(e) => {
                            const updated = [...resumeData.languages];
                            updated[idx] = { ...updated[idx], language: e.target.value };
                            setResumeData({ ...resumeData, languages: updated });
                          }}
                          placeholder="Language"
                        />
                        <select
                          value={lang.proficiency}
                          onChange={(e) => {
                            const updated = [...resumeData.languages];
                            updated[idx] = { ...updated[idx], proficiency: e.target.value };
                            setResumeData({ ...resumeData, languages: updated });
                          }}
                          className="border border-gray-300 rounded px-3 py-2 text-sm"
                        >
                          <option>Native</option>
                          <option>Fluent</option>
                          <option>Intermediate</option>
                          <option>Basic</option>
                        </select>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" className="w-full" onClick={addLanguage}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Language
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border border-gray-200 shadow-lg">
              <div className="bg-white p-6 text-gray-800 font-sans text-sm leading-relaxed" style={{minHeight: '800px'}}>
                {/* Modern Header */}
                <div className="text-center pb-6 mb-6 border-b-2 border-blue-600">
                  <h1 className="text-3xl font-bold mb-2 text-gray-900 tracking-tight">{resumeData.name || "Your Name"}</h1>
                  <p className="text-lg text-blue-600 font-medium mb-3">Professional</p>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex flex-wrap justify-center gap-3">
                      {resumeData.email && <span>{resumeData.email}</span>}
                      {resumeData.phone && <span>|</span>}
                      {resumeData.phone && <span>{resumeData.phone}</span>}
                      {resumeData.location && <span>|</span>}
                      {resumeData.location && <span>{resumeData.location}</span>}
                    </div>
                    {(resumeData.linkedin || resumeData.github) && (
                      <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {resumeData.linkedin && <span>LinkedIn: {resumeData.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                        {resumeData.github && resumeData.linkedin && <span>|</span>}
                        {resumeData.github && <span>GitHub: {resumeData.github.replace(/^https?:\/\/(www\.)?/, '')}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                {resumeData.summary && (
                  <div className="mb-6">
                    <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Summary</h2>
                    <p className="text-sm leading-relaxed text-gray-700 text-justify">{resumeData.summary}</p>
                  </div>
                )}

                {/* Core Competencies (All Skills Combined) */}
                {resumeData.skills.some(group => group.items && group.items.length > 0) && (
                  <div className="mb-6">
                    <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Core Competencies</h2>
                    <p className="text-sm leading-relaxed text-gray-700">
                      {resumeData.skills
                        .filter(group => group.items && group.items.length > 0)
                        .flatMap(group => group.items)
                        .join(', ')}
                    </p>
                  </div>
                )}

                {/* Technical Skills (Detailed) */}
                {resumeData.skills.filter(group => group.category === 'Technical' && group.items && group.items.length > 0).length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Technical Skills</h2>
                    {resumeData.skills.filter(group => group.category === 'Technical').map((skillGroup) => (
                      skillGroup.items && skillGroup.items.length > 0 && (
                        <div key={skillGroup.id}>
                          <p className="text-sm leading-relaxed text-gray-700">
                            <span className="font-medium">Languages: </span>
                            {skillGroup.items.join(', ')}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {resumeData.certifications.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Certifications</h2>
                    <div className="space-y-1">
                      {resumeData.certifications.map((cert) => (
                        <div key={cert.id} className="flex items-start">
                          <span className="mr-2 text-gray-600 font-bold">ˆ</span>
                          <p className="text-sm text-gray-700">
                            <span className="font-bold">{cert.title || 'Certification Title'}</span>
                            {cert.issuer && <span> {cert.issuer}</span>}
                            {cert.date && <span> ({cert.date})</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {resumeData.languages.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Languages</h2>
                    <div className="flex flex-wrap gap-4">
                      {resumeData.languages.map((lang) => (
                        <span key={lang.id} className="text-sm text-gray-700">
                          <span className="font-bold">{lang.language || 'Language'}</span>
                          <span> ({lang.proficiency})</span>
                          <span className="ml-2">ˆ</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {resumeData.projects?.length > 0 && (
                  <div>
                    <h2 className="text-base font-bold text-gray-900 mb-3 uppercase tracking-wide">Projects</h2>
                    {resumeData.projects.map((proj) => (
                      <div key={proj.id} className="mb-4">
                        <h3 className="font-bold text-gray-900 mb-1">{proj.name || 'Project Name'}</h3>
                        {proj.technologies && (
                          <p className="text-sm text-gray-600 mb-1 font-medium">Technologies: {proj.technologies}</p>
                        )}
                        {proj.description && (
                          <p className="text-sm text-gray-700 leading-relaxed mb-1">{proj.description}</p>
                        )}
                        {(proj.demoUrl || proj.githubUrl) && (
                          <div className="text-xs text-blue-600">
                            {proj.demoUrl && <span>Demo: {proj.demoUrl}</span>}
                            {proj.demoUrl && proj.githubUrl && <span> | </span>}
                            {proj.githubUrl && <span>GitHub: {proj.githubUrl}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
