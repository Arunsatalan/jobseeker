"use client";

import { useState, useEffect } from "react";
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
} from 'recharts';
import {
  FileText,
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  User,
  TrendingUp,
  AlertTriangle,
  Download,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Filter
} from "lucide-react";

export function ApplicationsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

  // State for fetched data
  const [applications, setApplications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inReview: 0,
    hired: 0,
    flagged: 0
  });
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // Construct query
      const queryParams = new URLSearchParams();
      if (filterStatus !== 'all') queryParams.append('status', filterStatus);

      const response = await fetch(`${apiUrl}/api/v1/admin/stats/applications?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setApplications(data.data.applications);
        setStats(data.data.stats);
        setTrendsData(data.data.trends);
        setStatusDistribution(data.data.distribution);
      }
    } catch (error) {
      console.error("Failed to fetch application stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus, selectedTab]);

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      (app.applicantName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.jobTitle || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.company || "").toLowerCase().includes(searchQuery.toLowerCase());

    // Client-side filtering for demonstration, ideally server-side for large datasets
    const matchesStatus = filterStatus === "all" || app.status.toLowerCase() === filterStatus;
    const matchesCompany = filterCompany === "all" || app.company === filterCompany;
    const matchesTab = selectedTab === "all" ||
      (selectedTab === "flagged" && app.flagged) ||
      (selectedTab === "active" && ["Applied", "Reviewed", "Interview"].includes(app.status));

    return matchesSearch && matchesStatus && matchesCompany && matchesTab;
  });

  const companies = [...new Set(applications.map(app => app.company))];

  const handleStatusUpdate = (appId: string, newStatus: string) => {
    console.log(`Update application ${appId} to ${newStatus}`);
    // Implementation for status update
  };

  const handleFlagApplication = (appId: string) => {
    console.log(`Flag application ${appId}`);
    // Implementation for flagging
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Applied: "bg-blue-100 text-blue-800 border-blue-200",
      Reviewed: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Interview: "bg-purple-100 text-purple-800 border-purple-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
      Hired: "bg-green-100 text-green-800 border-green-200",
    };

    const icons = {
      Applied: <Clock className="w-3 h-3" />,
      Reviewed: <Eye className="w-3 h-3" />,
      Interview: <MessageSquare className="w-3 h-3" />,
      Rejected: <XCircle className="w-3 h-3" />,
      Hired: <CheckCircle className="w-3 h-3" />,
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} flex items-center gap-1 font-medium border`}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const MatchScore = ({ score }: { score: number }) => {
    const getColor = (score: number) => {
      if (score >= 80) return "text-green-600 bg-green-50";
      if (score >= 60) return "text-yellow-600 bg-yellow-50";
      return "text-red-600 bg-red-50";
    };

    return (
      <div className={`px-2 py-1 rounded text-xs font-semibold ${getColor(score)}`}>
        {score}%
      </div>
    );
  };

  const RatingStars = ({ rating }: { rating: number | null }) => {
    if (!rating) return <span className="text-gray-400 text-sm">Not rated</span>;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`w-3 h-3 rounded-full ${star <= rating ? 'bg-yellow-400' : 'bg-gray-200'
              }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Applications Management</h2>
          <p className="text-gray-600 mt-1">
            Track and review job applications across your platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Applications
          </Button>
          <Button
            size="sm"
            className="shadow-sm bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
          >
            <Flag className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% this month
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{stats.pending}</div>
            <div className="text-xs text-blue-600 mt-1">Awaiting employer</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">In Review</CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{stats.inReview}</div>
            <div className="text-xs text-purple-600 mt-1">Active process</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Hired</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.hired}</div>
            <div className="text-xs text-green-600 mt-1">Successful placements</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700">Flagged</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{stats.flagged}</div>
            <div className="text-xs text-red-600 mt-1">Need attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Application Trends */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Application Flow Trends
            </CardTitle>
            <CardDescription>Monthly application pipeline progression</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="applied" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="reviewed" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                <Area type="monotone" dataKey="interviewed" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="hired" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Status Distribution
            </CardTitle>
            <CardDescription>Current application status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-96">
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="active">Active Process</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {/* Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search applicants, jobs, or companies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-slate-300 focus:ring-slate-200"
                    />
                  </div>
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger className="w-48 border-gray-200">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" className="border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Applications Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Applications</CardTitle>
                <div className="text-sm text-gray-500">
                  Showing {filteredApplications.length} of {applications.length} applications
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-100">
                      <TableHead className="font-semibold text-gray-700">Applicant</TableHead>
                      <TableHead className="font-semibold text-gray-700">Job & Company</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Match</TableHead>
                      <TableHead className="font-semibold text-gray-700">Documents</TableHead>
                      <TableHead className="font-semibold text-gray-700">Applied Date</TableHead>
                      <TableHead className="font-semibold text-gray-700">Rating</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow
                        key={application.id}
                        className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowApplicationDetails(true);
                        }}
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-gray-200">
                              <AvatarImage src={application.applicantAvatar} alt={application.applicantName} />
                              <AvatarFallback>{application.applicantName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-gray-900">{application.applicantName}</div>
                              <div className="text-sm text-gray-500">{application.applicantEmail}</div>
                              <div className="text-xs text-gray-400">{application.experience} experience</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-gray-200">
                              <AvatarImage src={application.companyLogo} alt={application.company} />
                              <AvatarFallback>{application.company[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">{application.jobTitle}</div>
                              <div className="text-sm text-gray-500">{application.company}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <StatusBadge status={application.status} />
                            {application.flagged && (
                              <Badge variant="outline" className="text-red-600 border-red-300 bg-red-50 block w-fit">
                                <Flag className="w-3 h-3 mr-1" />
                                Flagged
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <MatchScore score={application.matchScore} />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {application.resumeAttached ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="text-xs text-gray-600">Resume</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {application.coverLetter ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="text-xs text-gray-600">Cover</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-gray-600">
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <RatingStars rating={application.rating} />
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
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <User className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Contact Applicant
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(application.id, "Interview");
                                }}
                                className="text-green-600"
                              >
                                <ThumbsUp className="mr-2 h-4 w-4" />
                                Move to Interview
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(application.id, "Rejected");
                                }}
                                className="text-red-600"
                              >
                                <ThumbsDown className="mr-2 h-4 w-4" />
                                Reject Application
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFlagApplication(application.id);
                                }}
                                className="text-orange-600"
                              >
                                <Flag className="mr-2 h-4 w-4" />
                                Flag Application
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
        </TabsContent>
      </Tabs>

      {/* Application Details Dialog */}
      <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedApplication.jobTitle}</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Application from {selectedApplication.applicantName} • ID: {selectedApplication.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Application Overview */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Applicant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedApplication.applicantAvatar} />
                          <AvatarFallback>{selectedApplication.applicantName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{selectedApplication.applicantName}</div>
                          <div className="text-sm text-gray-500">{selectedApplication.applicantEmail}</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">{selectedApplication.experience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedApplication.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Salary Expectation:</span>
                          <span className="font-medium text-green-600">{selectedApplication.salaryExpectation}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Application Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <StatusBadge status={selectedApplication.status} />
                        <div className="text-sm text-gray-600">
                          Stage: <span className="font-medium">{selectedApplication.stage}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Applied:</span>
                          <span className="font-medium">{new Date(selectedApplication.appliedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Update:</span>
                          <span className="font-medium">{new Date(selectedApplication.lastUpdate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Match Score:</span>
                          <MatchScore score={selectedApplication.matchScore} />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rating:</span>
                          <RatingStars rating={selectedApplication.rating} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Documents */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Application Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Resume</span>
                        </div>
                        {selectedApplication.resumeAttached ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <Button size="sm" variant="outline">View</Button>
                          </div>
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Cover Letter</span>
                        </div>
                        {selectedApplication.coverLetter ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <Button size="sm" variant="outline">View</Button>
                          </div>
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employer Notes */}
                {selectedApplication.employerNotes && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Employer Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{selectedApplication.employerNotes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Flag Information */}
                {selectedApplication.flagged && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base text-red-800 flex items-center gap-2">
                        <Flag className="h-4 w-4" />
                        Flagged Application
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-700">{selectedApplication.flagReason}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowApplicationDetails(false)}>
                  Close
                </Button>
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact
                </Button>
                {selectedApplication.status === "Applied" && (
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Move to Interview
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