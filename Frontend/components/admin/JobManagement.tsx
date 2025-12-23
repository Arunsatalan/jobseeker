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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Briefcase,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Building2,
  Star,
  TrendingUp,
  AlertTriangle,
  Ban,
  PlayCircle,
  PauseCircle,
  Tag,
  Download,
  Upload,
  Settings,
  Plus,
  X,
} from "lucide-react";

export function JobManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<{id: string, name: string} | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCategoriesList(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Keep fallback categories if API fails
      }
    };

    fetchCategories();
  }, []);

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/jobs`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Transform API data to match component expectations
            const transformedJobs = data.data.map((job: any) => ({
              id: job._id,
              title: job.title,
              company: job.company,
              companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=02243b&color=fff`,
              location: job.location,
              type: job.employmentType,
              category: job.category,
              subcategory: job.industry,
              status: job.status === 'published' ? 'Live' : 
                     job.status === 'draft' ? 'Pending' : 
                     job.status === 'expired' ? 'Expired' : 
                     job.status === 'rejected' ? 'Rejected' : job.status,
              priority: 'Normal', // Default, could be enhanced later
              postedDate: job.createdAt,
              expiryDate: job.expiresAt,
              applicants: job.stats?.applications || 0,
              views: job.stats?.views || 0,
              salary: job.salaryMin && job.salaryMax ? 
                `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 
                'Salary not specified',
              remote: job.remote || false,
              urgent: false, // Default, could be enhanced later
              sponsored: false, // Default, could be enhanced later
              tags: job.tags || [],
              approvedBy: null, // Not available in current API
              approvedDate: null, // Not available in current API
            }));
            setJobs(transformedJobs);
          }
        } else {
          console.error('Failed to fetch jobs');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Live: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Rejected: "bg-red-100 text-red-800 border-red-200",
      Expired: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const icons = {
      Live: <CheckCircle className="w-3 h-3" />,
      Pending: <Clock className="w-3 h-3" />,
      Rejected: <XCircle className="w-3 h-3" />,
      Expired: <AlertTriangle className="w-3 h-3" />,
    };

    return (
      <Badge 
        className={`${variants[status as keyof typeof variants]} flex items-center gap-1 font-medium border`}
      >
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const PriorityBadge = ({ priority }: { priority: string }) => {
    const variants = {
      Featured: "bg-purple-100 text-purple-800 border-purple-200",
      Normal: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <Badge className={`${variants[priority as keyof typeof variants]} border font-medium`}>
        {priority === "Featured" && <Star className="w-3 h-3 mr-1" />}
        {priority}
      </Badge>
    );
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status.toLowerCase() === filterStatus;
    const matchesCategory = filterCategory === "all" || job.category === filterCategory;
    const matchesType = filterType === "all" || job.type === filterType;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  const jobStats = {
    total: jobs.length,
    live: jobs.filter(j => j.status === "Live").length,
    pending: jobs.filter(j => j.status === "Pending").length,
    rejected: jobs.filter(j => j.status === "Rejected").length,
    expired: jobs.filter(j => j.status === "Expired").length,
  };

  const handleApproveJob = (jobId: string) => {
    console.log("Approve job:", jobId);
    // Implementation for job approval
  };

  const handleRejectJob = (jobId: string) => {
    console.log("Reject job:", jobId);
    // Implementation for job rejection
  };

  const handleToggleFeatured = (jobId: string) => {
    console.log("Toggle featured:", jobId);
    // Implementation for toggling featured status
  };

  const handleDeleteJob = async (jobId: string) => {
    const reason = prompt('Please provide a reason for deleting this job (optional):', '');
    
    if (reason === null) {
      return; // User cancelled
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason || 'Administrative action',
        }),
      });

      if (response.ok) {
        // Refresh jobs list
        const jobsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/jobs`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (jobsResponse.ok) {
          const data = await jobsResponse.json();
          if (data.success && data.data) {
            const transformedJobs = data.data.map((job: any) => ({
              id: job._id,
              title: job.title,
              company: job.company,
              companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=02243b&color=fff`,
              location: job.location,
              type: job.employmentType,
              category: job.category,
              subcategory: job.industry,
              status: job.status === 'published' ? 'Live' : 
                     job.status === 'draft' ? 'Pending' : 
                     job.status === 'expired' ? 'Expired' : 
                     job.status === 'rejected' ? 'Rejected' : job.status,
              priority: 'Normal',
              postedDate: job.createdAt,
              expiryDate: job.expiresAt,
              applicants: job.stats?.applications || 0,
              views: job.stats?.views || 0,
              salary: job.salaryMin && job.salaryMax ? 
                `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : 
                'Salary not specified',
              remote: job.remote || false,
              urgent: false,
              sponsored: false,
              tags: job.tags || [],
              approvedBy: null,
              approvedDate: null,
            }));
            setJobs(transformedJobs);
          }
        }
        alert('Job deleted successfully. Notifications have been sent to the company and admin.');
      } else {
        console.error('Failed to delete job');
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchCategories(); // Refresh categories from database
          setNewCategoryName("");
        }
      } else {
        console.error('Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryToDelete: string) => {
    setLoading(true);
    try {
      // First get the category ID by name (this is a simplified approach)
      const categoriesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        const category = categoriesData.data.find((cat: any) => cat.name === categoryToDelete);

        if (category) {
          const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${category._id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (deleteResponse.ok) {
            await fetchCategories(); // Refresh categories from database
          } else {
            console.error('Failed to delete category');
          }
        }
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (category: any) => {
    setSelectedCategory({ id: category._id, name: category.name });
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${category._id}/subcategories`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSubcategories(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategory) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${selectedCategory.id}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: newSubcategoryName.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh subcategories
          await handleCategoryClick({ _id: selectedCategory.id, name: selectedCategory.name });
          setNewCategoryName("");
        }
      } else {
        console.error('Failed to add subcategory');
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/categories/${selectedCategory?.id}/subcategories/${subcategoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Refresh subcategories
        if (selectedCategory) {
          await handleCategoryClick({ _id: selectedCategory.id, name: selectedCategory.name });
        }
      } else {
        console.error('Failed to delete subcategory');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Job Management</h2>
          <p className="text-gray-600 mt-1">
            Control job listings, approvals, and moderation across your platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Jobs
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="shadow-sm"
            onClick={() => setShowCategoriesModal(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Categories
          </Button>
          <Button 
            size="sm"
            className="shadow-sm bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{jobStats.total}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% this month
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Live Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{jobStats.live}</div>
            <div className="text-xs text-green-600 mt-1">Currently active</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{jobStats.pending}</div>
            <div className="text-xs text-yellow-600 mt-1">Awaiting approval</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{jobStats.rejected}</div>
            <div className="text-xs text-red-600 mt-1">Need revision</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{jobStats.expired}</div>
            <div className="text-xs text-gray-600 mt-1">Past deadline</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs by title, company, or keywords..."
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
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 border-gray-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesList.map(cat => (
                  <SelectItem key={cat._id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 border-gray-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
                <SelectItem value="Part-time">Part-time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Job Listings</CardTitle>
            <div className="text-sm text-gray-500">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="font-semibold text-gray-700">Job Details</TableHead>
                  <TableHead className="font-semibold text-gray-700">Company</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Priority</TableHead>
                  <TableHead className="font-semibold text-gray-700">Applications</TableHead>
                  <TableHead className="font-semibold text-gray-700">Posted Date</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tags</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow 
                    key={job.id} 
                    className="border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowJobDetails(true);
                    }}
                  >
                    <TableCell className="py-4">
                      <div>
                        <div className="font-semibold text-gray-900 hover:text-slate-700 transition-colors">
                          {job.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                          <span className="text-green-600 font-medium">{job.salary}</span>
                          {job.remote && (
                            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                              Remote
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-gray-200">
                          <AvatarImage src={job.companyLogo} alt={job.company} />
                          <AvatarFallback>{job.company[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{job.company}</div>
                          <div className="text-xs text-gray-500">{job.category}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>
                    
                    <TableCell>
                      <PriorityBadge priority={job.priority} />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold text-gray-900">{job.applicants}</div>
                        <div className="text-xs text-gray-500">
                          {job.views} views
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-sm text-gray-600">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-32">
                        {job.tags.slice(0, 2).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs border-gray-200 text-gray-600"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {job.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs border-gray-200 text-gray-500">
                            +{job.tags.length - 2}
                          </Badge>
                        )}
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
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job);
                            setShowJobDetails(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Job
                          </DropdownMenuItem> */}
                          {/* {job.status === "Pending" && (
                            <>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveJob(job.id);
                                }}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectJob(job.id);
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Star className="mr-2 h-4 w-4" />
                            Toggle Featured
                          </DropdownMenuItem>
                          <DropdownMenuSeparator /> */}
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJob(job.id);
                            }}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Delete Job
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

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">{selectedJob.title}</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Posted by {selectedJob.company} • Job ID: {selectedJob.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Job Overview */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Job Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={selectedJob.status} />
                        <PriorityBadge priority={selectedJob.priority} />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{selectedJob.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{selectedJob.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Salary:</span>
                          <span className="font-medium text-green-600">{selectedJob.salary}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedJob.category}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Applications:</span>
                          <span className="font-bold text-lg">{selectedJob.applicants}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Views:</span>
                          <span className="font-medium">{selectedJob.views}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Posted:</span>
                          <span className="font-medium">{new Date(selectedJob.postedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expires:</span>
                          <span className="font-medium">{new Date(selectedJob.expiryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tags and Features */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tags & Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-gray-300">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Switch checked={selectedJob.remote} />
                          <span className="text-gray-600">Remote Work</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={selectedJob.urgent} />
                          <span className="text-gray-600">Urgent Hiring</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={selectedJob.sponsored} />
                          <span className="text-gray-600">Sponsored</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Audit Trail */}
                {selectedJob.approvedBy && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Audit Trail</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Approved by:</span>
                          <span className="font-medium">{selectedJob.approvedBy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Approved on:</span>
                          <span className="font-medium">{new Date(selectedJob.approvedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowJobDetails(false)}>
                  Close
                </Button>
                {selectedJob.status === "Pending" && (
                  <>
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleRejectJob(selectedJob.id)}
                    >
                      Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveJob(selectedJob.id)}
                    >
                      Approve Job
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Categories Management Modal */}
      <Dialog open={showCategoriesModal} onOpenChange={setShowCategoriesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Manage Categories</DialogTitle>
            <DialogDescription>
              View and manage all job categories available on the platform.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Add New Category Section */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Add New Category</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <Button 
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                  className="bg-slate-600 hover:bg-slate-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Subcategories Section */}
            {selectedCategory && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Subcategories for "{selectedCategory.name}"
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="text-slate-700 hover:text-slate-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Add Subcategory */}
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Enter subcategory name..."
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory()}
                  />
                  <Button 
                    onClick={handleAddSubcategory}
                    disabled={!newSubcategoryName.trim() || loading}
                    className="bg-slate-600 hover:bg-slate-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sub
                  </Button>
                </div>

                {/* Subcategories List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {subcategories.map((subcategory) => (
                    <div
                      key={subcategory._id}
                      className="flex items-center justify-between p-2 bg-white rounded border border-slate-200"
                    >
                      <span className="text-sm text-gray-900">{subcategory.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubcategory(subcategory._id)}
                        disabled={loading}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categoriesList.map((category) => (
                <div
                  key={category._id}
                  className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors group cursor-pointer ${
                    selectedCategory?.id === category._id ? 'ring-2 ring-slate-500 bg-slate-50' : ''
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {category.subcategories?.length || 0} sub
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.name);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoriesModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}