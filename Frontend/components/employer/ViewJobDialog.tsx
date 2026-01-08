import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, MapPin, DollarSign, Clock, Briefcase, Users } from "lucide-react";

interface Job {
    id: string;
    title: string;
    department: string; // Industry/Category
    postedDate: string;
    expiryDate: string;
    applicantsCount: number;
    status: "Open" | "Closed" | "Draft" | "Paused";
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryPeriod?: string;
    employmentType?: string;
    description?: string;
    requirements?: string[];
    skills?: string[];
    benefits?: string[];
    customSections?: { title: string; content: string }[];
}

interface ViewJobDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    job: Job | null;
}

export function ViewJobDialog({ open, onOpenChange, job }: ViewJobDialogProps) {
    if (!job) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Open": return "bg-green-100 text-green-700";
            case "Paused": return "bg-yellow-100 text-yellow-700";
            case "Closed": return "bg-gray-100 text-gray-700";
            case "Draft": return "bg-slate-100 text-slate-900";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle className="text-2xl font-bold text-gray-900">{job.title}</DialogTitle>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                    </div>
                    <DialogDescription className="flex items-center gap-2 text-gray-500 mt-2">
                        <Building2 className="h-4 w-4" />
                        <span>{job.department}</span>
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4" />
                        <span>{job.location || "Location not specified"}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Key Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-1">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" /> Salary
                            </span>
                            <p className="font-medium text-gray-900">
                                {job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : "N/A"} -
                                {job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : "N/A"}
                                <span className="text-sm text-gray-500 font-normal"> / {job.salaryPeriod || "year"}</span>
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Briefcase className="h-3 w-3" /> Type
                            </span>
                            <p className="font-medium text-gray-900 capitalize">{job.employmentType || "Full-time"}</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Users className="h-3 w-3" /> Applicants
                            </span>
                            <p className="font-medium text-blue-600">{job.applicantsCount} active</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Posted
                            </span>
                            <p className="font-medium text-gray-900">{job.postedDate}</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Expires
                            </span>
                            <p className="font-medium text-gray-900">{job.expiryDate}</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Description</h3>
                        <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                            {job.description || "No description provided."}
                        </div>
                    </div>

                    {/* Requirements */}
                    {job.requirements && job.requirements.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Requirements</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                {job.requirements.map((req, index) => (
                                    <li key={index}>{req}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Benefits - (Mapped from tags currently or specific field) */}
                    {job.benefits && job.benefits.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Benefits</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                {job.benefits.map((benefit, index) => (
                                    <li key={index}>{benefit}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Custom Sections */}
                    {job.customSections && job.customSections.map((section, index) => (
                        <div key={index} className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">{section.title}</h3>
                            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                                {section.content}
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
