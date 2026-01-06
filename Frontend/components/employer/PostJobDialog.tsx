"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PostJobDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    jobToEdit?: any;
    mode?: 'create' | 'edit' | 'duplicate';
}

export function PostJobDialog({ open, onOpenChange, onSuccess, jobToEdit, mode = 'create' }: PostJobDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [industries, setIndustries] = useState<any[]>([]); // Categories from DB
    const [categories, setCategories] = useState<any[]>([]); // Subcategories from DB
    const [companies, setCompanies] = useState<any[]>([]); // Companies from DB
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isNewCompany, setIsNewCompany] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState("");
    const [showValidationErrors, setShowValidationErrors] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        company: "",
        location: "",
        workMode: "onsite", // Replaced remote boolean with workMode enum
        employmentType: "full-time",
        experience: "mid",
        salaryMin: "",
        salaryMax: "",
        salaryPeriod: "yearly",
        industry: "", // Stores Category ID
        category: "", // Stores Subcategory ID
        description: "",
        requirements: "",
        skills: "",
        benefits: "",
        deadline: "",

        status: "published",
        customSections: [] as { title: string; content: string }[],
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if (field === "industry") {
            // When industry changes, fetch subcategories
            fetchSubcategories(value);
            setFormData(prev => ({ ...prev, category: "" })); // Reset category
            setIsNewCategory(false);
        }

        if (field === "category") {
            if (value === "other") {
                setIsNewCategory(true);
            } else {
                setIsNewCategory(false);
            }
        }

        if (field === "company") {
            if (value === "other") {
                setIsNewCompany(true);
            } else {
                setIsNewCompany(false);
            }
        }
    };

    const fetchIndustries = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/v1/categories`);
            if (res.data.success) {
                setIndustries(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch industries", error);
        }
    };

    const fetchCompanies = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/v1/companies`);
            if (res.data.success) {
                setCompanies(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch companies", error);
        }
    };

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const res = await axios.get(`${apiUrl}/api/v1/categories/${categoryId}/subcategories`);
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch subcategories", error);
            setCategories([]);
        }
    };

    const addCustomSection = () => {
        setFormData(prev => ({
            ...prev,
            customSections: [...prev.customSections, { title: "", content: "" }]
        }));
    };

    const removeCustomSection = (index: number) => {
        setFormData(prev => ({
            ...prev,
            customSections: prev.customSections.filter((_, i) => i !== index)
        }));
    };

    const updateCustomSection = (index: number, field: "title" | "content", value: string) => {
        const newSections = [...formData.customSections];
        newSections[index][field] = value;
        setFormData(prev => ({
            ...prev,
            customSections: newSections
        }));
    };

    useEffect(() => {
        if (open) {
            fetchIndustries();
            fetchCompanies();
        }
    }, [open]);

    useEffect(() => {
        if (open && companies.length > 0) {
            if (jobToEdit && (mode === 'edit' || mode === 'duplicate')) {
                // Populate form with job data
                setFormData({
                    title: mode === 'duplicate' ? `${jobToEdit.title} (Copy)` : jobToEdit.title,
                    company: jobToEdit.company?._id || jobToEdit.company || "", // Handle populated company object or string
                    industry: jobToEdit.industry,
                    category: jobToEdit.category,
                    location: jobToEdit.location,
                    workMode: jobToEdit.workMode || "onsite",
                    description: jobToEdit.description,
                    employmentType: jobToEdit.employmentType || "full-time",
                    experience: jobToEdit.experience || "mid",
                    salaryMin: jobToEdit.salaryMin?.toString() || "",
                    salaryMax: jobToEdit.salaryMax?.toString() || "",
                    salaryPeriod: jobToEdit.salaryPeriod || "yearly",
                    requirements: jobToEdit.requirements?.join("\n") || "",
                    skills: jobToEdit.skills?.join(", ") || "",
                    benefits: jobToEdit.tags?.join("\n") || "", // Mapping tags back to benefits
                    deadline: jobToEdit.expiresAt ? new Date(jobToEdit.expiresAt).toISOString().split('T')[0] : "",
                    status: mode === 'duplicate' ? 'published' : (jobToEdit.status === 'Open' ? 'published' : jobToEdit.status), // Reset status for duplicate
                    customSections: jobToEdit.customSections || [],
                });
                // Handle company selection - check if company exists in database
                const companyId = jobToEdit.company?._id || jobToEdit.company || "";
                const companyName = jobToEdit.company?.name || jobToEdit.company || "";
                const existingCompany = companies.find(c => c._id === companyId);
                if (!existingCompany && companyName) {
                    setIsNewCompany(true);
                    setNewCompanyName(companyName);
                    setFormData(prev => ({ ...prev, company: "other" }));
                }
                // Assuming industry/category are names from backend, no need to set ID-based states effectively
            }
        }
    }, [open, jobToEdit, mode, companies]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const isTitleValid = !!formData.title;
        const isLocationValid = !!formData.location;
        const isDescValid = !!formData.description;
        const isIndustryValid = !!formData.industry;

        const isCompanyValid = !!formData.company && (formData.company !== 'other' || !!newCompanyName);
        const isCategoryValid = !!formData.category && (formData.category !== 'other' || !!newCategoryName);

        if (!isTitleValid || !isLocationValid || !isDescValid || !isIndustryValid || !isCompanyValid || !isCategoryValid) {
            setShowValidationErrors(true);
            toast({
                title: "Missing Required Fields",
                description: "Please fill in all mapped required fields highlighted in red.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast({
                    title: "Authentication Error",
                    description: "You must be logged in to post a job.",
                    variant: "destructive",
                });
                return;
            }

            let finalCategoryId = formData.category;
            let finalCompanyId = formData.company;

            // Handle new company creation first
            if (isNewCompany && newCompanyName) {
                try {
                    const newCompanyRes = await axios.post(`${apiUrl}/api/v1/companies`, {
                        name: newCompanyName,
                        description: "Company created during job posting"
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (newCompanyRes.data.success) {
                        finalCompanyId = newCompanyRes.data.data._id;
                        // Just in case the API structure is different, check response
                        if (!finalCompanyId && newCompanyRes.data.data.id) finalCompanyId = newCompanyRes.data.data.id;
                    }
                } catch (companyError: any) {
                    toast({
                        title: "Error Creating Company",
                        description: companyError.response?.data?.message || "Could not create new company.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }
            }

            // Handle new category creation
            if (isNewCategory && newCategoryName) {
                try {
                    const newCatRes = await axios.post(`${apiUrl}/api/v1/categories/${formData.industry}/subcategories`, {
                        name: newCategoryName,
                        description: "User created category"
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (newCatRes.data.success) {
                        finalCategoryId = newCatRes.data.data._id; // Assuming API returns created object with _id
                        // Just in case the API structure is different, check response
                        if (!finalCategoryId && newCatRes.data.data.id) finalCategoryId = newCatRes.data.data.id;
                    }
                } catch (catError: any) {
                    toast({
                        title: "Error Creating Category",
                        description: catError.response?.data?.message || "Could not create new category.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }
            }

            // Convert requirements to array if it's a newline separated string
            // For now submitting as is or splitting? Model expects [String].
            const requirementsArray = formData.requirements
                .split('\n')
                .map(req => req.trim())
                .filter(req => req.length > 0);

            const skillsArray = formData.skills
                .split(',')
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0);

            const benefitsArray = formData.benefits
                .split('\n')
                .map(benefit => benefit.trim())
                .filter(benefit => benefit.length > 0);

            // Find names instead of IDs for the backend Job model
            const selectedIndustry = industries.find(ind => ind._id === formData.industry)?.name || formData.industry;
            let selectedCategory = isNewCategory ? newCategoryName : (categories.find(cat => cat._id === finalCategoryId)?.name || finalCategoryId);
            let selectedCompanyId = finalCompanyId; // Use the final company ID (created or existing)

            // Construct clean payload (excluding frontend-only fields like workMode)
            const payload = {
                title: formData.title,
                company: selectedCompanyId, // Send company ID for database relationship
                location: formData.location,
                description: formData.description,
                industry: selectedIndustry,
                category: selectedCategory,

                employmentType: formData.employmentType,
                experience: formData.experience,
                salaryMin: Number(formData.salaryMin) || 0,
                salaryMax: Number(formData.salaryMax) || 0,
                salaryPeriod: formData.salaryPeriod,

                requirements: requirementsArray,
                skills: skillsArray,
                tags: benefitsArray,
                remote: formData.workMode === 'remote',
                expiresAt: formData.deadline ? new Date(formData.deadline) : null,
                status: formData.status,
                customSections: formData.customSections.map(section => ({
                    title: section.title,
                    content: section.content
                })),


            };

            console.log("Submitting Clean Payload:", payload); // Debug log

            console.log("Submitting Clean Payload:", payload); // Debug log

            let response;
            if (mode === 'edit' && jobToEdit) {
                response = await axios.put(`${apiUrl}/api/v1/jobs/${jobToEdit.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                response = await axios.post(`${apiUrl}/api/v1/jobs`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            if (response.data.success) {
                toast({
                    title: mode === 'edit' ? "Job Updated Successfully" : "Job Posted Successfully",
                    description: "Your job listing has been updated.",
                });
                onOpenChange(false);
                if (onSuccess) onSuccess();
                // Reset form
                setFormData({
                    title: "",
                    company: "",
                    location: "",
                    workMode: "onsite",
                    employmentType: "full-time",
                    experience: "mid",
                    salaryMin: "",
                    salaryMax: "",
                    salaryPeriod: "yearly",
                    industry: "",
                    category: "",
                    description: "",
                    requirements: "",
                    skills: "",
                    benefits: "",
                    deadline: "",
                    status: "published",
                    customSections: [],
                });
                setIsNewCategory(false);
                setNewCategoryName("");
                setIsNewCompany(false);
                setNewCompanyName("");
                setIsNewCompany(false);
                setNewCompanyName("");
            }
        } catch (error: any) {
            console.error("Error posting job:", error);
            if (axios.isAxiosError(error) && error.response) {
                console.log("Full Backend Error Response:", error.response.data);
            }

            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.map((e: any) => e.message).join(", ")
                : error.response?.data?.error
                    ? (Array.isArray(error.response.data.error) ? error.response.data.error.join(", ") : error.response.data.error)
                    : error.response?.data?.message || "Failed to post job.";

            // alert(`Failed to post job: ${errorMessage}`); // Removing alert as toast is enough and cleaner
            console.log("BACKEND_ERROR_STR:", errorMessage);

            toast({
                title: mode === 'edit' ? "Error Updating Job" : "Error Posting Job",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === 'edit' ? 'Edit Job' : 'Post a New Job'}</DialogTitle>
                    <DialogDescription>
                        {mode === 'edit' ? 'Update the details of your job posting.' : 'Fill in the details below to publish a new job opening.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-8 py-4">
                    {/* Basic Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title *</Label>
                                <Input
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    placeholder="e.g. Senior Frontend Developer"
                                    className={showValidationErrors && !formData.title ? "border-red-500" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company Name *</Label>
                                <Select
                                    value={formData.company}
                                    onValueChange={(value) => handleInputChange("company", value)}
                                >
                                    <SelectTrigger className={showValidationErrors && !formData.company ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map((company) => (
                                            <SelectItem key={company._id} value={company._id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value="other">+ Add New Company</SelectItem>
                                    </SelectContent>
                                </Select>
                                {isNewCompany && (
                                    <Input
                                        className={`mt-2 ${showValidationErrors && isNewCompany && !newCompanyName ? "border-red-500" : ""}`}
                                        placeholder="Enter new company name"
                                        value={newCompanyName}
                                        onChange={(e) => setNewCompanyName(e.target.value)}
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="industry">Industry (Select Category) *</Label>
                                <Select
                                    value={formData.industry}
                                    onValueChange={(value) => handleInputChange("industry", value)}
                                >
                                    <SelectTrigger className={showValidationErrors && !formData.industry ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select Industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map((ind) => (
                                            <SelectItem key={ind._id} value={ind._id}>
                                                {ind.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Job Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleInputChange("category", value)}
                                    disabled={!formData.industry}
                                >
                                    <SelectTrigger className={showValidationErrors && !formData.category ? "border-red-500" : ""}>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                        {formData.industry && <SelectItem value="other">+ Create New Category</SelectItem>}
                                    </SelectContent>
                                </Select>
                                {isNewCategory && (
                                    <Input
                                        className={`mt-2 ${showValidationErrors && isNewCategory && !newCategoryName ? "border-red-500" : ""}`}
                                        placeholder="Enter new category name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Location & Work Mode Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location & Work Mode</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location *</Label>
                                <Input
                                    id="location"
                                    required
                                    value={formData.location}
                                    onChange={(e) => handleInputChange("location", e.target.value)}
                                    placeholder="e.g. San Francisco, CA"
                                    className={showValidationErrors && !formData.location ? "border-red-500" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="workMode">Work Mode</Label>
                                <Select
                                    value={formData.workMode}
                                    onValueChange={(value) => handleInputChange("workMode", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select work mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="onsite">On-site</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                        <SelectItem value="remote">Remote</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Job Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="employmentType">Employment Type *</Label>
                                <Select
                                    value={formData.employmentType}
                                    onValueChange={(value) => handleInputChange("employmentType", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full-time">Full Time</SelectItem>
                                        <SelectItem value="part-time">Part Time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="temporary">Temporary</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience Level *</Label>
                                <Select
                                    value={formData.experience}
                                    onValueChange={(value) => handleInputChange("experience", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="entry">Entry Level</SelectItem>
                                        <SelectItem value="mid">Mid Level</SelectItem>
                                        <SelectItem value="senior">Senior Level</SelectItem>
                                        <SelectItem value="executive">Executive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salaryMin">Minimum Salary (CAD)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                        id="salaryMin"
                                        type="number"
                                        className="pl-7"
                                        value={formData.salaryMin}
                                        onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                                        placeholder="50000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salaryMax">Maximum Salary (CAD)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <Input
                                        id="salaryMax"
                                        type="number"
                                        className="pl-7"
                                        value={formData.salaryMax}
                                        onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                                        placeholder="80000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salaryPeriod">Salary Period</Label>
                                <Select
                                    value={formData.salaryPeriod}
                                    onValueChange={(value) => handleInputChange("salaryPeriod", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hourly">Per Hour</SelectItem>
                                        <SelectItem value="monthly">Per Month</SelectItem>
                                        <SelectItem value="yearly">Per Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deadline">Application Deadline</Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description & Requirements Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Description & Requirements</h3>
                        <div className="space-y-2">
                            <Label htmlFor="description">Job Description *</Label>
                            <Textarea
                                id="description"
                                required
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Detailed description of the role..."
                                className={`min-h-[150px] ${showValidationErrors && !formData.description ? "border-red-500" : ""}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements">Key Requirements (One per line)</Label>
                            <Textarea
                                id="requirements"
                                value={formData.requirements}
                                onChange={(e) => handleInputChange("requirements", e.target.value)}
                                placeholder="- React.js&#10;- TypeScript&#10;- 3+ years experience"
                                className="min-h-[100px]"
                            />
                            {formData.requirements && (
                                <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
                                    <p className="text-xs font-semibold text-purple-900 mb-2">Preview ({formData.requirements.split('\n').filter(r => r.trim()).length} requirements):</p>
                                    <div className="space-y-1">
                                        {formData.requirements.split('\n').map((req, idx) => {
                                            const trimmed = req.trim();
                                            return trimmed ? (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                                                    <span className="text-xs text-purple-900">
                                                        {trimmed.length > 60 ? trimmed.substring(0, 60) + '...' : trimmed}
                                                    </span>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="skills">Skills (Comma separated)</Label>
                            <Input
                                id="skills"
                                value={formData.skills}
                                onChange={(e) => handleInputChange("skills", e.target.value)}
                                placeholder="React, Node.js, TypeScript, MongoDB"
                            />
                            {formData.skills && (
                                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-xs font-semibold text-blue-900 mb-2">Preview ({formData.skills.split(',').filter(s => s.trim()).length} skills):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.skills.split(',').map((skill, idx) => {
                                            const trimmed = skill.trim();
                                            return trimmed ? (
                                                <span key={idx} className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-xs font-medium">
                                                    {trimmed.length > 20 ? trimmed.substring(0, 20) + '...' : trimmed}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="benefits">Benefits & Perks (One per line)</Label>
                            <Textarea
                                id="benefits"
                                value={formData.benefits}
                                onChange={(e) => handleInputChange("benefits", e.target.value)}
                                placeholder="- Health Insurance&#10;- Remote Work Options&#10;- Annual Bonus"
                                className="min-h-[100px]"
                            />
                            {formData.benefits && (
                                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-xs font-semibold text-green-900 mb-2">Preview ({formData.benefits.split('\n').filter(b => b.trim()).length} benefits):</p>
                                    <div className="space-y-1">
                                        {formData.benefits.split('\n').map((benefit, idx) => {
                                            const trimmed = benefit.trim();
                                            return trimmed ? (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-xs text-green-900">
                                                        {trimmed.length > 60 ? trimmed.substring(0, 60) + '...' : trimmed}
                                                    </span>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Custom Sections */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addCustomSection}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Section
                            </Button>
                        </div>

                        {formData.customSections.map((section, index) => (
                            <div key={index} className="space-y-3 p-4 border rounded-md bg-gray-50 relative">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => removeCustomSection(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <div className="space-y-2">
                                    <Label>Section Title</Label>
                                    <Input
                                        value={section.title}
                                        onChange={(e) => updateCustomSection(index, "title", e.target.value)}
                                        placeholder="e.g. Interview Process"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Content</Label>
                                    <Textarea
                                        value={section.content}
                                        onChange={(e) => updateCustomSection(index, "content", e.target.value)}
                                        placeholder="Enter details..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} style={{ backgroundColor: '#02243b', color: 'white' }}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {mode === 'edit' ? 'Updating...' : 'Posting...'}
                                </>
                            ) : (
                                mode === 'edit' ? 'Update Job' : 'Post Job'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
