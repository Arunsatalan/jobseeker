"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Edit,
  AlertTriangle,
  Mail,
  CheckCircle,
  Clock,
  Search,
  Filter,
} from "lucide-react";

interface Company {
  id: string;
  logo: string;
  companyName: string;
  adminContact: string;
  phone: string;
  email: string;
  jobsPosted: number;
  activeJobs: number;
  lastJobPosted: string;
  plan: string;
  status: string;
  verified: boolean;
  location?: string;
  industry?: string;
  joinDate?: string;
}

export function CompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch companies/employers from backend
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // First, get all users to find employers
      const usersResponse = await axios.get("http://localhost:5000/api/v1/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const allUsers = usersResponse.data.data || usersResponse.data || [];
      const employers = allUsers.filter((user: any) => user.role === "employer");

      console.log('Found employers:', employers.length);

      // Get all companies from companies collection
      let allCompanies = [];
      try {
        const companiesResponse = await axios.get("http://localhost:5000/api/v1/companies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        allCompanies = companiesResponse.data.data || companiesResponse.data || [];
        console.log('Found companies in DB:', allCompanies.length);
        allCompanies.forEach(comp => console.log(`  - ${comp.name} (${comp.email})`));
      } catch (error) {
        console.log("Companies endpoint not available, proceeding without company data:", error.message);
        allCompanies = [];
      }

      // Get all jobs to match with employers
      let allJobs = [];
      try {
        const jobsResponse = await axios.get("http://localhost:5000/api/v1/jobs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        allJobs = jobsResponse.data.data || jobsResponse.data || [];
        console.log('Found jobs in DB:', allJobs.length);
      } catch (error) {
        console.log("Jobs endpoint not available, proceeding without job data:", error.message);
        allJobs = [];
      }

      // Enrich employer data with company information and job postings
      const enrichedCompanies = employers.map((employer: any) => {
        // Find matching company by email (since IDs might not match)
        const company = allCompanies.find((comp: any) =>
          comp.email === employer.email ||
          comp._id === employer._id ||
          comp.contactEmail === employer.email
        );

        console.log(`Employer ${employer.email}: Found company match:`, !!company);

        // Find jobs for this employer
        const employerJobs = allJobs.filter((job: any) =>
          job.employer === employer._id ||
          job.employer?._id === employer._id ||
          (typeof job.employer === 'string' && job.employer === employer._id.toString())
        );

        console.log(`Employer ${employer.email}: Found ${employerJobs.length} jobs`);

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

        return {
          id: employer._id,
          logo:
            company?.logo?.url ||
            employer.profilePicture ||
            employer.companyLogo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              (company?.name || employer.companyName || employer.name || "Company")
            )}&background=02243b&color=fff`,
          companyName: company?.name || employer.companyName || employer.name || "Unknown Company",
          adminContact: company?.contactPerson || employer.contactPerson || employer.name || "N/A",
          phone: company?.phone || employer.phone || "N/A",
          email: employer.email,
          jobsPosted: employerJobs.length,
          activeJobs: employerJobs.filter((job: any) => job.status === "published").length,
          lastJobPosted: lastJobPostedDate,
          plan: employer.subscriptionPlan || "Basic",
          status:
            employer.isActive === false
              ? "Suspended"
              : employer.isEmailVerified
                ? "Active"
                : "Pending",
          verified: employer.isEmailVerified || false,
          location: company?.location || employer.location || employer.address || "N/A",
          industry: company?.industry || employer.industry || "Not specified",
          joinDate: employer.createdAt
            ? new Date(employer.createdAt).toLocaleDateString()
            : "N/A",
        };
      });

      console.log('Enriched companies:', enrichedCompanies);
      setCompanies(enrichedCompanies);

      // If no data was fetched, provide sample data for testing
      if (enrichedCompanies.length === 0) {
        console.log('No data fetched from API, using sample data for testing');
        const sampleData = [
          {
            id: "694981060212935e26201eb8",
            logo: "https://ui-avatars.com/api/?name=spyboy3&background=02243b&color=fff",
            companyName: "spyboy3",
            adminContact: "N/A",
            phone: "+94701149548",
            email: "spyboy00000@gmail.com",
            jobsPosted: 3,
            activeJobs: 3,
            lastJobPosted: "Dec 23, 2025",
            plan: "Basic",
            status: "Pending",
            verified: false,
            location: "N/A",
            industry: "Not specified",
            joinDate: "Dec 22, 2025",
          }
        ];
        setCompanies(sampleData);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Filter companies
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.adminContact.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || company.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Suspended: "bg-red-100 text-red-800 border-red-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] ||
          "bg-gray-100 text-gray-800 border-gray-200"
        }
      >
        {status}
      </Badge>
    );
  };

  const PlanBadge = ({ plan }: { plan: string }) => {
    const variants = {
      Pro: "bg-purple-100 text-purple-800 border-purple-200",
      Premium: "bg-blue-100 text-blue-800 border-blue-200",
      Basic: "bg-gray-100 text-gray-800 border-gray-200",
      Enterprise: "bg-indigo-100 text-indigo-800 border-indigo-200",
    };

    return (
      <Badge
        className={
          variants[plan as keyof typeof variants] ||
          "bg-gray-100 text-gray-800 border-gray-200"
        }
      >
        {plan}
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b bg-linear-to-r from-slate-50 to-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Companies & Employers
          </CardTitle>
          <div className="text-sm text-slate-600">
            Total: <span className="font-semibold">{filteredCompanies.length}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by company name, email, or contact..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:border-slate-300"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500">Loading companies...</div>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500">No companies found</div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-semibold text-slate-700">Logo</TableHead>
                  <TableHead className="font-semibold text-slate-700">Company Name</TableHead>
                  <TableHead className="font-semibold text-slate-700">Admin Contact</TableHead>
                  <TableHead className="font-semibold text-slate-700">Email</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">
                    Jobs Posted
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">Last Job Posted</TableHead>
                  <TableHead className="font-semibold text-slate-700">Plan</TableHead>
                  <TableHead className="font-semibold text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    {/* Logo */}
                    <TableCell>
                      <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src={company.logo} alt={company.companyName} />
                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {company.companyName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Company Name */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {company.companyName}
                        </span>
                        {!company.verified && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>

                    {/* Admin Contact */}
                    <TableCell className="text-slate-700">
                      <div className="flex flex-col">
                        <span>{company.adminContact}</span>
                        {company.phone && company.phone !== "N/A" && (
                          <span className="text-xs text-slate-500">{company.phone}</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Email */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-700">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {company.email}
                      </div>
                    </TableCell>

                    {/* Jobs Posted */}
                    <TableCell className="text-right">
                      <div className="font-semibold text-slate-900">
                        {company.jobsPosted} jobs
                      </div>
                      <div className="text-xs text-slate-500">
                        {company.activeJobs} active
                      </div>
                    </TableCell>

                    {/* Last Job Posted */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-700">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {company.lastJobPosted}
                      </div>
                    </TableCell>

                    {/* Plan */}
                    <TableCell>
                      <PlanBadge plan={company.plan} />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={company.status} />
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowDetailsDialog(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Company Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
            <DialogDescription>
              View detailed information about the company
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4 pb-4 border-b">
                <Avatar className="h-16 w-16 border-2 border-slate-200">
                  <AvatarImage src={selectedCompany.logo} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-500 text-white text-lg font-semibold">
                    {selectedCompany.companyName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedCompany.companyName}
                  </h3>
                  <p className="text-sm text-slate-600">{selectedCompany.location}</p>
                  <div className="mt-2 flex gap-2">
                    <StatusBadge status={selectedCompany.status} />
                    <PlanBadge plan={selectedCompany.plan} />
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Admin Contact
                  </label>
                  <p className="text-slate-900">{selectedCompany.adminContact}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Phone</label>
                  <p className="text-slate-900">{selectedCompany.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <p className="text-slate-900">{selectedCompany.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Total Jobs Posted
                  </label>
                  <p className="text-slate-900">{selectedCompany.jobsPosted}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Active Jobs
                  </label>
                  <p className="text-slate-900">{selectedCompany.activeJobs}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Last Job Posted
                  </label>
                  <p className="text-slate-900">{selectedCompany.lastJobPosted}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Industry
                  </label>
                  <p className="text-slate-900">{selectedCompany.industry}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">
                    Join Date
                  </label>
                  <p className="text-slate-900">{selectedCompany.joinDate}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                <Button>Edit Company</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
