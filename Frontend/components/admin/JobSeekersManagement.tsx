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
  FileText,
  TrendingUp,
  Star,
  Shield,
  AlertCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Mock data for job seekers
const jobSeekersData = [
  {
    id: "js_001",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (416) 555-0123",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=02243b&color=fff",
    location: "Toronto, ON",
    resumeCount: 3,
    atsScore: 85,
    plan: "Pro",
    status: "Active",
    registrationDate: "2024-11-15",
    lastActive: "2025-12-16 14:30",
    totalApplications: 24,
    profileViews: 156,
    verified: true
  },
  {
    id: "js_002",
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (604) 555-0456",
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff",
    location: "Vancouver, BC",
    resumeCount: 2,
    atsScore: 78,
    plan: "Free",
    status: "Active",
    registrationDate: "2024-10-20",
    lastActive: "2025-12-15 09:15",
    totalApplications: 18,
    profileViews: 89,
    verified: true
  },
  {
    id: "js_003",
    name: "Emma Wilson",
    email: "emma.w@email.com",
    phone: "+1 (514) 555-0789",
    avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=f59e0b&color=fff",
    location: "Montreal, QC",
    resumeCount: 1,
    atsScore: 62,
    plan: "Free",
    status: "Pending",
    registrationDate: "2025-12-10",
    lastActive: "2025-12-16 11:45",
    totalApplications: 8,
    profileViews: 34,
    verified: false
  },
  {
    id: "js_004",
    name: "David Rodriguez",
    email: "d.rodriguez@email.com",
    phone: "+1 (403) 555-0321",
    avatar: "https://ui-avatars.com/api/?name=David+Rodriguez&background=8b5cf6&color=fff",
    location: "Calgary, AB",
    resumeCount: 4,
    atsScore: 92,
    plan: "Pro",
    status: "Active",
    registrationDate: "2024-09-05",
    lastActive: "2025-12-16 16:22",
    totalApplications: 31,
    profileViews: 203,
    verified: true
  },
  {
    id: "js_005",
    name: "Lisa Thompson",
    email: "lisa.t@email.com",
    phone: "+1 (902) 555-0654",
    avatar: "https://ui-avatars.com/api/?name=Lisa+Thompson&background=ef4444&color=fff",
    location: "Halifax, NS",
    resumeCount: 0,
    atsScore: 0,
    plan: "Free",
    status: "Suspended",
    registrationDate: "2024-12-01",
    lastActive: "2025-12-08 13:30",
    totalApplications: 2,
    profileViews: 12,
    verified: false
  }
];

interface JobSeekersManagementProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function JobSeekersManagement({ searchQuery, onSearchChange }: JobSeekersManagementProps) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Suspended: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const PlanBadge = ({ plan }: { plan: string }) => {
    return (
      <Badge className={plan === 'Pro' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
        {plan}
      </Badge>
    );
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredData = jobSeekersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status.toLowerCase() === filterStatus;
    const matchesPlan = filterPlan === "all" || user.plan.toLowerCase() === filterPlan;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleRowClick = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section with Filters */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Job Seekers Management</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by Name, Email, ID..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="lastActive">Last Active</SelectItem>
                  <SelectItem value="mostApplications">Most Applications</SelectItem>
                  <SelectItem value="highestATS">Highest ATS Score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100">
                <TableHead className="font-semibold text-gray-700">Profile</TableHead>
                <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                <TableHead className="font-semibold text-gray-700">Location</TableHead>
                <TableHead className="font-semibold text-gray-700">Resume Count</TableHead>
                <TableHead className="font-semibold text-gray-700">ATS Score Avg</TableHead>
                <TableHead className="font-semibold text-gray-700">Plan</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((user) => (
                <TableRow 
                  key={user.id} 
                  className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(user)}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{user.name}</span>
                          {user.verified && (
                            <Shield className="h-4 w-4 text-green-600" title="Verified User" />
                          )}
                          {user.plan === 'Pro' && (
                            <Star className="h-4 w-4 text-purple-600" title="Pro Member" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-600">{user.location}</div>
                  </TableCell>
                  
                  <TableCell>
                    <button 
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle resume management modal
                      }}
                    >
                      {user.resumeCount}
                      <FileText className="h-3 w-3" />
                    </button>
                    {user.resumeCount === 0 && (
                      <div className="text-xs text-red-500 mt-1">No resume</div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`font-semibold ${getATSScoreColor(user.atsScore)}`}>
                        {user.atsScore}%
                      </div>
                      <div className="w-16">
                        <Progress value={user.atsScore} className="h-2" />
                      </div>
                    </div>
                    {user.resumeCount > 0 && (
                      <div className="text-xs text-gray-500 mt-1" title={`Parsed ${user.resumeCount}/${user.resumeCount} resumes`}>
                        {user.resumeCount}/{user.resumeCount} parsed
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <PlanBadge plan={user.plan} />
                  </TableCell>
                  
                  <TableCell>
                    <StatusBadge status={user.status} />
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
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Upgrade Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "Suspended" ? (
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-green-600">
                            <Shield className="mr-2 h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Account
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Delete User
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

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Job Seeker Profile Details
            </DialogTitle>
            <DialogDescription>
              Complete profile information and account management options
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Profile Info */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto">
                        <AvatarImage src={selectedUser.avatar} />
                        <AvatarFallback>
                          {selectedUser.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="mt-3 font-semibold">{selectedUser.name}</h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div><span className="font-medium">Phone:</span> {selectedUser.phone}</div>
                      <div><span className="font-medium">Location:</span> {selectedUser.location}</div>
                      <div><span className="font-medium">Plan:</span> <PlanBadge plan={selectedUser.plan} /></div>
                      <div><span className="font-medium">Status:</span> <StatusBadge status={selectedUser.status} /></div>
                      <div><span className="font-medium">Verified:</span> {selectedUser.verified ? '✅ Yes' : '❌ No'}</div>
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
                        <div className="text-2xl font-bold text-blue-600">{selectedUser.totalApplications}</div>
                        <div className="text-sm text-blue-700">Total Applications</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{selectedUser.profileViews}</div>
                        <div className="text-sm text-green-700">Profile Views</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{selectedUser.resumeCount}</div>
                        <div className="text-sm text-purple-700">Resumes Uploaded</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{selectedUser.atsScore}%</div>
                        <div className="text-sm text-orange-700">ATS Score</div>
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
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" size="sm">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Upgrade Plan
                      </Button>
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