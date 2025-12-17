"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  DollarSign,
  TrendingUp,
  FileText,
  Globe,
} from "lucide-react";

interface Tool {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

const tools: Tool[] = [
  {
    id: "interview",
    label: "Interview Prep",
    icon: <MessageCircle className="h-6 w-6" />,
    href: "/tools/interview-prep",
    description: "Practice with AI-powered mock interviews",
  },
  {
    id: "salary",
    label: "Salary Explorer",
    icon: <DollarSign className="h-6 w-6" />,
    href: "/tools/salary-explorer",
    description: "Compare salaries for your role and location",
  },
  {
    id: "skills",
    label: "Skill Analyzer",
    icon: <TrendingUp className="h-6 w-6" />,
    href: "/tools/skill-analyzer",
    description: "Identify in-demand skills for your role",
  },
  {
    id: "cover",
    label: "Cover Letter Builder",
    icon: <FileText className="h-6 w-6" />,
    href: "/tools/cover-letter",
    description: "Generate tailored cover letters",
  },
  {
    id: "visa",
    label: "Visa Support Checker",
    icon: <Globe className="h-6 w-6" />,
    href: "/tools/visa-support",
    description: "Check visa sponsorship eligibility",
  },
];

export function ToolsAccess() {
  return (
    <Card className="p-6 mb-6 bg-white border-0 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Tools & Resources</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <a
            key={tool.id}
            href={tool.href}
            className="block group"
          >
            <div className="h-full border border-gray-200 rounded-lg p-4 hover:border-amber-600 hover:bg-amber-50 transition-all duration-200 cursor-pointer">
              <div className="text-amber-600 mb-2 group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {tool.label}
              </h4>
              <p className="text-xs text-gray-600">{tool.description}</p>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}
