"use client";
import { useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { CompanyProfile } from "@/components/employer/CompanyProfile";

// Mock company data - in real app this would come from API
const mockCompany = {
  name: "TechCorp Solutions",
  email: "hr@techcorp.com",
  phone: "+1 234-567-8900",
  plan: "Professional" as const,
  logo: "https://ui-avatars.com/api/?name=TechCorp+Solutions&background=0d47a1&color=fff",
  industry: "Technology",
  size: "51-200 employees",
  location: "San Francisco, CA",
  website: "https://techcorp.com",
  description: "Leading technology solutions provider specializing in software development and digital transformation.",
  founded: "2015",
  tagline: "Innovating Tomorrow's Technology Today",
  culture: "We foster a collaborative environment where innovation thrives and every team member contributes to our shared success.",
  socialLinks: {
    linkedin: "https://linkedin.com/company/techcorp-solutions",
    twitter: "https://twitter.com/techcorp",
    facebook: "https://facebook.com/techcorp"
  }
};

export default function EmployerProfilePage() {
  const [company, setCompany] = useState(mockCompany);

  const handleUpdateCompany = (updatedCompany: typeof mockCompany) => {
    setCompany(updatedCompany);
    // In real app, this would make an API call to update the company profile
    console.log("Updating company profile:", updatedCompany);
  };

  return (
    <ProtectedLayout requiredRole="employer">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Company Profile Component */}
          <CompanyProfile
            company={company}
            onUpdateCompany={handleUpdateCompany}
          />
        </div>
      </div>
    </ProtectedLayout>
  );
}