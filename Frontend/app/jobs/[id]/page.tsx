"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
    MapPin,
    DollarSign,
    Briefcase,
    Calendar,
    Building2,
    ArrowLeft,
    Share2,
    Bookmark,
    Globe,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import ApplicationModal from "@/components/job-search/ApplicationModal";
import { useAuth } from "@/contexts/AuthContext";

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { user, isAuthenticated } = useAuth();

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchJobDetails();
        }
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/jobs/${id}`);

            // Handle different response structures
            const jobData = response.data.data || response.data.job || response.data;
            setJob(jobData);
        } catch (err: any) {
            console.error("Error fetching job details:", err);
            setError(err.response?.data?.message || "Failed to load job details. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = () => {
        if (!isAuthenticated) {
            // Redirect to login if not authenticated, storing return url ideally
            router.push('/login?redirect=/jobs/' + id);
            return;
        }
        setIsApplicationModalOpen(true);
    };

    const handleApplicationSubmit = async (data: any) => {
        console.log("Application submitted:", data);
        // The actual submission logic is inside ApplicationModal, but we can handle post-submission here if needed
        setIsApplicationModalOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="w-full max-w-5xl px-6 py-12 space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-12 w-3/4" />
                        <div className="flex gap-4">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-24" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                        <div className="lg:col-span-1">
                            <Skeleton className="h-96 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
                <p className="text-gray-600 mb-6 max-w-md">{error || "The job you are looking for does not exist or has been removed."}</p>
                <Button onClick={() => router.push('/jobs')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
                </Button>
            </div>
        );
    }

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return "Recently";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper to get company name safely
    const getCompanyName = (company: any) => {
        if (typeof company === 'string') return company;
        return company?.name || "Unknown Company";
    };

    // Prepare user profile object for ApplicationModal
    const userProfileForModal = user ? {
        name: user.name || "",
        email: user.email || "",
        phone: (user as any).phone || "",
        location: (user as any).location || "",
        summary: (user as any).profileSummary || (user as any).summary || "",
        skills: (user as any).skills?.map((s: any) => typeof s === 'string' ? s : s.name) || [],
        experience: (user as any).experience || [],
        education: (user as any).education || [],
    } : undefined;

    // Prepare job object for ApplicationModal
    const jobForModal = {
        id: job._id,
        title: job.title,
        company: getCompanyName(job.company),
        location: job.location,
        description: job.description,
        requirements: job.requirements || [],
        skills: job.skills || [],
        salary: job.salaryMin && job.salaryMax
            ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
            : job.salaryMin ? `${job.salaryMin.toLocaleString()}+` : undefined
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" title="Share">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Save Job">
                            <Bookmark className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hero Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-8 lg:py-12">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-6 md:items-start md:justify-between">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    {/* Company Logo Placeholder */}
                                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 text-2xl font-bold border border-amber-200 shadow-sm">
                                        {getCompanyName(job.company).charAt(0)}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
                                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                                            <span className="font-medium text-amber-700">{getCompanyName(job.company)}</span>
                                            <span>•</span>
                                            <span className="text-sm">Posted {formatDate(job.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-4">
                                    <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5 text-gray-500" />
                                        {job.location}
                                    </Badge>
                                    <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
                                        <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                                        {job.employmentType || job.jobType || "Full-time"}
                                    </Badge>
                                    {(job.salaryMin || job.salaryMax) && (
                                        <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                                            <DollarSign className="h-3.5 w-3.5" />
                                            {job.salaryMin && job.salaryMax
                                                ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                                                : job.salaryMin ? `${job.salaryMin.toLocaleString()}+` : `Up to ${job.salaryMax?.toLocaleString()}`}
                                        </Badge>
                                    )}
                                    {(job.isRemote || job.remote) && (
                                        <Badge variant="outline" className="px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">
                                            Remote
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full md:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full md:w-48 bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg shadow-amber-200/50 transition-all hover:-translate-y-0.5"
                                    onClick={handleApply}
                                    disabled={isApplying}
                                >
                                    Apply Now
                                </Button>
                                <Button variant="outline" className="w-full md:w-48">
                                    View Company Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About the Job</h2>
                            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </section>

                        {/* Responsibilities */}
                        {job.responsibilities && job.responsibilities.length > 0 && (
                            <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Key Responsibilities</h2>
                                <ul className="space-y-3">
                                    {job.responsibilities.map((item: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                                            <span className="text-gray-600">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        {/* Requirements / Skills */}
                        <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements & Skills</h2>

                            {job.skills && job.skills.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Tech Stack & Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="px-3 py-1.5 text-sm border-gray-300 text-gray-700 bg-gray-50">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {job.requirements && job.requirements.length > 0 && (
                                <ul className="space-y-3 mt-4">
                                    {job.requirements.map((req: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                            <span className="text-gray-600">{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                <CardTitle className="text-lg">Job Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Date Posted</p>
                                        <p className="text-sm text-gray-500">{formatDate(job.createdAt)}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Experience Level</p>
                                        <p className="text-sm text-gray-500">{job.experienceLevel || job.experience || "Not specified"}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start gap-3">
                                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Industry</p>
                                        <p className="text-sm text-gray-500">{job.industry || "General"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* About Company Widget */}
                        <Card className="border-gray-200 shadow-sm overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-gray-800 to-gray-900 relative">
                                {/* Decorative circles */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                            </div>
                            <CardContent className="pt-0 relative">
                                <div className="h-16 w-16 -mt-8 mb-3 rounded-xl bg-white p-1 shadow-md mx-auto">
                                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold text-gray-600">
                                        {getCompanyName(job.company).charAt(0)}
                                    </div>
                                </div>
                                <div className="text-center mb-6">
                                    <h3 className="font-bold text-gray-900">{getCompanyName(job.company)}</h3>
                                    <p className="text-sm text-gray-500">{job.location}</p>
                                    <Button variant="link" className="text-amber-600 h-auto p-0 text-xs mt-1">
                                        Visit Website <ExternalLinkIcon />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center text-sm border-t border-gray-100 pt-4">
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Company Size</p>
                                        <p className="font-medium text-gray-900">{job.companySize || job.company?.size || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Founded</p>
                                        <p className="font-medium text-gray-900">{job.founded || "N/A"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>

            {/* AI Application Modal */}
            {isApplicationModalOpen && user && (
                <ApplicationModal
                    job={jobForModal}
                    isOpen={isApplicationModalOpen}
                    onClose={() => setIsApplicationModalOpen(false)}
                    onSubmit={handleApplicationSubmit}
                    userProfile={userProfileForModal}
                    isAuthenticated={isAuthenticated}
                />
            )}
        </div>
    );
}

function ExternalLinkIcon() {
    return (
        <svg className="ml-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
    )
}
