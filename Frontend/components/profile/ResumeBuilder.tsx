"use client";
import { useState } from "react";
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
} from "lucide-react";

interface ResumeBuilderProps {
  resumeId?: string;
  onSave?: (data: any) => void;
  onBack?: () => void;
}

export function ResumeBuilder({ resumeId, onSave, onBack }: ResumeBuilderProps) {
  const [resumeData, setResumeData] = useState({
    name: "Arun Kumar",
    email: "arun@example.com",
    phone: "+1 (234) 567-8901",
    location: "Toronto, ON",
    linkedin: "linkedin.com/in/arunKumar",
    github: "github.com/arunKumar",
    summary:
      "Frontend developer with 5+ years of experience building scalable web applications using React and Next.js.",
    experience: [
      {
        id: "1",
        company: "Tech Corp",
        role: "Senior Frontend Developer",
        startDate: "2022-01",
        endDate: "Present",
        description:
          "Led frontend architecture for 3 major products\nIncreased application performance by 40%\nMentored 5 junior developers",
      },
    ],
    education: [
      {
        id: "1",
        school: "University of Toronto",
        degree: "Bachelor of Science",
        field: "Computer Science",
        graduationDate: "2018",
      },
    ],
    skills: [
      { id: "1", category: "Technical", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
      { id: "2", category: "Soft", items: ["Leadership", "Communication", "Problem Solving"] },
    ],
    certifications: [
      {
        id: "1",
        title: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023",
      },
    ],
    languages: [
      { id: "1", language: "English", proficiency: "Native" },
      { id: "2", language: "Spanish", proficiency: "Basic" },
    ],
  });

  const [showPreview, setShowPreview] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const handleSave = () => {
    onSave?.(resumeData);
  };

  return (
    <div className="space-y-6">
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
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Hide" : "Preview"}
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
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
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Experience
                  </Button>
                </div>

                {resumeData.experience.map((exp, idx) => (
                  <div key={exp.id} className="mb-4 pb-4 border-b">
                    <div className="flex gap-3 mb-3">
                      <GripVertical className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <Input value={exp.company} placeholder="Company" />
                          <Input value={exp.role} placeholder="Job Title" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Input type="month" value={exp.startDate} placeholder="Start Date" />
                          <Input type="month" value={exp.endDate} placeholder="End Date" />
                        </div>
                        <Textarea
                          value={exp.description}
                          placeholder="Describe your achievements and responsibilities (use bullet points)"
                          rows={4}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Education
                  </Button>
                </div>

                {resumeData.education.map((edu, idx) => (
                  <div key={edu.id} className="mb-4 pb-4 border-b last:border-b-0">
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
                ))}
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Skills</h3>
                {resumeData.skills.map((skillGroup, idx) => (
                  <div key={skillGroup.id} className="mb-4">
                    <Label className="font-semibold mb-2 block">{skillGroup.category} Skills</Label>
                    <Textarea
                      value={skillGroup.items.join(", ")}
                      onChange={(e) => {
                        const updated = [...resumeData.skills];
                        updated[idx] = {
                          ...updated[idx],
                          items: e.target.value.split(",").map((s) => s.trim()),
                        };
                        setResumeData({ ...resumeData, skills: updated });
                      }}
                      placeholder="Separate skills with commas"
                      rows={2}
                    />
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
                    <Button size="sm" variant="outline" className="w-full">
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
                    <Button size="sm" variant="outline" className="w-full">
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
            <Card className="p-6 bg-gray-50 sticky top-20">
              <h3 className="font-semibold mb-4">PDF Preview</h3>
              <div className="bg-white p-4 rounded text-sm space-y-3 text-gray-900 border border-gray-200">
                <div className="text-center border-b pb-3">
                  <p className="font-bold">{resumeData.name}</p>
                  <p className="text-xs text-gray-600">
                    {resumeData.email} • {resumeData.phone}
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-xs">SUMMARY</p>
                  <p className="text-xs line-clamp-3">{resumeData.summary}</p>
                </div>

                <div>
                  <p className="font-semibold text-xs">EXPERIENCE</p>
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <p className="font-medium">{exp.role}</p>
                      <p className="text-gray-600">{exp.company}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="font-semibold text-xs">EDUCATION</p>
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <p className="font-medium">{edu.degree}</p>
                      <p className="text-gray-600">{edu.school}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
