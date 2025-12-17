"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, BookmarkCheck, FileText, AlertTriangle } from "lucide-react";

interface CareerProgressProps {
  jobMatchScore: number;
  savedJobs: number;
  applications: number;
  skillGaps: string[];
}

export function CareerProgress({
  jobMatchScore,
  savedJobs,
  applications,
  skillGaps,
}: CareerProgressProps) {
  return (
    <Card className="p-6 mb-6 bg-white border-0 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Career Progress & Recommendations
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Job Match Score */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-green-700 mb-1">Job Match Score</p>
          <p className="text-2xl font-bold text-green-600">{jobMatchScore}%</p>
          <div className="w-full bg-green-200 rounded-full h-1 mt-2"></div>
        </div>

        {/* Saved Jobs */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
          <BookmarkCheck className="h-4 w-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-blue-700 mb-1">Saved Jobs</p>
          <p className="text-2xl font-bold text-blue-600">{savedJobs}</p>
        </div>

        {/* Applications */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
          <FileText className="h-4 w-4 text-purple-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-purple-700 mb-1">Applications</p>
          <p className="text-2xl font-bold text-purple-600">{applications}</p>
        </div>

        {/* Skill Gaps */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 text-center">
          <AlertTriangle className="h-4 w-4 text-amber-600 mx-auto mb-1" />
          <p className="text-xs font-semibold text-amber-700 mb-1">Skill Gaps</p>
          <p className="text-xl font-bold text-amber-600">{skillGaps.length}</p>
        </div>
      </div>

      {/* Skill Gap Alerts */}
      {skillGaps.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Recommended Skills to Learn
          </h4>
          <div className="flex flex-wrap gap-2">
            {skillGaps.map((skill) => (
              <Badge key={skill} variant="outline" className="border-amber-200 text-amber-700">
                {skill}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Adding these skills would improve your job match score by up to 15%
          </p>
        </div>
      )}
    </Card>
  );
}
