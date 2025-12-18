"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Ban, 
  MessageSquare, 
  Briefcase,
  TrendingUp,
  Building2,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  Bell
} from "lucide-react";

// Mock data for employers
const employersData = [
  {
    id: "emp_001",
    companyName: "TechCorp Solutions",
    logo: "https://ui-avatars.com/api/?name=TechCorp+Solutions&background=02243b&color=fff",
    adminContact: "John Smith",
    email: "hr@techcorp.com",
    jobsPosted: 25,
    activeJobs: 8,
    lastJobPosted: "2025-12-15",
    plan: "Enterprise",
    accountStatus: "Active",
    kycStatus: "Verified",
    industry: "Technology",
    companySize: "51-200",
    location: "Toronto, ON",
    joinDate: "2024-08-15",
    lastLogin: "2025-12-16 13:20",
    totalViews: 1250,
    totalApplications: 180
  },
  {
    id: "emp_002", 
    companyName: "Healthcare Plus",
    logo: "https://ui-avatars.com/api/?name=Healthcare+Plus&background=8a4b04&color=fff",
    adminContact: "Dr. Lisa Brown",
    email: "contact@healthplus.ca",
    jobsPosted: 12,
    activeJobs: 4,
    lastJobPosted: "2025-12-12",
    plan: "Professional",
    accountStatus: "Active",
    kycStatus: "Pending",
    industry: "Healthcare",
    companySize: "11-50",
    location: "Calgary, AB",
    joinDate: "2025-01-05",
    lastLogin: "2025-12-14 16:30",
    totalViews: 680,
    totalApplications: 92
  },
  {
    id: "emp_003",
    companyName: "Creative Agency",
    logo: "https://ui-avatars.com/api/?name=Creative+Agency&background=10b981&color=fff",
    adminContact: "Alex Rodriguez", 
    email: "admin@creative.agency",
    jobsPosted: 8,
    activeJobs: 0,
    lastJobPosted: "2025-11-28",
    plan: "Basic",
    accountStatus: "Paused",
    kycStatus: "Verified",
    industry: "Design & Creative",
    companySize: "1-10",
    location: "Vancouver, BC",
    joinDate: "2024-12-01",
    lastLogin: "2025-12-10 10:15",
    totalViews: 320,
    totalApplications: 45
  },
  {
    id: "emp_004",
    companyName: "Finance Solutions Inc",
    logo: "https://ui-avatars.com/api/?name=Finance+Solutions&background=3b82f6&color=fff",
    adminContact: "Michael Zhang",
    email: "hiring@financesol.com",
    jobsPosted: 18,
    activeJobs: 6,
    lastJobPosted: "2025-12-14",
    plan: "Professional",
    accountStatus: "Active",
    kycStatus: "Verified",
    industry: "Finance",
    companySize: "201-500",
    location: "Montreal, QC",
    joinDate: "2024-06-20",
    lastLogin: "2025-12-16 11:45",
    totalViews: 980,
    totalApplications: 145
  },
  {
    id: "emp_005",
    companyName: "StartupHub",
    logo: "https://ui-avatars.com/api/?name=StartupHub&background=f59e0b&color=fff",
    adminContact: "Sarah Kim",
    email: "jobs@startuphub.co",
    jobsPosted: 5,
    activeJobs: 2,
    lastJobPosted: "2025-12-08",
    plan: "Basic",
    accountStatus: "Needs Review",
    kycStatus: "Pending",
    industry: "Technology",
    companySize: "1-10",
    location: "Ottawa, ON",
    joinDate: "2025-11-15",
    lastLogin: "2025-12-16 09:30",
    totalViews: 150,
    totalApplications: 28
  }
];

interface EmployersManagementProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function EmployersManagement({ searchQuery, onSearchChange }: EmployersManagementProps) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [showEmployerModal, setShowEmployerModal] = useState(false);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Needs Review": "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const PlanBadge = ({ plan }: { plan: string }) => {
    const variants = {
      Enterprise: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Professional: "bg-blue-100 text-blue-800 border-blue-200",
      Basic: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge className={variants[plan as keyof typeof variants]}>
        {plan}
      </Badge>
    );
  };

  const KYCBadge = ({ status }: { status: string }) => {
    if (status === "Verified") {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-xs font-medium">🛡️ Verified</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 text-orange-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs font-medium">⚠️ KYC Pending</span>
        </div>
      );
    }
  };

  const filteredData = employersData.filter(employer => {
    const matchesSearch = employer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         employer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employer.adminContact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || employer.accountStatus.toLowerCase() === filterStatus.toLowerCase();
    const matchesPlan = filterPlan === "all" || employer.plan.toLowerCase() === filterPlan.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleRowClick = (employer: any) => {
    setSelectedEmployer(employer);
    setShowEmployerModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Employers Management</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by Company, Email, Contact..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-64 border-gray-200"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="needs review">Needs Review</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="lastActive">Last Active</SelectItem>
                  <SelectItem value="mostJobs">Most Jobs Posted</SelectItem>
                  <SelectItem value="lastJobPosted">Last Job Posted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="font-semibold text-gray-700">Company</TableHead>
                <TableHead className="font-semibold text-gray-700">Admin Contact</TableHead>
                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                <TableHead className="font-semibold text-gray-700">Jobs Posted</TableHead>
                <TableHead className="font-semibold text-gray-700">Last Job Posted</TableHead>
                <TableHead className="font-semibold text-gray-700">Plan</TableHead>
                <TableHead className="font-semibold text-gray-700">Account Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((employer) => (
                <TableRow 
                  key={employer.id} 
                  className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(employer)}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employer.logo} />
                        <AvatarFallback>
                          {employer.companyName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{employer.companyName}</span>
                          <KYCBadge status={employer.kycStatus} />
                        </div>
                        <div className="text-sm text-gray-500">{employer.industry}</div>
                        <div className="text-sm text-gray-500">{employer.companySize} employees</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{employer.adminContact}</div>
                      <div className="text-sm text-gray-500">{employer.location}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-600">{employer.email}</div>
                  </TableCell>
                  
                  <TableCell>
                    <button 
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle job listing overview
                      }}
                    >
                      {employer.jobsPosted}
                      <Briefcase className="h-3 w-3" />
                    </button>
                    <div className="text-xs text-gray-500 mt-1">{employer.activeJobs} active</div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-600">{formatDate(employer.lastJobPosted)}</div>
                  </TableCell>
                  
                  <TableCell>
                    <PlanBadge plan={employer.plan} />
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadge status={employer.accountStatus} />
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
                          <Building2 className="mr-2 h-4 w-4" />
                          View Company Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Briefcase className="mr-2 h-4 w-4" />
                          See Posted Jobs
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Notification
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Upgrade/Downgrade Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {employer.accountStatus === "Active" ? (
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Employer
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reactivate Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employer Details Modal */}
      <Dialog open={showEmployerModal} onOpenChange={setShowEmployerModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Employer Details
            </DialogTitle>
            <DialogDescription>
              Complete company information and account management options
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmployer && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Company Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarImage src={selectedEmployer.logo} />
                        <AvatarFallback>
                          {selectedEmployer.companyName.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="mt-3 font-semibold">{selectedEmployer.companyName}</h3>
                      <p className="text-gray-600">{selectedEmployer.email}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div><span className="font-medium">Contact:</span> {selectedEmployer.adminContact}</div>
                      <div><span className="font-medium">Industry:</span> {selectedEmployer.industry}</div>
                      <div><span className="font-medium">Company Size:</span> {selectedEmployer.companySize} employees</div>
                      <div><span className="font-medium">Location:</span> {selectedEmployer.location}</div>
                      <div><span className="font-medium">Plan:</span> <PlanBadge plan={selectedEmployer.plan} /></div>
                      <div><span className="font-medium">Status:</span> <StatusBadge status={selectedEmployer.accountStatus} /></div>
                      <div><span className="font-medium">KYC:</span> <KYCBadge status={selectedEmployer.kycStatus} /></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Stats & Activity */}
              <div className="md:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedEmployer.jobsPosted}</div>
                        <div className="text-sm text-blue-700">Total Jobs Posted</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedEmployer.activeJobs}</div>
                        <div className="text-sm text-green-700">Active Jobs</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{selectedEmployer.totalApplications}</div>
                        <div className="text-sm text-purple-700">Total Applications</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{selectedEmployer.totalViews}</div>
                        <div className="text-sm text-orange-700">Profile Views</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" size="sm">
                        <Building2 className="w-4 h-4 mr-2" />
                        Company Page
                      </Button>
                      <Button variant="outline" size="sm">
                        <Briefcase className="w-4 h-4 mr-2" />
                        View Jobs
                      </Button>
                      <Button variant="outline" size="sm">
                        <Bell className="w-4 h-4 mr-2" />
                        Send Notification
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Manage Plan
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        View Applications
                      </Button>
                      <Button variant="outline" size="sm" className={selectedEmployer.accountStatus === "Active" ? "text-red-600" : "text-green-600"}>
                        {selectedEmployer.accountStatus === "Active" ? (
                          <>
                            <Ban className="w-4 h-4 mr-2" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Reactivate
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Last job posted: {formatDate(selectedEmployer.lastJobPosted)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Joined: {formatDate(selectedEmployer.joinDate)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span>Last login: {selectedEmployer.lastLogin}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}