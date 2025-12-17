"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText,
  Download,
  Trash2,
  Edit3,
  Eye,
  Plus,
  Upload,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Share2,
  Lock,
  MoreVertical,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface Resume {
  id: string;
  filename: string;
  version: string;
  date: string;
  atsScore: number;
  parsed: boolean;
  tags: string[];
  isDefault: boolean;
  applicationCount: number;
  lastUsed?: string;
}

interface ResumeListProps {
  resumes: Resume[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDownload?: (id: string) => void;
  onPreview?: (id: string) => void;
  onCreateNew?: () => void;
  onOptimize?: (id: string) => void;
}

export function ResumeListView({
  resumes,
  onEdit,
  onDelete,
  onDownload,
  onPreview,
  onCreateNew,
  onOptimize,
}: ResumeListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);

  const getATSColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (parsed: boolean) => {
    return parsed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="space-y-6">
      {/* Create New Resume CTA */}
      <Card className="p-8 bg-linear-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create a New Resume</h3>
            <p className="text-sm text-gray-600">Build, upload, or import a resume for different job roles</p>
          </div>
          <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Resume
          </Button>
        </div>
      </Card>

      {/* Resume Creation Options */}
      {resumes.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resumes Yet</h3>
            <p className="text-gray-600 mb-6">Start by creating your first resume</p>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex-col py-4">
                <Sparkles className="h-6 w-6 mb-2 text-amber-600" />
                <span className="font-semibold">AI Builder</span>
                <span className="text-xs text-gray-500">Auto-generate</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <Upload className="h-6 w-6 mb-2 text-blue-600" />
                <span className="font-semibold">Upload PDF</span>
                <span className="text-xs text-gray-500">Import existing</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <Share2 className="h-6 w-6 mb-2 text-green-600" />
                <span className="font-semibold">LinkedIn</span>
                <span className="text-xs text-gray-500">Import profile</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col py-4">
                <FileText className="h-6 w-6 mb-2 text-purple-600" />
                <span className="font-semibold">Template</span>
                <span className="text-xs text-gray-500">From template</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Resume Cards Grid */}
          <div className="grid gap-4">
            {resumes.map((resume) => (
              <Card key={resume.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <h3 className="font-semibold text-gray-900">{resume.filename}</h3>
                        {resume.isDefault && (
                          <Badge className="bg-amber-100 text-amber-700">Default</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        Updated {resume.date} • {resume.version}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === resume.id ? null : resume.id)}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Status and Score Row */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {/* ATS Score */}
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-600">ATS Score:</span>
                      <span className={`font-bold ${getATSColor(resume.atsScore)}`}>
                        {resume.atsScore}%
                      </span>
                    </div>

                    {/* Parse Status */}
                    <div className="flex items-center gap-2">
                      {resume.parsed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <Badge className={getStatusColor(resume.parsed)}>
                        {resume.parsed ? "Parsed" : "Not Parsed"}
                      </Badge>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2">
                      {resume.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Applications Badge */}
                    {resume.applicationCount > 0 && (
                      <Badge className="bg-blue-100 text-blue-700">
                        <Star className="h-3 w-3 mr-1" />
                        {resume.applicationCount} applications
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(resume.id)}
                      className="text-xs"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPreview?.(resume.id)}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownload?.(resume.id)}
                      className="text-xs"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedResume(resume);
                        setShowOptimizeDialog(true);
                      }}
                      className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Optimize
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete?.(resume.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === resume.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Last Used</p>
                          <p className="font-medium">{resume.lastUsed || "Never"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Applications</p>
                          <p className="font-medium">{resume.applicationCount}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Resume Warnings */}
      <Card className="p-4 bg-red-50 border border-red-200">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 text-sm mb-1">Resume Quality Issues</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Resume is too long (4+ pages) - Consider condensing to 1-2 pages</li>
              <li>• Missing quantifiable metrics in work experience</li>
              <li>• Generic summary - Add specific skills and achievements</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Optimize Dialog */}
      <Dialog open={showOptimizeDialog} onOpenChange={setShowOptimizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Optimize Resume for Job</DialogTitle>
            <DialogDescription>
              Paste a job description to get AI-powered suggestions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Job Description</label>
              <textarea
                placeholder="Paste the job description here..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm resize-none"
                rows={6}
              />
            </div>
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
              <p className="font-medium mb-1">AI will suggest:</p>
              <ul className="text-xs space-y-1">
                <li>• Keywords to add from job description</li>
                <li>• Sections to emphasize</li>
                <li>• Missing skills to highlight</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptimizeDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze & Get Suggestions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
