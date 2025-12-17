"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Users,
  Camera,
  Save,
  Edit3,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

interface Company {
  name: string;
  email: string;
  phone: string;
  plan: string;
  logo: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  description?: string;
  founded?: string;
  tagline?: string;
  culture?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

interface CompanyProfileProps {
  company: Company;
  onUpdateCompany: (company: Company) => void;
}

export function CompanyProfile({ company, onUpdateCompany }: CompanyProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    ...company,
    website: company.website || "",
    description: company.description || "We are a dynamic technology company focused on innovation and excellence.",
    founded: company.founded || "2020",
    tagline: company.tagline || "Innovation at its finest",
    culture: company.culture || "We believe in work-life balance, continuous learning, and collaborative teamwork.",
    socialLinks: {
      linkedin: company.socialLinks?.linkedin || "",
      twitter: company.socialLinks?.twitter || "",
      facebook: company.socialLinks?.facebook || "",
    },
  });

  const handleSave = () => {
    onUpdateCompany(formData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-gray-600">Manage your company information and branding</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <Card className="p-8 bg-linear-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={formData.logo} alt={formData.name} />
              <AvatarFallback className="bg-white text-blue-600 text-2xl">
                <Building2 className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white text-blue-600 hover:bg-blue-50"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-white bg-white/20 border-white/30 placeholder-white/70"
                  placeholder="Company Name"
                />
                <Input
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  className="text-white bg-white/20 border-white/30 placeholder-white/70"
                  placeholder="Company Tagline"
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">{formData.name}</h1>
                <p className="text-blue-100 text-lg mb-4">{formData.tagline}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {formData.size}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {formData.location}
                  </span>
                  {formData.founded && (
                    <span>Founded {formData.founded}</span>
                  )}
                </div>
              </>
            )}
          </div>

          <Badge className="bg-white text-blue-600 px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            Verified Employer
          </Badge>
        </div>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Company Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{formData.name}</p>
                )}
              </div>

              <div>
                <Label>Industry</Label>
                {isEditing ? (
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Manufacturing</option>
                    <option>Retail</option>
                    <option>Other</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900">{formData.industry}</p>
                )}
              </div>

              <div>
                <Label>Company Size</Label>
                {isEditing ? (
                  <select
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>51-200 employees</option>
                    <option>201-500 employees</option>
                    <option>501-1000 employees</option>
                    <option>1000+ employees</option>
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900">{formData.size}</p>
                )}
              </div>

              <div>
                <Label>Founded Year</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.founded}
                    onChange={(e) => handleInputChange('founded', e.target.value)}
                    placeholder="2020"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{formData.founded}</p>
                )}
              </div>

              <div>
                <Label>Location</Label>
                {isEditing ? (
                  <Input
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{formData.location}</p>
                )}
              </div>

              <div>
                <Label>Website</Label>
                {isEditing ? (
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                ) : (
                  formData.website ? (
                    <div className="mt-1 flex items-center gap-2">
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {formData.website}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-500">Not provided</p>
                  )
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">About Company</h3>
            <div className="space-y-6">
              <div>
                <Label>Company Description</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    placeholder="Describe your company..."
                  />
                ) : (
                  <p className="mt-1 text-gray-900 leading-relaxed">{formData.description}</p>
                )}
              </div>

              <div>
                <Label>Company Culture</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.culture}
                    onChange={(e) => handleInputChange('culture', e.target.value)}
                    rows={4}
                    placeholder="Describe your company culture..."
                  />
                ) : (
                  <p className="mt-1 text-gray-900 leading-relaxed">{formData.culture}</p>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Email Address</Label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{formData.email}</span>
                  </div>
                )}
              </div>

              <div>
                <Label>Phone Number</Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{formData.phone}</span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label>Address</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    rows={2}
                    placeholder="Full address..."
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{formData.location}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
            <div className="space-y-6">
              <div>
                <Label>LinkedIn</Label>
                {isEditing ? (
                  <Input
                    value={formData.socialLinks?.linkedin || ''}
                    onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                ) : (
                  formData.socialLinks?.linkedin ? (
                    <a
                      href={formData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      {formData.socialLinks.linkedin}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="mt-1 text-gray-500">Not provided</p>
                  )
                )}
              </div>

              <div>
                <Label>Twitter</Label>
                {isEditing ? (
                  <Input
                    value={formData.socialLinks?.twitter || ''}
                    onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                    placeholder="https://twitter.com/yourcompany"
                  />
                ) : (
                  formData.socialLinks?.twitter ? (
                    <a
                      href={formData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      {formData.socialLinks.twitter}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="mt-1 text-gray-500">Not provided</p>
                  )
                )}
              </div>

              <div>
                <Label>Facebook</Label>
                {isEditing ? (
                  <Input
                    value={formData.socialLinks?.facebook || ''}
                    onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                    placeholder="https://facebook.com/yourcompany"
                  />
                ) : (
                  formData.socialLinks?.facebook ? (
                    <a
                      href={formData.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      {formData.socialLinks.facebook}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="mt-1 text-gray-500">Not provided</p>
                  )
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}