"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Users,
  Target,
  BarChart3,
  Filter,
  Upload,
  RefreshCw,
  Star,
} from "lucide-react";

// Mock data for resume analytics
const resumeData = [
  {
    id: "1",
    userId: "user_001",
    userName: "Sarah Johnson",
    userAvatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=02243b&color=fff",
    fileName: "Sarah_Johnson_Resume_v3.pdf",
    uploadDate: "2025-12-16",
    parseStatus: "Success",
    atsScore: 85,
    version: 3,
    fileSize: "245 KB",
    formatScore: 92,
    keywordMatch: 78,
    sectionsComplete: 8,
    totalSections: 10,
    timeSpent: "45 min",
    lastModified: "2025-12-16 14:30",
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "AWS"],
    experience: "5 years",
    education: "Bachelor's in Computer Science",
    flagged: false,
  },
  {
    id: "2",
    userId: "user_002",
    userName: "Michael Chen",
    userAvatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=8a4b04&color=fff",
    fileName: "Michael_Chen_CV.docx",
    uploadDate: "2025-12-15",
    parseStatus: "Partial",
    atsScore: 62,
    version: 1,
    fileSize: "180 KB",
    formatScore: 71,
    keywordMatch: 65,
    sectionsComplete: 6,
    totalSections: 10,
    timeSpent: "23 min",
    lastModified: "2025-12-15 09:15",
    skills: ["Python", "Data Analysis", "SQL", "Machine Learning"],
    experience: "3 years",
    education: "Master's in Data Science",
    flagged: false,
  },
  {
    id: "3",
    userId: "user_003",
    userName: "Emma Wilson",
    userAvatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=10b981&color=fff",
    fileName: "Emma_Resume.pdf",
    uploadDate: "2025-12-14",
    parseStatus: "Failed",
    atsScore: 23,
    version: 1,
    fileSize: "850 KB",
    formatScore: 34,
    keywordMatch: 12,
    sectionsComplete: 3,
    totalSections: 10,
    timeSpent: "12 min",
    lastModified: "2025-12-14 16:45",
    skills: ["Design", "Photoshop"],
    experience: "2 years",
    education: "Bachelor's in Graphic Design",
    flagged: true,
    flagReason: "Poor formatting, text extraction failed",
  },
];

// Chart data
const parseSuccessData = [
  { month: 'Jan', success: 92, partial: 6, failed: 2 },
  { month: 'Feb', success: 89, partial: 8, failed: 3 },
  { month: 'Mar', success: 94, partial: 4, failed: 2 },
  { month: 'Apr', success: 91, partial: 7, failed: 2 },
  { month: 'May', success: 96, partial: 3, failed: 1 },
  { month: 'Jun', success: 93, partial: 5, failed: 2 },
];

const skillTrendsData = [
  { skill: 'JavaScript', count: 450, growth: 15 },
  { skill: 'Python', count: 380, growth: 23 },
  { skill: 'React', count: 320, growth: 18 },
  { skill: 'Node.js', count: 290, growth: 12 },
  { skill: 'AWS', count: 250, growth: 28 },
  { skill: 'SQL', count: 220, growth: 8 },
  { skill: 'TypeScript', count: 180, growth: 35 },
  { skill: 'Docker', count: 150, growth: 42 },
];

const atsScoreDistribution = [
  { range: '90-100', count: 145, color: '#10b981' },
  { range: '80-89', count: 230, color: '#3b82f6' },
  { range: '70-79', count: 180, color: '#f59e0b' },
  { range: '60-69', count: 95, color: '#ef4444' },
  { range: 'Below 60', count: 50, color: '#6b7280' },
];

export function ResumeInsights() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedResume, setSelectedResume] = useState<any>(null);
  const [showResumeDetails, setShowResumeDetails] = useState(false);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Success: "bg-green-100 text-green-800 border-green-200",
      Partial: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Failed: "bg-red-100 text-red-800 border-red-200",
    };

    const icons = {
      Success: <CheckCircle className="w-3 h-3" />,
      Partial: <AlertCircle className="w-3 h-3" />,
      Failed: <XCircle className="w-3 h-3" />,
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} flex items-center gap-1 font-medium border`}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const ScoreBadge = ({ score }: { score: number }) => {
    const getColor = (score: number) => {
      if (score >= 80) return "text-green-600 bg-green-50";
      if (score >= 60) return "text-yellow-600 bg-yellow-50";
      return "text-red-600 bg-red-50";
    };

    return (
      <div className={`px-2 py-1 rounded-full text-sm font-semibold ${getColor(score)}`}>
        {score}/100
      </div>
    );
  };

  const filteredResumes = resumeData.filter(resume => {
    const matchesSearch = resume.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resume.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || resume.parseStatus.toLowerCase() === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalResumes: resumeData.length,
    successRate: Math.round((resumeData.filter(r => r.parseStatus === "Success").length / resumeData.length) * 100),
    avgAtsScore: Math.round(resumeData.reduce((acc, r) => acc + r.atsScore, 0) / resumeData.length),
    flaggedCount: resumeData.filter(r => r.flagged).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Resume Insights</h2>
          <p className="text-gray-600 mt-1">
            Analyze resume uploads, parsing performance, and builder usage across your platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
          <Button 
            size="sm"
            className="shadow-sm bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-parse Failed
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Resumes</CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalResumes}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18% this month
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Parse Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.successRate}%</div>
            <div className="text-xs text-green-600 mt-1">Industry leading</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Avg ATS Score</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.avgAtsScore}/100</div>
            <div className="text-xs text-blue-600 mt-1">Platform average</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-700">Flagged Resumes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.flaggedCount}</div>
            <div className="text-xs text-yellow-600 mt-1">Need attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Parse Success Trends */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Parse Success Trends
            </CardTitle>
            <CardDescription>Monthly resume parsing performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={parseSuccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="success" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="partial" 
                  stackId="1" 
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="failed" 
                  stackId="1" 
                  stroke="#ef4444" 
                  fill="#ef4444"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ATS Score Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              ATS Score Distribution
            </CardTitle>
            <CardDescription>Resume quality score breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={atsScoreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  {atsScoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Skills Analytics */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Trending Skills Analysis
          </CardTitle>
          <CardDescription>Most mentioned skills and their growth trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {skillTrendsData.map((skill, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{skill.skill}</div>
                  <div className="flex items-center text-green-600 text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{skill.growth}%
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-700">{skill.count}</div>
                <div className="text-xs text-gray-500">mentions this month</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user name or file name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-slate-300 focus:ring-slate-200"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 border-gray-200">
                <SelectValue placeholder="Parse Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resume Details Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Resume Details</CardTitle>
            <div className="text-sm text-gray-500">
              Showing {filteredResumes.length} of {resumeData.length} resumes
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="font-semibold text-gray-700">User & File</TableHead>
                  <TableHead className="font-semibold text-gray-700">Parse Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">ATS Score</TableHead>
                  <TableHead className="font-semibold text-gray-700">Profile Progress</TableHead>
                  <TableHead className="font-semibold text-gray-700">Keywords</TableHead>
                  <TableHead className="font-semibold text-gray-700">Upload Date</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResumes.map((resume) => (
                  <TableRow 
                    key={resume.id} 
                    className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedResume(resume);
                      setShowResumeDetails(true);
                    }}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-gray-200">
                          <AvatarImage src={resume.userAvatar} alt={resume.userName} />
                          <AvatarFallback>{resume.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-gray-900">{resume.userName}</div>
                          <div className="text-sm text-gray-500">{resume.fileName}</div>
                          <div className="text-xs text-gray-400">v{resume.version} • {resume.fileSize}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <StatusBadge status={resume.parseStatus} />
                        {resume.flagged && (
                          <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50">
                            Flagged
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <ScoreBadge score={resume.atsScore} />
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Format: {resume.formatScore}%</div>
                          <div className="text-xs text-gray-500">Keywords: {resume.keywordMatch}%</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress value={(resume.sectionsComplete / resume.totalSections) * 100} className="h-2 flex-1" />
                          <span className="text-xs text-gray-500">
                            {resume.sectionsComplete}/{resume.totalSections}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Time: {resume.timeSpent}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{resume.keywordMatch}%</div>
                        <div className="text-xs text-gray-500 truncate max-w-32">
                          {resume.skills.join(", ")}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-sm text-gray-600">
                      {new Date(resume.uploadDate).toLocaleDateString()}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Resume
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Download className="mr-2 h-4 w-4" />
                            Download File
                          </DropdownMenuItem>
                          {resume.parseStatus === "Failed" && (
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Retry Parse
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => e.stopPropagation()}
                            className="text-red-600"
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Flag Resume
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resume Details Dialog */}
      <Dialog open={showResumeDetails} onOpenChange={setShowResumeDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedResume && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedResume.fileName}</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Uploaded by {selectedResume.userName} • Resume ID: {selectedResume.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Resume Analysis Overview */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Parse Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <StatusBadge status={selectedResume.parseStatus} />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ATS Score:</span>
                          <ScoreBadge score={selectedResume.atsScore} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format Score:</span>
                          <span className="font-medium">{selectedResume.formatScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Keyword Match:</span>
                          <span className="font-medium">{selectedResume.keywordMatch}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">File Size:</span>
                          <span className="font-medium">{selectedResume.fileSize}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Profile Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">{selectedResume.experience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Education:</span>
                          <span className="font-medium">{selectedResume.education}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Version:</span>
                          <span className="font-medium">v{selectedResume.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Spent:</span>
                          <span className="font-medium">{selectedResume.timeSpent}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Skills and Completion */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Skills & Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Profile Completion</span>
                          <span className="font-medium">{selectedResume.sectionsComplete}/{selectedResume.totalSections} sections</span>
                        </div>
                        <Progress value={(selectedResume.sectionsComplete / selectedResume.totalSections) * 100} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Detected Skills:</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedResume.skills.map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-gray-300">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Flag Information */}
                {selectedResume.flagged && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Flagged Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-700">{selectedResume.flagReason}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowResumeDetails(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {selectedResume.parseStatus === "Failed" && (
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Parse
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}