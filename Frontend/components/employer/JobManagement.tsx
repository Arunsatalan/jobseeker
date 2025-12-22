"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  Users,
  Eye,
  Edit3,
  Copy,
  Pause,
  Play,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  postedDate: string;
  expiryDate: string;
  applicantsCount: number;
  status: "Open" | "Closed" | "Draft" | "Paused";
}

interface JobManagementProps {
  jobs: Job[];
  onPostJob: () => void;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDuplicate: (job: Job) => void;
  onToggleStatus: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

export function JobManagement({
  jobs,
  onPostJob,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete
}: JobManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-700";
      case "Paused":
        return "bg-yellow-100 text-yellow-700";
      case "Closed":
        return "bg-gray-100 text-gray-700";
      case "Draft":
        return "bg-slate-100 text-slate-900";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const jobsByStatus = {
    all: jobs,
    open: jobs.filter(job => job.status === "Open"),
    paused: jobs.filter(job => job.status === "Paused"),
    draft: jobs.filter(job => job.status === "Draft"),
    closed: jobs.filter(job => job.status === "Closed"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600">Manage all your job postings and track applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={onPostJob} className="text-white" style={{ backgroundColor: '#02243b' }}>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search jobs by title or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Jobs Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({jobs.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({jobsByStatus.open.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({jobsByStatus.paused.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({jobsByStatus.draft.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({jobsByStatus.closed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <JobList
            jobs={filteredJobs}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        </TabsContent>
        <TabsContent value="open">
          <JobList
            jobs={jobsByStatus.open.filter(job =>
              job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              job.department.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        </TabsContent>
        <TabsContent value="paused">
          <JobList
            jobs={jobsByStatus.paused.filter(job =>
              job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              job.department.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        </TabsContent>
        <TabsContent value="draft">
          <JobList
            jobs={jobsByStatus.draft.filter(job =>
              job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              job.department.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        </TabsContent>
        <TabsContent value="closed">
          <JobList
            jobs={jobsByStatus.closed.filter(job =>
              job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              job.department.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            onView={onView}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface JobListProps {
  jobs: Job[];
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onDuplicate: (job: Job) => void;
  onToggleStatus: (job: Job) => void;
  onDelete: (jobId: string) => void;
}

function JobList({
  jobs,
  onView,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete
}: JobListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-700";
      case "Paused":
        return "bg-yellow-100 text-yellow-700";
      case "Closed":
        return "bg-gray-100 text-gray-700";
      case "Draft":
        return "bg-slate-100 text-slate-900";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (jobs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-600 mb-6">No jobs match your current filters. Try adjusting your search criteria.</p>
        <Button variant="outline">
          Clear Filters
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {job.postedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Expires {job.expiryDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium text-blue-600">{job.applicantsCount} applicants</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onView(job)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" onClick={() => onEdit(job)}>
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => onDuplicate(job)}>
                <Copy className="h-4 w-4 mr-1" />
                Duplicate
              </Button>
              {job.status === "Open" ? (
                <Button size="sm" variant="outline" className="text-yellow-600 hover:text-yellow-700" onClick={() => onToggleStatus(job)}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              ) : job.status === "Paused" ? (
                <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => onToggleStatus(job)}>
                  <Play className="h-4 w-4 mr-1" />
                  Activate
                </Button>
              ) : null}
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onDelete(job.id)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}