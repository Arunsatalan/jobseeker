"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  Clock,
  Filter,
  Download,
  MessageSquare,
  FileText,
  User,
  Building,
  Calendar,
  TrendingUp,
  BarChart3,
  Settings,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Mock data for flagged content
const flaggedContent = [
  {
    id: "flag_001",
    type: "Job Posting",
    title: "Senior Developer - High Salary Guaranteed",
    contentId: "job_12345",
    reporter: {
      id: "user_001",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=02243b&color=fff",
    },
    reportedUser: {
      id: "emp_001",
      name: "QuickHire Inc",
      email: "contact@quickhire.com",
      avatar: "https://ui-avatars.com/api/?name=QuickHire&background=ef4444&color=fff",
    },
    reason: "Misleading Information",
    description: "The job posting claims guaranteed high salary but provides no specifics and seems like a scam.",
    flaggedDate: "2025-12-16",
    status: "Pending Review",
    severity: "High",
    category: "Misleading Content",
    autoFlagged: false,
    reviewCount: 3,
  },
  {
    id: "flag_002",
    type: "Profile",
    title: "Inappropriate Profile Content",
    contentId: "user_67890",
    reporter: {
      id: "system",
      name: "Automated System",
      email: "system@canadajobs.com",
      avatar: "https://ui-avatars.com/api/?name=System&background=10b981&color=fff",
    },
    reportedUser: {
      id: "user_456",
      name: "John Smith",
      email: "john.smith@email.com",
      avatar: "https://ui-avatars.com/api/?name=John+Smith&background=f59e0b&color=fff",
    },
    reason: "Inappropriate Content",
    description: "Profile contains inappropriate language and unprofessional content.",
    flaggedDate: "2025-12-15",
    status: "Under Investigation",
    severity: "Medium",
    category: "Inappropriate Language",
    autoFlagged: true,
    reviewCount: 1,
  },
  {
    id: "flag_003",
    type: "Message",
    title: "Harassment in Direct Messages",
    contentId: "msg_11111",
    reporter: {
      id: "user_789",
      name: "Emily Davis",
      email: "emily.d@email.com",
      avatar: "https://ui-avatars.com/api/?name=Emily+Davis&background=8b5cf6&color=fff",
    },
    reportedUser: {
      id: "user_321",
      name: "Mike Wilson",
      email: "mike.w@email.com",
      avatar: "https://ui-avatars.com/api/?name=Mike+Wilson&background=ef4444&color=fff",
    },
    reason: "Harassment",
    description: "User has been sending inappropriate and harassing messages repeatedly.",
    flaggedDate: "2025-12-14",
    status: "Resolved",
    severity: "High",
    category: "Harassment",
    autoFlagged: false,
    reviewCount: 2,
    resolution: "User banned for 30 days",
    resolvedBy: "Admin Team",
    resolvedDate: "2025-12-16",
  },
];

// Mock data for suspended users
const suspendedUsers = [
  {
    id: "user_001",
    name: "Robert Brown",
    email: "robert.b@email.com",
    avatar: "https://ui-avatars.com/api/?name=Robert+Brown&background=ef4444&color=fff",
    userType: "Job Seeker",
    suspendedDate: "2025-12-10",
    suspensionType: "Temporary",
    duration: "7 days",
    reason: "Spam Job Applications",
    suspendedBy: "Sarah Wilson",
    status: "Active Suspension",
    violations: 3,
    appealSubmitted: false,
  },
  {
    id: "emp_002",
    name: "FakeJobs Corp",
    email: "contact@fakejobs.com",
    avatar: "https://ui-avatars.com/api/?name=FakeJobs&background=ef4444&color=fff",
    userType: "Employer",
    suspendedDate: "2025-12-05",
    suspensionType: "Permanent",
    duration: "Permanent",
    reason: "Fraudulent Job Postings",
    suspendedBy: "Admin Team",
    status: "Permanent Ban",
    violations: 8,
    appealSubmitted: true,
  },
];

// Mock data for moderation analytics
const moderationAnalytics = [
  { month: "Jul", flags: 45, resolved: 42, false_positives: 3 },
  { month: "Aug", flags: 52, resolved: 48, false_positives: 4 },
  { month: "Sep", flags: 38, resolved: 36, false_positives: 2 },
  { month: "Oct", flags: 61, resolved: 58, false_positives: 3 },
  { month: "Nov", flags: 43, resolved: 40, false_positives: 3 },
  { month: "Dec", flags: 29, resolved: 25, false_positives: 4 },
];

const violationTypes = [
  { name: "Spam", value: 35, color: "#ef4444" },
  { name: "Inappropriate Content", value: 28, color: "#f59e0b" },
  { name: "Harassment", value: 20, color: "#8b5cf6" },
  { name: "Misleading Info", value: 17, color: "#06b6d4" },
];

export function ModerationTools() {
  const [selectedTab, setSelectedTab] = useState("flagged");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showContentDetails, setShowContentDetails] = useState(false);
  const [showModerationAction, setShowModerationAction] = useState(false);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      "Pending Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Under Investigation": "bg-blue-100 text-blue-800 border-blue-200",
      "Resolved": "bg-green-100 text-green-800 border-green-200",
      "Dismissed": "bg-gray-100 text-gray-800 border-gray-200",
      "Active Suspension": "bg-red-100 text-red-800 border-red-200",
      "Permanent Ban": "bg-red-200 text-red-900 border-red-300",
    };

    const icons = {
      "Pending Review": <Clock className="w-3 h-3 mr-1" />,
      "Under Investigation": <Eye className="w-3 h-3 mr-1" />,
      "Resolved": <CheckCircle className="w-3 h-3 mr-1" />,
      "Dismissed": <XCircle className="w-3 h-3 mr-1" />,
      "Active Suspension": <Ban className="w-3 h-3 mr-1" />,
      "Permanent Ban": <Ban className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border font-medium flex items-center`}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const SeverityBadge = ({ severity }: { severity: string }) => {
    const variants = {
      Low: "bg-green-100 text-green-800 border-green-200",
      Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      High: "bg-red-100 text-red-800 border-red-200",
      Critical: "bg-red-200 text-red-900 border-red-300",
    };

    return (
      <Badge className={`${variants[severity as keyof typeof variants]} border font-medium`}>
        {severity}
      </Badge>
    );
  };

  const TypeIcon = ({ type }: { type: string }) => {
    const icons = {
      "Job Posting": <FileText className="h-4 w-4" />,
      Profile: <User className="h-4 w-4" />,
      Message: <MessageSquare className="h-4 w-4" />,
      Company: <Building className="h-4 w-4" />,
      Review: <Flag className="h-4 w-4" />,
    };

    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
  };

  const stats = {
    pendingFlags: flaggedContent.filter(f => f.status === "Pending Review").length,
    underInvestigation: flaggedContent.filter(f => f.status === "Under Investigation").length,
    resolvedToday: flaggedContent.filter(f => f.status === "Resolved" && f.resolvedDate === "2025-12-16").length,
    activeSuspensions: suspendedUsers.filter(u => u.status === "Active Suspension").length,
    totalFlags: flaggedContent.length,
    autoDetectionRate: 67,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Moderation Tools</h2>
          <p className="text-gray-600 mt-1">
            Monitor platform content, review flagged items, and manage user violations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button 
            size="sm"
            className="shadow-sm bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
          >
            <Settings className="h-4 w-4 mr-2" />
            Moderation Settings
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-700">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.pendingFlags}</div>
            <div className="text-xs text-yellow-600 mt-1">Need attention</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Under Investigation</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.underInvestigation}</div>
            <div className="text-xs text-blue-600 mt-1">In progress</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.resolvedToday}</div>
            <div className="text-xs text-green-600 mt-1">Cases closed</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700">Active Suspensions</CardTitle>
              <Ban className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.activeSuspensions}</div>
            <div className="text-xs text-red-600 mt-1">Users suspended</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold">Moderation Activity</CardTitle>
            <CardDescription>Monthly trends in flagged content and resolution rates</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moderationAnalytics}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="flags"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Flags Received"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Cases Resolved"
                />
                <Line
                  type="monotone"
                  dataKey="false_positives"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="False Positives"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-lg font-semibold">Violation Types</CardTitle>
            <CardDescription>Distribution of reported violations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={violationTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {violationTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, undefined]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {violationTypes.map((violation) => (
                <div key={violation.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: violation.color }}
                    />
                    <span className="font-medium">{violation.name}</span>
                  </div>
                  <span className="text-gray-600">{violation.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-96">
          <TabsTrigger value="flagged">Flagged Content</TabsTrigger>
          <TabsTrigger value="suspended">Suspended Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Flagged Content Review</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search flagged content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 border-gray-200"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="font-semibold text-gray-700">Content</TableHead>
                    <TableHead className="font-semibold text-gray-700">Reported By</TableHead>
                    <TableHead className="font-semibold text-gray-700">Reported User</TableHead>
                    <TableHead className="font-semibold text-gray-700">Reason</TableHead>
                    <TableHead className="font-semibold text-gray-700">Severity</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedContent.map((flag) => (
                    <TableRow 
                      key={flag.id} 
                      className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedContent(flag);
                        setShowContentDetails(true);
                      }}
                    >
                      <TableCell className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <TypeIcon type={flag.type} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{flag.title}</span>
                              {flag.autoFlagged && (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                  Auto-flagged
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{flag.type} • {flag.contentId}</div>
                            <div className="text-sm text-gray-600 mt-1 max-w-64 truncate">{flag.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={flag.reporter.avatar} />
                            <AvatarFallback className="text-xs">
                              {flag.reporter.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{flag.reporter.name}</div>
                            <div className="text-xs text-gray-500">{flag.reporter.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={flag.reportedUser.avatar} />
                            <AvatarFallback className="text-xs">
                              {flag.reportedUser.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{flag.reportedUser.name}</div>
                            <div className="text-xs text-gray-500">{flag.reportedUser.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{flag.reason}</div>
                          <div className="text-xs text-gray-500">{flag.category}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <SeverityBadge severity={flag.severity} />
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <StatusBadge status={flag.status} />
                          <div className="text-xs text-gray-500">{flag.reviewCount} review(s)</div>
                        </div>
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
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedContent(flag);
                                setShowModerationAction(true);
                              }}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Take Action
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Resolved
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-gray-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              Dismiss
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suspended Users Tab */}
        <TabsContent value="suspended" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">Suspended Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="font-semibold text-gray-700">User</TableHead>
                    <TableHead className="font-semibold text-gray-700">Type</TableHead>
                    <TableHead className="font-semibold text-gray-700">Suspension Details</TableHead>
                    <TableHead className="font-semibold text-gray-700">Reason</TableHead>
                    <TableHead className="font-semibold text-gray-700">Violations</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspendedUsers.map((user) => (
                    <TableRow key={user.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.appealSubmitted && (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs mt-1">
                                Appeal Submitted
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="border-gray-300">
                          {user.userType}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.suspensionType}</div>
                          <div className="text-sm text-gray-500">Duration: {user.duration}</div>
                          <div className="text-xs text-gray-500">
                            Started: {new Date(user.suspendedDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">By: {user.suspendedBy}</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-gray-900">{user.reason}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600">{user.violations}</div>
                          <div className="text-xs text-gray-500">violations</div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View User Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              View Violation History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "Active Suspension" && (
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Lift Suspension
                              </DropdownMenuItem>
                            )}
                            {user.appealSubmitted && (
                              <DropdownMenuItem className="text-blue-600">
                                <Eye className="mr-2 h-4 w-4" />
                                Review Appeal
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="mr-2 h-4 w-4" />
                              Extend Suspension
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Auto Detection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.autoDetectionRate}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +5% from last month
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Resolution Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">2.4h</div>
                <div className="text-xs text-gray-500 mt-1">Per case</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">False Positive Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">8.2%</div>
                <div className="text-xs text-gray-500 mt-1">-2% improvement</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">User Appeals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-xs text-gray-500 mt-1">Pending review</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">Moderation Performance</CardTitle>
              <CardDescription>Detailed analytics on moderation efficiency and trends</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={moderationAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="flags"
                    fill="#ef4444"
                    name="Flags Received"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="resolved"
                    fill="#10b981"
                    name="Cases Resolved"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="false_positives"
                    fill="#f59e0b"
                    name="False Positives"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Content Details Dialog */}
      <Dialog open={showContentDetails} onOpenChange={setShowContentDetails}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedContent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Flagged Content Review</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Report ID: {selectedContent.id} • Flagged on {selectedContent.flaggedDate}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-red-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Flag Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-red-700">Reason:</span>
                        <p className="text-sm text-red-600">{selectedContent.reason}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-red-700">Category:</span>
                        <p className="text-sm text-red-600">{selectedContent.category}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm font-medium text-red-700">Description:</span>
                        <p className="text-sm text-red-600 mt-1">{selectedContent.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Reporter Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedContent.reporter.avatar} />
                          <AvatarFallback>
                            {selectedContent.reporter.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{selectedContent.reporter.name}</div>
                          <div className="text-sm text-gray-500">{selectedContent.reporter.email}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Reported User</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedContent.reportedUser.avatar} />
                          <AvatarFallback>
                            {selectedContent.reportedUser.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{selectedContent.reportedUser.name}</div>
                          <div className="text-sm text-gray-500">{selectedContent.reportedUser.email}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {selectedContent.resolution && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-green-800 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Resolution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-green-700">{selectedContent.resolution}</p>
                      <div className="text-xs text-green-600 mt-2">
                        Resolved by {selectedContent.resolvedBy} on {selectedContent.resolvedDate}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowContentDetails(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Original Content
                </Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setShowContentDetails(false);
                    setShowModerationAction(true);
                  }}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Take Action
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Moderation Action Dialog */}
      <Dialog open={showModerationAction} onOpenChange={setShowModerationAction}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Moderation Action</DialogTitle>
            <DialogDescription>
              Take appropriate action on the flagged content or user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Action Type</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dismiss">Dismiss Flag</SelectItem>
                  <SelectItem value="warn">Send Warning</SelectItem>
                  <SelectItem value="remove_content">Remove Content</SelectItem>
                  <SelectItem value="suspend_user">Suspend User</SelectItem>
                  <SelectItem value="ban_user">Ban User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Duration (if applicable)</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1_day">1 Day</SelectItem>
                  <SelectItem value="3_days">3 Days</SelectItem>
                  <SelectItem value="7_days">7 Days</SelectItem>
                  <SelectItem value="30_days">30 Days</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Reason / Notes</label>
              <Textarea
                placeholder="Explain the reasoning for this action..."
                className="mt-1 resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notify User</label>
              <div className="flex items-center space-x-2 mt-1">
                <input type="checkbox" id="notify" className="rounded" />
                <label htmlFor="notify" className="text-sm text-gray-600">
                  Send notification email to user about this action
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModerationAction(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowModerationAction(false)} className="bg-red-600 hover:bg-red-700">
              <Shield className="h-4 w-4 mr-2" />
              Execute Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}