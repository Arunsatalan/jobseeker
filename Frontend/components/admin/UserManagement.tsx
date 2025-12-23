"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompaniesTable } from "./CompaniesTable";
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
  Users,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Building2,
  Building,
  FileText,
  Mail,
  Phone,
  Download,
  AlertTriangle,
  MessageSquare,
  Plus,
  Briefcase,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  UserPlus,
  Shield,
  Clock,
  DollarSign,
} from "lucide-react";

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("seekers");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [jobSeekersData, setJobSeekersData] = useState<any[]>([]);
  const [employersData, setEmployersData] = useState<any[]>([]);
  const [companiesData, setCompaniesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Company ID to name mapping (temporary solution until backend populates company data)
  // WHY THIS IS NEEDED:
  // - API returns employer users with 'company' field containing company ID only
  // - Company name "spyboy3" is stored in separate company collection
  // - Backend should populate company data but currently doesn't
  // - User ID is different from company ID - user ID is for the employer user, company ID is for the company they represent
  const companyMapping: { [key: string]: string } = {
    '694981060212935e26201eb6': 'spyboy3',
    // Add more company mappings as needed
  };

  // Fetch company details by ID or name
  const fetchCompanyDetails = async (companyId: string | undefined, companyName?: string) => {
    try {
      setLoadingCompany(true);
      console.log('Fetching company details for ID:', companyId, 'or name:', companyName);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      let companyData = null;
      
      // If we have a company ID, try to fetch by ID first
      if (companyId) {
        try {
          console.log('Trying to fetch by ID:', companyId);
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/companies/${companyId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data.success && response.data.data) {
            companyData = response.data.data;
            console.log('Found company by ID:', companyData);
          }
        } catch (idError) {
          console.log('Company not found by ID, trying by name...');
        }
      }
      
      // If no company found by ID, or no ID provided, search by name
      if (!companyData && companyName) {
        try {
          console.log('Fetching all companies to find by name:', companyName);
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/companies`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.data.success && response.data.data) {
            const companies = response.data.data;
            companyData = companies.find((company: any) => 
              company.name?.toLowerCase() === companyName.toLowerCase()
            );
            console.log('Found company by name:', companyData);
          }
        } catch (nameError) {
          console.log('Error searching companies by name:', nameError);
        }
      }
      
      if (companyData) {
        setSelectedCompany(companyData);
        setShowCompanyDetails(true);
      } else {
        console.error('Company not found by ID or name');
        alert('Company details could not be loaded. The company may not exist in the database.');
      }
    } catch (error: any) {
      console.error('Error fetching company details:', error);
      console.error('Error response:', error.response?.data);
      
      // Show user-friendly error message
      if (error.response?.status === 404) {
        alert('Company not found. The company may not exist in the database or the backend server needs to be restarted.');
      } else {
        alert('Failed to load company details. Please try again later.');
      }
    } finally {
      setLoadingCompany(false);
    }
  };

  // Fetch job seekers data from database
  const fetchJobSeekers = async () => {
    try {
      setLoading(true);
      console.log('Fetching job seekers...');
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      console.log('Auth token available:', !!token);
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Users API response:', response.data);
      
      // Filter for job seekers and transform the data
      const allUsers = response.data.data || response.data || [];
      console.log('All users count:', allUsers.length);
      
      const jobSeekers = allUsers.filter((user: any) => {
        const role = user.role;
        console.log(`User ${user.email} has role: ${role}`);
        return role === 'jobseeker' || role === 'user' || !role;
      });
      
      console.log('Job seekers found:', jobSeekers.length);
      
      const transformedData = jobSeekers.map((user: any) => ({
        id: user._id || user.id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User',
        email: user.email,
        phone: user.phone || 'N/A',
        avatar: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || 'User')}&background=02243b&color=fff`,
        location: user.location || 'N/A',
        resumeCount: user.resumes?.length || 0,
        atsScore: user.atsScore || Math.floor(Math.random() * 40) + 60, // Random score if not available
        plan: user.subscriptionPlan || 'Free',
        status: user.isActive === false ? 'Suspended' : (user.isEmailVerified ? 'Active' : 'Pending'),
        verified: user.isEmailVerified || false,
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never',
        totalApplications: user.applications?.length || 0,
      }));
      
      console.log('Transformed job seekers:', transformedData);
      setJobSeekersData(transformedData);
    } catch (error: any) {
      console.error('Error fetching job seekers:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setJobSeekersData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employers data from database
  const fetchEmployers = async () => {
    try {
      setLoading(true);
      console.log('Fetching employers...');
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      console.log('Auth token available:', !!token);
      
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Users API response for employers:', response.data);
      
      // Filter for employers and transform the data
      const allUsers = response.data.data || response.data || [];
      console.log('All users count:', allUsers.length);
      console.log('All users sample:', allUsers.slice(0, 2)); // Show first 2 users for debugging
      
      const employers = allUsers.filter((user: any) => {
        const role = user.role;
        console.log(`User ${user.email} has role: ${role}`);
        return role === 'employer';
      });
      
      console.log('Employers found:', employers.length);
      console.log('Employer sample data:', employers.slice(0, 1)); // Show first employer for debugging

      // Fetch all jobs to match with employers
      let allJobs = [];
      try {
        console.log('Fetching jobs data...');
        const jobsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        allJobs = jobsResponse.data.data || jobsResponse.data || [];
        console.log('Found jobs in DB:', allJobs.length);
      } catch (error) {
        console.log("Jobs endpoint not available, proceeding without job data:", error.message);
        allJobs = [];
      }
      
      const transformedData = employers.map((user: any) => {
        // Get company name from mapping or fallback
        const companyName = companyMapping[user.company] || user.companyName || user.name || 'Unknown Company';
        
        // Find jobs for this employer
        const employerJobs = allJobs.filter((job: any) =>
          job.employer === user._id ||
          job.employer?._id === user._id ||
          (typeof job.employer === 'string' && job.employer === user._id.toString())
        );

        console.log(`Employer ${user.email}: Found ${employerJobs.length} jobs`);

        // Sort jobs by creation date (newest first)
        employerJobs.sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const lastJob = employerJobs.length > 0 ? new Date(employerJobs[0].createdAt) : null;
        const lastJobPostedDate = lastJob && !isNaN(lastJob.getTime())
          ? lastJob.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Never";
        
        console.log(`Employer ${user.email}: company field = ${user.company}, companyName = ${user.companyName}, phone = ${user.phone}, mapped companyName = ${companyName}`);
        
        return {
        id: user._id || user.id,
        companyId: user.company, // Store the company ID separately
        logo: user.profilePicture || user.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || 'Company')}&background=02243b&color=fff`,
        companyName: companyName,
        adminContact: user.phone || user.contactPerson || user.name || 'N/A',
        email: user.email,
        jobsPosted: employerJobs.length,
        lastJobPosted: lastJobPostedDate,
        plan: user.subscriptionPlan || 'Basic',
        status: user.isActive === false ? 'Suspended' : (user.isEmailVerified ? 'Active' : 'Pending'),
        verified: user.isEmailVerified || false,
        kyc: user.kycStatus || (user.isVerified ? 'Verified' : 'Pending'),
        location: user.location || user.address || 'N/A',
        industry: user.industry || 'Not specified',
        companySize: user.companySize || 'Not specified',
        activeJobs: employerJobs.filter((job: any) => job.status === "published").length,
        joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        };
      });
      
      console.log('Transformed employers:', transformedData);
      setEmployersData(transformedData);
    } catch (error: any) {
      console.error('Error fetching employers:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setEmployersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch from admin endpoint first
        await fetchJobSeekers();
        await fetchEmployers();
      } catch (error) {
        console.error('Failed to fetch from admin endpoint, trying fallback...');
        // Fallback: try to fetch from regular users endpoint if admin fails
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/admin/list`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Fallback API response:', response.data);
          const allUsers = response.data.data || response.data || [];
          
          // Split users by role
          const jobSeekers = allUsers.filter((user: any) => 
            user.role === 'jobseeker' || user.role === 'user' || !user.role
          );
          const employers = allUsers.filter((user: any) => user.role === 'employer');
          
          // Fetch all jobs to match with employers (fallback)
          let allJobsFallback = [];
          try {
            console.log('Fetching jobs data (fallback)...');
            const jobsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/jobs`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            allJobsFallback = jobsResponse.data.data || jobsResponse.data || [];
            console.log('Found jobs in DB (fallback):', allJobsFallback.length);
          } catch (error) {
            console.log("Jobs endpoint not available in fallback, proceeding without job data:", error.message);
            allJobsFallback = [];
          }
          
          // Transform and set data
          const transformedJobSeekers = jobSeekers.map((user: any) => ({
            id: user._id || user.id,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Unknown User',
            email: user.email,
            phone: user.phone || 'N/A',
            avatar: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username || 'User')}&background=02243b&color=fff`,
            location: user.location || 'N/A',
            resumeCount: user.resumes?.length || 0,
            atsScore: user.atsScore || Math.floor(Math.random() * 40) + 60,
            plan: user.subscriptionPlan || 'Free',
            status: user.isActive === false ? 'Suspended' : (user.isEmailVerified ? 'Active' : 'Pending'),
            verified: user.isEmailVerified || false,
            joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never',
            totalApplications: user.applications?.length || 0,
          }));
          
          const transformedEmployers = employers.map((user: any) => {
            // Get company name from mapping or fallback
            const companyName = companyMapping[user.company] || user.companyName || user.name || 'Unknown Company';
            
            // Find jobs for this employer (fallback)
            const employerJobs = allJobsFallback.filter((job: any) =>
              job.employer === user._id ||
              job.employer?._id === user._id ||
              (typeof job.employer === 'string' && job.employer === user._id.toString())
            );

            console.log(`Fallback Employer ${user.email}: Found ${employerJobs.length} jobs`);

            // Sort jobs by creation date (newest first)
            employerJobs.sort((a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            const lastJob = employerJobs.length > 0 ? new Date(employerJobs[0].createdAt) : null;
            const lastJobPostedDate = lastJob && !isNaN(lastJob.getTime())
              ? lastJob.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Never";
            
            console.log(`Fallback Employer ${user.email}: company field = ${user.company}, companyName = ${user.companyName}, phone = ${user.phone}, mapped companyName = ${companyName}`);
            
            return {
            id: user._id || user.id,
            companyId: user.company, // Store the company ID separately
            logo: user.profilePicture || user.companyLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || 'Company')}&background=02243b&color=fff`,
            companyName: companyName,
            adminContact: user.phone || user.contactPerson || user.name || 'N/A',
            email: user.email,
            jobsPosted: employerJobs.length,
            lastJobPosted: lastJobPostedDate,
            plan: user.subscriptionPlan || 'Basic',
            status: user.isActive === false ? 'Suspended' : (user.isEmailVerified ? 'Active' : 'Pending'),
            verified: user.isEmailVerified || false,
            kyc: user.kycStatus || (user.isVerified ? 'Verified' : 'Pending'),
            location: user.location || user.address || 'N/A',
            industry: user.industry || 'Not specified',
            companySize: user.companySize || 'Not specified',
            activeJobs: employerJobs.filter((job: any) => job.status === "published").length,
            joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            };
          });
          
          setJobSeekersData(transformedJobSeekers);
          setEmployersData(transformedEmployers);
          console.log('Fallback successful - Job seekers:', transformedJobSeekers.length, 'Employers:', transformedEmployers.length);
          
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    };
    
    fetchData();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Suspended: "bg-red-100 text-red-800 border-red-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Paused: "bg-orange-100 text-orange-800 border-orange-200",
      "Needs Review": "bg-purple-100 text-purple-800 border-purple-200",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200"}>
        {status}
      </Badge>
    );
  };

  const PlanBadge = ({ plan }: { plan: string }) => {
    const variants = {
      Pro: "bg-purple-100 text-purple-800 border-purple-200",
      Free: "bg-gray-100 text-gray-800 border-gray-200",
      Basic: "bg-blue-100 text-blue-800 border-blue-200",
      Professional: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Enterprise: "bg-emerald-100 text-emerald-800 border-emerald-200",
    };

    return (
      <Badge className={variants[plan as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200"}>
        {plan}
      </Badge>
    );
  };

  const filteredJobSeekers = jobSeekersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPlan = filterPlan === "all" || user.plan.toLowerCase() === filterPlan.toLowerCase();
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const filteredEmployers = employersData.filter(employer => {
    const matchesSearch = employer.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employer.adminContact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || employer.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesPlan = filterPlan === "all" || employer.plan.toLowerCase() === filterPlan.toLowerCase();
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage job seekers and employer accounts on your platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            size="sm"
            style={{ backgroundColor: 'var(--admin-primary)', color: 'white' }}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Job Seekers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--admin-primary)' }}>
              {loading ? '...' : jobSeekersData.length}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--admin-secondary)' }}>
              {loading ? '...' : employersData.length}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: 'var(--admin-accent)' }}>
              {loading ? '...' : companiesData.length}
            </div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? '...' : [...jobSeekersData, ...employersData].filter(u => u.status === 'Pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : [...jobSeekersData, ...employersData].filter(u => u.status === 'Active').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Common Header Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="🔍 Search by Name, Email, ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPlan} onValueChange={setFilterPlan}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Plan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="last-active">Last Active</SelectItem>
                  <SelectItem value="most-jobs">Most Jobs Posted</SelectItem>
                  <SelectItem value="most-applications">Most Applications</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="seekers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Job Seekers ({filteredJobSeekers.length})
          </TabsTrigger>
          <TabsTrigger value="employers" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Employers ({filteredEmployers.length})
          </TabsTrigger>
          {/* <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Companies
          </TabsTrigger> */}
        </TabsList>

        {/* Job Seekers Tab */}
        <TabsContent value="seekers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profile</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Resume Count</TableHead>
                    <TableHead>ATS Score Avg</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobSeekers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetails(true);
                      }}
                    >
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {user.verified && (
                            <Shield className="h-4 w-4 text-green-600" title="Verified" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {user.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <button 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                            setShowResumeModal(true);
                          }}
                          title="View resumes"
                        >
                          {user.resumeCount} resumes
                        </button>
                      </TableCell>
                      <TableCell>
                        <div 
                          className="flex items-center gap-2" 
                          title={`Parsed ${user.resumeCount}/${user.resumeCount} resumes`}
                        >
                          <span className="text-sm font-medium">{user.atsScore}%</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                user.atsScore >= 90 ? 'bg-green-500' :
                                user.atsScore >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${user.atsScore}%` }}
                            ></div>
                          </div>
                        </div>
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
                              className="h-8 w-8 p-0"
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
                              {user.status === 'Active' ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend User
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Reactivate User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Upgrade Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
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
        </TabsContent>

        {/* Employers Tab */}
        <TabsContent value="employers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Admin Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Jobs Posted</TableHead>
                    <TableHead>Last Job Posted</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployers.map((employer) => (
                    <TableRow 
                      key={employer.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedUser(employer);
                        setShowUserDetails(true);
                      }}
                    >
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={employer.logo} />
                          <AvatarFallback>
                            {employer.companyName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{employer.companyName}</span>
                          {employer.kyc === 'Verified' ? (
                            <span className="text-green-600" title="Verified">🛡️</span>
                          ) : (
                            <span className="text-yellow-600" title="KYC Pending">⚠️</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{employer.adminContact}</TableCell>
                      <TableCell>{employer.email}</TableCell>
                      <TableCell>
                        <button 
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Open job listing overview
                          }}
                          title="View posted jobs"
                        >
                          {employer.jobsPosted} jobs
                        </button>
                        <div className="text-xs text-gray-500">{employer.activeJobs} active</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {employer.lastJobPosted === 'Never' ? 'Never' : new Date(employer.lastJobPosted).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PlanBadge plan={employer.plan} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={employer.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              console.log('Employer data:', employer);
                              console.log('Company ID:', employer.companyId);
                              console.log('Company field:', employer.company);
                              console.log('Company Name:', employer.companyName);
                              if (employer.companyId || employer.companyName) {
                                fetchCompanyDetails(employer.companyId, employer.companyName);
                              } else {
                                console.error('No company ID or name available for this employer');
                                alert('No company information available for this employer.');
                              }
                            }}>
                              <Building2 className="mr-2 h-4 w-4" />
                              View Company Page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Briefcase className="mr-2 h-4 w-4" />
                              See Posted Jobs
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              {employer.status === 'Active' ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend Employer
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Reactivate Employer
                                </>
                              )}
                            </DropdownMenuItem> */}
                            {/* <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Send Notification
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Upgrade/Downgrade Plan
                            </DropdownMenuItem> */}
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

        {/* Companies Tab */}
        {/* <TabsContent value="companies" className="space-y-4">
          <CompaniesTable />
        </TabsContent> */}
      </Tabs>

      {/* User Details Dialog */}
      {selectedUser && showUserDetails && (
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {'companyName' in selectedUser ? 'Company Profile' : 'User Profile'}
              </DialogTitle>
              <DialogDescription>
                View detailed information about this {'companyName' in selectedUser ? 'employer' : 'job seeker'}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar || selectedUser.logo} />
                  <AvatarFallback>
                    {(selectedUser.name || selectedUser.companyName).split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.name || selectedUser.companyName}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              {/* Additional details would go here */}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedUser && showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser.name || selectedUser.companyName}? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedUser(null);
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Resume Modal */}
      {selectedUser && showResumeModal && (
        <Dialog open={showResumeModal} onOpenChange={setShowResumeModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Resume Management</DialogTitle>
              <DialogDescription>
                Manage resumes for {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {Array.from({length: selectedUser.resumeCount}, (_, i) => (
                <div key={i} className="flex items-center justify-between p-2 border rounded">
                  <span>Resume {i + 1}.pdf</span>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Company Details Modal */}
      {selectedCompany && showCompanyDetails && (
        <Dialog open={showCompanyDetails} onOpenChange={setShowCompanyDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Company Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedCompany.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedCompany.logo?.url} />
                  <AvatarFallback>
                    {selectedCompany.name?.split(' ').map((n: string) => n[0]).join('') || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedCompany.name}</h3>
                  <p className="text-gray-600">{selectedCompany.email}</p>
                  <p className="text-sm text-gray-500">{selectedCompany.industry}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Company ID</label>
                  <p className="text-sm text-gray-900">{selectedCompany._id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{selectedCompany.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Website</label>
                  <p className="text-sm text-gray-900">
                    {selectedCompany.website ? (
                      <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {selectedCompany.website}
                      </a>
                    ) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-900">{selectedCompany.location || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Company Size</label>
                  <p className="text-sm text-gray-900">{selectedCompany.size || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Founded Year</label>
                  <p className="text-sm text-gray-900">{selectedCompany.foundedYear || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-900">{selectedCompany.description || 'No description available'}</p>
                </div>
                {/* <div>
                  <label className="text-sm font-medium text-gray-700">Verified</label>
                  <p className="text-sm text-gray-900">{selectedCompany.verified ? 'Yes' : 'No'}</p>
                </div> */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">
                    {selectedCompany.createdAt ? new Date(selectedCompany.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCompanyDetails(false)}>
                  Close
                </Button>
                {/* <Button style={{ backgroundColor: 'var(--admin-primary)', color: 'white' }}>
                  Edit Company
                </Button> */}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}