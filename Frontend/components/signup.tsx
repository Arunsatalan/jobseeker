"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Building2,
  Users,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  Sparkles,
  X,
  Check,
} from "lucide-react"

interface SignUpProps {
  onClose?: () => void
  onSwitchToSignIn?: () => void
}

export default function SignUp({ onClose, onSwitchToSignIn }: SignUpProps) {
  const [activeTab, setActiveTab] = useState("job-seeker")
  const [isLoading, setIsLoading] = useState(false)

  // Job Seeker form state
  const [jobSeekerData, setJobSeekerData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city: "",
    province: "",
    isNewcomer: false,
  })

  // Company form state
  const [companyData, setCompanyData] = useState({
    companyName: "",
    companyEmail: "",
    password: "",
    confirmPassword: "",
    contactName: "",
    contactPhone: "",
    city: "",
    province: "",
    website: "",
    agreeToTerms: false,
  })

  // Temp Agency form state
  const [agencyData, setAgencyData] = useState({
    agencyName: "",
    registrationNo: "",
    contactName: "",
    email: "",
    phone: "",
    city: "",
    province: "",
    password: "",
    confirmPassword: "",
  })

  // Validation functions
  const isJobSeekerValid = () => {
    return jobSeekerData.fullName && jobSeekerData.email && jobSeekerData.phone && 
           jobSeekerData.city && jobSeekerData.province && jobSeekerData.password && 
           jobSeekerData.confirmPassword
  }

  const isCompanyValid = () => {
    return companyData.companyName && companyData.companyEmail && companyData.contactName && 
           companyData.city && companyData.province && companyData.password && 
           companyData.confirmPassword && companyData.agreeToTerms
  }

  const isAgencyValid = () => {
    return agencyData.agencyName && agencyData.registrationNo && agencyData.contactName && 
           agencyData.email && agencyData.phone && agencyData.city && agencyData.province && 
           agencyData.password && agencyData.confirmPassword
  }

  const handleJobSeekerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    // Handle signup logic
  }

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const handleAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  const provinces = [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
    "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
    "Quebec", "Saskatchewan", "Yukon"
  ]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="relative w-full max-w-2xl mx-auto rounded-3xl border-0 bg-white/95 backdrop-blur-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto animate-fade-in-up">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-400 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Join CanadaJobs</h2>
          <p className="text-gray-600">Create your account and start your career journey</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="job-seeker" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Job Seeker
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="agency" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Temp Agency
            </TabsTrigger>
          </TabsList>

          <TabsContent value="job-seeker">
            <form onSubmit={handleJobSeekerSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="js-fullName">Full Name *</Label>
                  <Input
                    id="js-fullName"
                    value={jobSeekerData.fullName}
                    onChange={(e) => setJobSeekerData({...jobSeekerData, fullName: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="js-email">Email *</Label>
                  <Input
                    id="js-email"
                    type="email"
                    value={jobSeekerData.email}
                    onChange={(e) => setJobSeekerData({...jobSeekerData, email: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="js-phone">Phone *</Label>
                  <Input
                    id="js-phone"
                    type="tel"
                    value={jobSeekerData.phone}
                    onChange={(e) => setJobSeekerData({...jobSeekerData, phone: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="js-city">City *</Label>
                  <Input
                    id="js-city"
                    value={jobSeekerData.city}
                    onChange={(e) => setJobSeekerData({...jobSeekerData, city: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="js-province">Province *</Label>
                <Select value={jobSeekerData.province} onValueChange={(value) => setJobSeekerData({...jobSeekerData, province: value})}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="js-newcomer"
                  checked={jobSeekerData.isNewcomer}
                  onCheckedChange={(checked) => setJobSeekerData({...jobSeekerData, isNewcomer: checked as boolean})}
                />
                <Label htmlFor="js-newcomer">I am a newcomer to Canada</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="js-password">Password *</Label>
                  <Input
                    id="js-password"
                    type="password"
                    value={jobSeekerData.password}
                    onChange={(e) => setJobSeekerData({...jobSeekerData, password: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="js-confirmPassword">Confirm Password *</Label>
                  <Input
                    id="js-confirmPassword"
                    type="password"
                    value={jobSeekerData.confirmPassword}
                    onChange={(e) => setJobSeekerData({...jobSeekerData, confirmPassword: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isJobSeekerValid()}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-400 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                {isLoading ? "Creating Account..." : "Create Job Seeker Account"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="company">
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input
                    id="company-name"
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                    className="h-12 rounded-xl"
                    placeholder="e.g., Shopify, RBC"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">Company Email *</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companyData.companyEmail}
                    onChange={(e) => setCompanyData({...companyData, companyEmail: e.target.value})}
                    className="h-12 rounded-xl"
                    placeholder="hr@company.com"
                    pattern=".+@.+\..+"
                    title="Please enter a valid business email address"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-contactName">Contact Person Name *</Label>
                  <Input
                    id="company-contactName"
                    value={companyData.contactName}
                    onChange={(e) => setCompanyData({...companyData, contactName: e.target.value})}
                    className="h-12 rounded-xl"
                    placeholder="HR Manager or Recruiter"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-contactPhone">Contact Phone</Label>
                  <Input
                    id="company-contactPhone"
                    type="tel"
                    value={companyData.contactPhone}
                    onChange={(e) => setCompanyData({...companyData, contactPhone: e.target.value})}
                    className="h-12 rounded-xl"
                    placeholder="+1 (416) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-city">City *</Label>
                  <Input
                    id="company-city"
                    value={companyData.city}
                    onChange={(e) => setCompanyData({...companyData, city: e.target.value})}
                    className="h-12 rounded-xl"
                    placeholder="Toronto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-province">Province *</Label>
                  <Select value={companyData.province} onValueChange={(value) => setCompanyData({...companyData, province: value})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>{province}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-website">Company Website</Label>
                <Input
                  id="company-website"
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({...companyData, website: e.target.value})}
                  className="h-12 rounded-xl"
                  placeholder="https://www.company.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-password">Password *</Label>
                  <Input
                    id="company-password"
                    type="password"
                    value={companyData.password}
                    onChange={(e) => setCompanyData({...companyData, password: e.target.value})}
                    className="h-12 rounded-xl"
                    placeholder="8+ characters"
                    minLength={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-confirmPassword">Confirm Password *</Label>
                  <Input
                    id="company-confirmPassword"
                    type="password"
                    value={companyData.confirmPassword}
                    onChange={(e) => setCompanyData({...companyData, confirmPassword: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="company-terms"
                  checked={companyData.agreeToTerms}
                  onCheckedChange={(checked) => setCompanyData({...companyData, agreeToTerms: checked as boolean})}
                  required
                />
                <Label htmlFor="company-terms">I agree to the <a href="#" className="text-primary-500 hover:underline">Terms & Conditions</a> *</Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isCompanyValid()}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-400 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                {isLoading ? "Creating Account..." : "Create Company Account"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="agency">
            <form onSubmit={handleAgencySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agency-name">Agency Name *</Label>
                  <Input
                    id="agency-name"
                    value={agencyData.agencyName}
                    onChange={(e) => setAgencyData({...agencyData, agencyName: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency-registration">Business Registration No. *</Label>
                  <Input
                    id="agency-registration"
                    value={agencyData.registrationNo}
                    onChange={(e) => setAgencyData({...agencyData, registrationNo: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agency-contactName">Contact Person Name *</Label>
                  <Input
                    id="agency-contactName"
                    value={agencyData.contactName}
                    onChange={(e) => setAgencyData({...agencyData, contactName: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency-email">Email *</Label>
                  <Input
                    id="agency-email"
                    type="email"
                    value={agencyData.email}
                    onChange={(e) => setAgencyData({...agencyData, email: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agency-phone">Phone *</Label>
                  <Input
                    id="agency-phone"
                    type="tel"
                    value={agencyData.phone}
                    onChange={(e) => setAgencyData({...agencyData, phone: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency-city">City *</Label>
                  <Input
                    id="agency-city"
                    value={agencyData.city}
                    onChange={(e) => setAgencyData({...agencyData, city: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agency-province">Province *</Label>
                <Select value={agencyData.province} onValueChange={(value) => setAgencyData({...agencyData, province: value})}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>{province}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agency-password">Password *</Label>
                  <Input
                    id="agency-password"
                    type="password"
                    value={agencyData.password}
                    onChange={(e) => setAgencyData({...agencyData, password: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency-confirmPassword">Confirm Password *</Label>
                  <Input
                    id="agency-confirmPassword"
                    type="password"
                    value={agencyData.confirmPassword}
                    onChange={(e) => setAgencyData({...agencyData, confirmPassword: e.target.value})}
                    className="h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isAgencyValid()}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-400 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                {isLoading ? "Creating Account..." : "Create Agency Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={onSwitchToSignIn}
              className="text-primary-500 hover:text-primary-600 font-semibold"
            >
              Sign in
            </button>
          </p>
        </div>
      </Card>
    </div>
  )
}