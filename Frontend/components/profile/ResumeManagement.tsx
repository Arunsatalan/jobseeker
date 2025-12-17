"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2, Edit3, Eye } from "lucide-react";

interface Resume {
  filename: string;
  version: string;
  date: string;
  atsScore: number;
  parsed: boolean;
}

interface ResumeManagementProps {
  resumes: Resume[];
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  onDownload: (index: number) => void;
  onCreateNew: () => void;
}

export function ResumeManagement({
  resumes,
  onDelete,
  onEdit,
  onDownload,
  onCreateNew,
}: ResumeManagementProps) {
  if (resumes.length === 0) {
    return <ProfileBuilderEmpty onCreateNew={onCreateNew} />;
  }

  return (
    <Card className="p-6 mb-6 bg-white border-0 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Resumes</h3>
        <Button onClick={onCreateNew} className="bg-amber-600 hover:bg-amber-700">
          <FileText className="h-4 w-4 mr-2" />
          Create New Resume
        </Button>
      </div>

      <div className="space-y-4">
        {resumes.map((resume, idx) => (
          <div
            key={resume.filename}
            className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 rounded-lg p-4 gap-3 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-gray-600" />
                <p className="font-semibold text-gray-900">{resume.filename}</p>
                <Badge variant="secondary" className="text-xs">
                  {resume.version}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mb-1">Uploaded: {resume.date}</p>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>
                  ATS Score:{" "}
                  <span
                    className={`font-semibold ${
                      resume.atsScore > 80 ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {resume.atsScore}
                  </span>
                </span>
                <span>
                  {resume.parsed ? (
                    <span className="text-green-600">✓ Parsed</span>
                  ) : (
                    <span className="text-yellow-600">⚠ Not Parsed</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(idx)}
                className="text-xs"
              >
                <Edit3 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownload(idx)}
                className="text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(idx)}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProfileBuilderEmpty({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <Card className="p-12 mb-6 bg-gradient-to-br from-amber-50 to-purple-50 border-0 shadow-md">
      <div className="flex flex-col items-center justify-center text-center">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-700 font-semibold mb-4">
          Haven't created a resume yet?
        </p>
        <Button
          onClick={onCreateNew}
          className="mb-3 bg-amber-600 hover:bg-amber-700 text-white"
        >
          👉 Use AI Resume Builder
        </Button>
        <div className="flex gap-2 flex-wrap justify-center mt-2">
          <Button variant="outline" className="text-xs">
            📄 Upload PDF
          </Button>
          <Button variant="outline" className="text-xs">
            🔗 Import from LinkedIn
          </Button>
        </div>
      </div>
    </Card>
  );
}
