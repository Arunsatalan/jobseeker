"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Star,
  Award,
  TrendingUp,
  Shield,
  Sparkles,
  Upload,
  X,
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
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedFromAPI, setHasLoadedFromAPI] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Professional',
    logo: '',
    industry: '',
    size: '',
    location: '',
    website: '',
    description: '',
    founded: '',
    tagline: '',
    culture: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
    },
  });
  const [categories, setCategories] = useState([]);
  const [logoInputRef, setLogoInputRef] = useState<HTMLInputElement | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Fetch employer company data from user profile
  useEffect(() => {
    const fetchEmployerData = async () => {
      if (!isAuthenticated || user?.role !== 'employer') {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch employer company data
        const response = await axios.get(`${apiUrl}/api/v1/user-profiles/employer/company-data`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success && response.data.data) {
          const employerData = response.data.data;
          const updatedFormData = {
            name: employerData.name || '',
            email: employerData.email || '',
            phone: employerData.phone || '',
            plan: 'Professional',
            logo: employerData.logo || '',
            location: employerData.location || '',
            website: employerData.website || '',
            industry: employerData.industry || '',
            size: employerData.size || '',
            description: employerData.description || '',
            founded: employerData.founded || '',
            tagline: employerData.tagline || '',
            culture: employerData.culture || '',
            socialLinks: {
              linkedin: employerData.socialLinks?.linkedin || '',
              twitter: employerData.socialLinks?.twitter || '',
              facebook: employerData.socialLinks?.facebook || '',
            },
          };

          console.log('Fetched employer data:', updatedFormData);
          setFormData(updatedFormData);
          setHasLoadedFromAPI(true);
        }
      } catch (error) {
        console.error('Error fetching employer data:', error);
        setHasLoadedFromAPI(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployerData();
  }, [isAuthenticated, user?.role, user?.id, apiUrl]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSave = async () => {
    if (!formData.name) {
      console.error('Company name is required');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');

      console.log('Payload being sent:', formData);

      // Save to user profile
      if (user?.role === 'employer') {
        await axios.put(`${apiUrl}/api/v1/user-profiles/employer/details`, {
          companyName: formData.name,
          email: formData.email, // Added email to update logic
          industry: formData.industry,
          companySize: formData.size,
          companyWebsite: formData.website,
          companyDescription: formData.description,
          companyLogo: formData.logo ? { url: formData.logo } : undefined,
          socialLinks: formData.socialLinks,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      console.log('Company details saved');
      onUpdateCompany(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company details:', error);
    } finally {
      setIsSaving(false);
    }
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview URL immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange('logo', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Hero Profile Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 p-8 lg:p-12 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-transparent to-amber-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
          {/* Company Logo & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <Avatar className="relative h-24 w-24 lg:h-32 lg:w-32 border-4 border-white/20 shadow-2xl">
                <AvatarImage src={formData.logo} alt={formData.name} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-600 text-white text-3xl lg:text-4xl">
                  <Building2 className="h-12 w-12 lg:h-16 lg:w-16" />
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <input
                    ref={setLogoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    onClick={() => logoInputRef?.click()}
                    className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            <div className="text-center lg:text-left space-y-3">
              {isEditing ? (
                <div className="space-y-3 max-w-md">
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-white bg-white/10 border-white/20 placeholder-white/60 text-xl lg:text-2xl font-bold h-12"
                    placeholder="Company Name"
                  />
                  <Input
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    className="text-white bg-white/10 border-white/20 placeholder-white/60"
                    placeholder="Company Tagline"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">{formData.name}</h1>
                  <p className="text-amber-200 text-lg lg:text-xl font-medium mb-4">{formData.tagline}</p>
                </>
              )}

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-sm">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <Users className="h-4 w-4 text-amber-300" />
                  <span>{formData.size}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                  <MapPin className="h-4 w-4 text-amber-300" />
                  <span>{formData.location}</span>
                </div>
                {formData.founded && (
                  <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Award className="h-4 w-4 text-amber-300" />
                    <span>Founded {formData.founded}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 px-4 py-2 text-sm font-medium">
                <Shield className="h-4 w-4 mr-2" />
                Verified Employer
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-200 border-amber-400/30 px-4 py-2 text-sm font-medium">
                <Star className="h-4 w-4 mr-2" />
                {formData.plan}
              </Badge>
            </div>

            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-slate-100 p-1 rounded-2xl shadow-lg">
            <TabsTrigger
              value="overview"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Star className="h-4 w-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Globe className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Information Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Company Information</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2">Company Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                      />
                    ) : (
                      <p className="text-slate-900 font-medium p-3 bg-slate-50 rounded-lg">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2">Industry</Label>
                    {isEditing ? (
                      <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                      >
                        {categories.map((category) => (
                          <option key={category._id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-slate-900 font-medium p-3 bg-slate-50 rounded-lg">{formData.industry}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2">Company Size</Label>
                      {isEditing ? (
                        <select
                          value={formData.size}
                          onChange={(e) => handleInputChange('size', e.target.value)}
                          className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                        >
                          <option>1-10 employees</option>
                          <option>11-50 employees</option>
                          <option>51-200 employees</option>
                          <option>201-500 employees</option>
                          <option>501-1000 employees</option>
                          <option>1000+ employees</option>
                        </select>
                      ) : (
                        <p className="text-slate-900 font-medium p-3 bg-slate-50 rounded-lg">{formData.size}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-700 mb-2">Founded</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={formData.founded}
                          onChange={(e) => handleInputChange('founded', e.target.value)}
                          placeholder="2020"
                          className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                        />
                      ) : (
                        <p className="text-slate-900 font-medium p-3 bg-slate-50 rounded-lg">{formData.founded}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-slate-700 mb-2">Location</Label>
                    {isEditing ? (
                      <Input
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
                      />
                    ) : (
                      <p className="text-slate-900 font-medium p-3 bg-slate-50 rounded-lg">{formData.location}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Website & Tagline Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-amber-50 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-amber-600 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Online Presence</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2">Company Tagline</Label>
                  {isEditing ? (
                    <Input
                      value={formData.tagline}
                      onChange={(e) => handleInputChange('tagline', e.target.value)}
                      placeholder="Your company's mission in one line"
                      className="border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium p-3 bg-amber-50 rounded-lg italic">{formData.tagline}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2">Website</Label>
                  {isEditing ? (
                    <Input
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourcompany.com"
                      className="border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  ) : (
                    formData.website ? (
                      <div className="p-3 bg-amber-50 rounded-lg">
                        <a
                          href={formData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-700 hover:text-amber-800 font-medium flex items-center gap-2 group"
                        >
                          {formData.website}
                          <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-slate-500 font-medium p-3 bg-amber-50 rounded-lg">No website provided</p>
                    )
                  )}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Description Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Company Story</h3>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">About Us</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    placeholder="Tell candidates about your company's mission, values, and what makes you unique..."
                    className="border-blue-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                ) : (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-slate-900 leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Company Culture Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-emerald-50 border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Our Culture</h3>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-3 block">Work Environment</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.culture}
                    onChange={(e) => handleInputChange('culture', e.target.value)}
                    rows={6}
                    placeholder="Describe your company culture, values, and what employees can expect..."
                    className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                  />
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-slate-900 leading-relaxed whitespace-pre-wrap">{formData.culture}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Culture Highlights */}
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200/50 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Award className="h-6 w-6 text-amber-600" />
              Culture Highlights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Innovation</h4>
                <p className="text-sm text-slate-600">We encourage creative thinking and new ideas</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Collaboration</h4>
                <p className="text-sm text-slate-600">Teamwork and open communication drive our success</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-amber-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Excellence</h4>
                <p className="text-sm text-slate-600">We strive for the highest quality in everything we do</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-purple-50 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Contact Details</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2">Email Address</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="hr@company.com"
                      className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Mail className="h-5 w-5 text-purple-600" />
                      <span className="text-slate-900 font-medium">{formData.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <Phone className="h-5 w-5 text-purple-600" />
                      <span className="text-slate-900 font-medium">{formData.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Location Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-rose-50 border-rose-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Location</h3>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700 mb-2">Office Address</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    rows={4}
                    placeholder="123 Business Street, City, State, ZIP Code"
                    className="border-rose-300 focus:border-rose-500 focus:ring-rose-500 resize-none"
                  />
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-rose-600 mt-0.5" />
                    <span className="text-slate-900 font-medium leading-relaxed">{formData.location}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Contact Preferences */}
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200/50 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Shield className="h-6 w-6 text-slate-600" />
              Contact Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Email</h4>
                <p className="text-sm text-slate-600">Primary communication channel</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Phone</h4>
                <p className="text-sm text-slate-600">For urgent inquiries</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Website</h4>
                <p className="text-sm text-slate-600">Learn more about us</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LinkedIn Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">LinkedIn</h3>
                  <p className="text-sm text-slate-600">Professional network</p>
                </div>
              </div>

              <div>
                {isEditing ? (
                  <Input
                    value={formData.socialLinks?.linkedin || ''}
                    onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                    className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                ) : (
                  formData.socialLinks?.linkedin ? (
                    <a
                      href={formData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group-hover:translate-x-1 transition-transform"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="text-slate-500 font-medium">Not connected</p>
                  )
                )}
              </div>
            </Card>

            {/* Twitter Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-sky-50 border-sky-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-sky-500 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Twitter</h3>
                  <p className="text-sm text-slate-600">Social updates</p>
                </div>
              </div>

              <div>
                {isEditing ? (
                  <Input
                    value={formData.socialLinks?.twitter || ''}
                    onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                    placeholder="https://twitter.com/yourcompany"
                    className="border-sky-300 focus:border-sky-500 focus:ring-sky-500"
                  />
                ) : (
                  formData.socialLinks?.twitter ? (
                    <a
                      href={formData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium group-hover:translate-x-1 transition-transform"
                    >
                      <span>Follow Us</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="text-slate-500 font-medium">Not connected</p>
                  )
                )}
              </div>
            </Card>

            {/* Facebook Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-indigo-50 border-indigo-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Facebook</h3>
                  <p className="text-sm text-slate-600">Community page</p>
                </div>
              </div>

              <div>
                {isEditing ? (
                  <Input
                    value={formData.socialLinks?.facebook || ''}
                    onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                    placeholder="https://facebook.com/yourcompany"
                    className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                ) : (
                  formData.socialLinks?.facebook ? (
                    <a
                      href={formData.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium group-hover:translate-x-1 transition-transform"
                    >
                      <span>Like Us</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <p className="text-slate-500 font-medium">Not connected</p>
                  )
                )}
              </div>
            </Card>
          </div>

          {/* Social Media Strategy */}
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200/50 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-slate-600" />
              Social Media Strategy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Networking</h4>
                <p className="text-sm text-slate-600">Connect with industry professionals</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Brand Awareness</h4>
                <p className="text-sm text-slate-600">Showcase company culture and values</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Talent Attraction</h4>
                <p className="text-sm text-slate-600">Attract top talent to your opportunities</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}