"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Briefcase,
  Users,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  ArrowRight,
  CheckCircle2,
  Zap,
  Target,
  Globe,
  Star,
  Quote,
  Shield,
  FileText,
  MessageSquare,
  ChevronDown,
  Wrench,
  BookOpen,
  Menu,
  X,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import SignIn from "@/components/signin"
import SignUp from "@/components/signup"
import { MOCK_SOFTWARE_ENGINEER_JOBS } from "@/components/job-search/mockSoftwareEngineerJobs"
import JobCard from "@/components/job-search/JobCard"
import { Job } from "@/components/job-search/types"

export default function Home() {
  const [isJobsDropdownOpen,setIsJobsDropdownOpen]= useState(false);
  const [isCareerToolsDropdownOpen, setIsCareerToolsDropdownOpen] = useState(false);
  const [isEmployersDropdownOpen, setIsEmployersDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [jobQuery, setJobQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [showJobResults, setShowJobResults] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const careerToolsRef = useRef(null);
  const employersRef = useRef(null);

  const handleSearch = () => {
    // Filter jobs based on search criteria
    let results = MOCK_SOFTWARE_ENGINEER_JOBS;

    if (jobQuery.trim()) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(jobQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(jobQuery.toLowerCase())
      );
    }

    if (locationQuery.trim()) {
      results = results.filter(job =>
        job.location.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }

    setFilteredJobs(results);
    setShowJobResults(true);

    // Scroll to results section
    setTimeout(() => {
      document.getElementById('job-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsJobsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (careerToolsRef.current && !careerToolsRef.current.contains(event.target)) {
        setIsCareerToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (employersRef.current && !employersRef.current.contains(event.target)) {
        setIsEmployersDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const jobSubmenuItems = [
    { emoji: "🔍", title: "Search Jobs", href: "/jobs" },
    { emoji: "🌎", title: "Remote & Hybrid Jobs", href: "/jobs/remote" },
    { emoji: "🧑‍🎓", title: "Newcomer-Friendly", href: "/jobs/newcomer" },
    { emoji: "🎓", title: "Entry-Level Jobs", href: "/jobs/entry-level" },
    { emoji: "💼", title: "Top Employers Hiring", href: "/jobs/top-employers" },
    { emoji: "🔧", title: "Skilled Trades & Tech", href: "/jobs/tech-trades" },
    { emoji: "📈", title: "High Paying Jobs", href: "/jobs/high-paying" },
    { emoji: "🕒", title: "Part-Time / Freelance", href: "/jobs/part-time" },
    { emoji: "🌱", title: "Internships & Co-ops", href: "/jobs/internships" },
  ]

  const careerToolsSubmenuItems = [
    { emoji: "📄", title: "Resume Analyzer", href: "/tools/resume-analyzer" },
    { emoji: "👤", title: "Profile Builder", href: "/tools/profile-builder" },
    { emoji: "🎤", title: "Interview Prep", href: "/tools/interview-prep" },
    { emoji: "💰", title: "Salary Explorer", href: "/tools/salary-explorer" },
  ]

  const employersSubmenuItems = [
    { emoji: "📝", title: "Post a Job (Free Trial)", href: "/employers/post-job" },
    { emoji: "👥", title: "Candidate Preview", href: "/employers/candidates-preview" },
    { emoji: "💳", title: "Pricing & Plans", href: "/employers/pricing" },
    { emoji: "❓", title: "Why CanadaJobs?", href: "/employers/why-us" },
    { emoji: "📚", title: "Hiring Guide (Free)", href: "/resources/hiring-playbook" },
  ]
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-accent-50">

      {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-2xl">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-400">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="hidden md:block text-2xl font-bold text-gray-800">CanadaJobs</span>
              </Link>
              <div className="hidden items-center gap-10 xl:flex">
                <div className="relative">
                  <button
                    onClick={() => setIsJobsDropdownOpen(!isJobsDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isJobsDropdownOpen
                        ? 'text-primary-500 border-b-2 border-primary-500'
                        : 'text-gray-600 hover:text-primary-500'
                    }`}
                  >
                    <Search className="h-4 w-4" />
                    Find Jobs
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {isJobsDropdownOpen && (
                    <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-white/20 bg-white/60 backdrop-blur-2xl p-3 shadow-2xl">
                      <div className="grid grid-cols-2 gap-2">
                        {jobSubmenuItems.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg p-2 transition-all duration-200 hover:bg-primary-50/80 hover:shadow-md hover:-translate-y-0.5"
                            onClick={() => setIsJobsDropdownOpen(false)}
                          >
                            <span className="text-lg">{item.emoji}</span>
                            <div className="font-semibold text-gray-800 text-sm">{item.title}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsCareerToolsDropdownOpen(!isCareerToolsDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      pathname.startsWith('/tools')
                        ? 'text-primary-500 border-b-2 border-primary-500'
                        : 'text-gray-600 hover:text-primary-500'
                    }`}
                  >
                    <Wrench className="h-4 w-4" />
                    Career Tools
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {isCareerToolsDropdownOpen && (
                    <div ref={careerToolsRef} className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-white/20 bg-white/60 backdrop-blur-2xl p-3 shadow-2xl">
                      <div className="grid grid-cols-2 gap-2">
                        {careerToolsSubmenuItems.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg p-2 transition-all duration-200 hover:bg-primary-50/80 hover:shadow-md hover:-translate-y-0.5"
                            onClick={() => setIsCareerToolsDropdownOpen(false)}
                          >
                            <span className="text-lg">{item.emoji}</span>
                            <div className="font-semibold text-gray-800 text-sm">{item.title}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsEmployersDropdownOpen(!isEmployersDropdownOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      pathname.startsWith('/employers')
                        ? 'text-primary-500 border-b-2 border-primary-500'
                        : 'text-gray-600 hover:text-primary-500'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    For Employers
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {isEmployersDropdownOpen && (
                    <div ref={employersRef} className="absolute top-full left-0 mt-2 w-80 rounded-xl border border-white/20 bg-white/60 backdrop-blur-2xl p-3 shadow-2xl">
                      <div className="grid grid-cols-1 gap-2">
                        {employersSubmenuItems.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-2 rounded-lg p-2 transition-all duration-200 hover:bg-primary-50/80 hover:shadow-md hover:-translate-y-0.5"
                            onClick={() => setIsEmployersDropdownOpen(false)}
                          >
                            <span className="text-lg">{item.emoji}</span>
                            <div className="font-semibold text-gray-800 text-sm">{item.title}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Link
                  href="/resources"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === '/resources'
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-gray-600 hover:text-primary-500'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Resources
                </Link>
              </div>
            </div>
            {isMobileMenuOpen && (
              <div className="xl:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-white/20 shadow-2xl animate-fade-in">
                <div className="container mx-auto px-4 py-4 space-y-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsJobsDropdownOpen(!isJobsDropdownOpen)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-gray-600 hover:text-primary-500 hover:bg-primary-50"
                    >
                      <Search className="h-4 w-4" />
                      Find Jobs
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </button>
                    {isJobsDropdownOpen && (
                      <div className="ml-6 space-y-1">
                        {jobSubmenuItems.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="text-lg">{item.emoji}</span>
                            <div className="text-sm">{item.title}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsCareerToolsDropdownOpen(!isCareerToolsDropdownOpen)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-gray-600 hover:text-primary-500 hover:bg-primary-50"
                    >
                      <Wrench className="h-4 w-4" />
                      Career Tools
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </button>
                    {isCareerToolsDropdownOpen && (
                      <div className="ml-6 space-y-1">
                        {careerToolsSubmenuItems.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="text-lg">{item.emoji}</span>
                            <div className="text-sm">{item.title}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsEmployersDropdownOpen(!isEmployersDropdownOpen)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left text-gray-600 hover:text-primary-500 hover:bg-primary-50"
                    >
                      <Building2 className="h-4 w-4" />
                      For Employers
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </button>
                    {isEmployersDropdownOpen && (
                      <div className="ml-6 space-y-1">
                        {employersSubmenuItems.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary-50"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="text-lg">{item.emoji}</span>
                            <div className="text-sm">{item.title}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link
                    href="/resources"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-primary-500 hover:bg-primary-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BookOpen className="h-4 w-4" />
                    Resources
                  </Link>
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsSignInOpen(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full justify-start text-gray-600 hover:text-primary-500 hover:bg-primary-50"
                    >
                      Sign In
                    </Button>
                    <Button className="w-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg transition-all duration-300 hover:shadow-xl">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="hidden xl:flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsSignInOpen(true)}
                  className="text-gray-600 hover:text-primary-500 hover:bg-primary-50"
                >
                  Sign In
                </Button>
                <Button className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-400 px-6 text-white shadow-lg shadow-primary-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/30">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-24">
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary-100/40 to-secondary-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-accent-100/30 to-primary-100/30 blur-3xl" />

        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left side - Image */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <img
                  src="/ChatGPT%20Image%20Dec%2012%2C%202025%2C%2010_22_45%20PM.png"
                  alt="CanadaJobs Platform Preview"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-secondary-400/10 rounded-2xl"></div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <Badge className="mb-6 rounded-full border-2 border-primary-200 bg-primary-50 px-4 py-2 text-primary-500 hover:bg-primary-100">
                <Sparkles className="mr-2 h-4 w-4" />
                Trusted by 50,000+ Canadian professionals
              </Badge>

              <h1 className="mb-8 text-4xl font-bold leading-tight text-gray-800 md:text-5xl lg:text-6xl animate-fade-in">
                Where Canada Hires.
                <br />
                <span className="bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent animate-pulse">
                  Where You Belong starts
                </span>
                <br />
               
              </h1>

              <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-600 lg:mx-0">
                Connect with top Canadian employers. Build your future with AI-powered tools, personalized job matches,
                and newcomer-friendly opportunities designed for your success.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Button
                  size="lg"
                  className="h-14 rounded-full bg-gradient-to-r from-primary-500 to-secondary-400 px-10 text-lg text-white shadow-xl shadow-primary-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/30"
                >
                  Find Your Dream Job
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border-2 border-primary-500 px-10 text-lg text-primary-500 transition-all duration-300 hover:bg-primary-50 bg-transparent"
                >
                  For Employers
                </Button>
              </div>

              {/* Search Bar */}
              {/* <div className="mt-16">
                <Card className="rounded-2xl border-0 bg-white p-3 shadow-2xl">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <div className="flex flex-1 items-center gap-3 rounded-xl bg-gray-50 px-5 py-4">
                      <Search className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Job title, keyword, or company"
                        value={jobQuery}
                        onChange={(e) => setJobQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-1 items-center gap-3 rounded-xl bg-gray-50 px-5 py-4">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Toronto, Vancouver, Montreal..."
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      className="h-full rounded-xl bg-gradient-to-r from-primary-500 to-secondary-400 px-10 py-4 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                    >
                      Search Jobs
                    </Button>
                  </div>
                </Card>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Job Results Section */}
      {showJobResults && (
        <section id="job-results" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
                </h2>
                <p className="text-gray-600 mt-2">
                  {jobQuery && locationQuery
                    ? `Showing results for "${jobQuery}" in ${locationQuery}`
                    : jobQuery
                      ? `Showing results for "${jobQuery}"`
                      : locationQuery
                        ? `Showing results in ${locationQuery}`
                        : 'Showing all available jobs'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowJobResults(false)}
                className="rounded-full"
              >
                Clear Results
              </Button>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={false}
                    onClick={() => {}}
                    onBookmark={() => {}}
                    onViewDetails={() => setIsSignInOpen(true)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No jobs found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse all available jobs.
                </p>
                <Button
                  onClick={() => {
                    setFilteredJobs(MOCK_SOFTWARE_ENGINEER_JOBS);
                  }}
                  className="rounded-full"
                >
                  Show All Jobs
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Trusted By Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-gray-500">
            Trusted by Canada's leading employers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale">
            {["Shopify", "RBC", "TD Bank", "Air Canada", "Bell", "Telus"].map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-400">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "50K+", label: "Active Job Seekers" },
              { value: "98%", label: "Success Rate" },
              { value: "300%", label: "Faster Hiring" },
              { value: "5,000+", label: "Top Employers" },
            ].map((stat, i) => (
              <Card
                key={i}
                className="rounded-2xl border-2 border-transparent bg-white p-8 shadow-xl transition-all duration-500 hover:border-primary-200 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge className="mb-4 rounded-full border-2 border-secondary-200 bg-secondary-100 px-4 py-2 text-secondary-500">
              <Shield className="mr-2 h-4 w-4" />
              Why Choose Us
            </Badge>
            <h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
              Not just another{" "}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                job board
              </span>
            </h2>
            <p className="text-xl leading-relaxed text-gray-600">
              We help you get hired faster, smarter, and with fewer rejections through our intelligent matching system.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Globe,
                title: "Built for Canada",
                description: "Tailored specifically for the Canadian job market and immigration landscape",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Tools",
                description: "Smart resume analysis and job matching powered by advanced AI",
              },
              {
                icon: Shield,
                title: "Verified Employers",
                description: "Every job posting verified - no spam, no scams, just real opportunities",
              },
              {
                icon: Users,
                title: "Newcomer Friendly",
                description: "Special support for immigrants, students, and career changers",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="group rounded-2xl border-2 border-transparent bg-white p-8 shadow-lg transition-all duration-500 hover:border-primary-200 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                    i === 0
                      ? "bg-primary-100"
                      : i === 1
                        ? "bg-secondary-100"
                        : i === 2
                          ? "bg-accent-100"
                          : "bg-primary-100"
                  }`}
                >
                  <item.icon
                    className={`h-7 w-7 ${
                      i === 0
                        ? "text-primary-500"
                        : i === 1
                          ? "text-secondary-500"
                          : i === 2
                            ? "text-accent-500"
                            : "text-primary-500"
                    }`}
                  />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-800">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge className="mb-4 rounded-full border-2 border-primary-200 bg-primary-100 px-4 py-2 text-primary-500">
              <Zap className="mr-2 h-4 w-4" />
              Platform Features
            </Badge>
            <h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                succeed
              </span>
            </h2>
            <p className="text-xl leading-relaxed text-gray-600">
              Powerful tools designed for the modern Canadian job market
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "AI Resume Analyzer",
                description: "Upload your CV and get instant feedback with a match score against job descriptions.",
                color: "primary",
              },
              {
                icon: Target,
                title: "Smart Job Matching",
                description: "Our algorithm finds the perfect opportunities based on your skills and preferences.",
                color: "secondary",
              },
              {
                icon: TrendingUp,
                title: "Career Growth Tools",
                description: "Salary explorer, interview prep, and skill gap analysis to advance your career.",
                color: "accent",
              },
              {
                icon: Globe,
                title: "Newcomer Friendly",
                description: "Filter jobs specifically tagged as welcoming to immigrants and entry-level candidates.",
                color: "primary",
              },
              {
                icon: Building2,
                title: "Employer Branding",
                description: "Companies showcase their culture, values, and benefits to attract top talent.",
                color: "secondary",
              },
              {
                icon: MessageSquare,
                title: "Direct Messaging",
                description: "Connect with recruiters and hiring managers directly through our platform.",
                color: "accent",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="group rounded-2xl border-2 border-transparent bg-white p-8 shadow-lg transition-all duration-500 hover:border-primary-200 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${
                    feature.color === "primary"
                      ? "bg-primary-100"
                      : feature.color === "secondary"
                        ? "bg-secondary-100"
                        : "bg-accent-100"
                  }`}
                >
                  <feature.icon
                    className={`h-7 w-7 ${
                      feature.color === "primary"
                        ? "text-primary-500"
                        : feature.color === "secondary"
                          ? "text-secondary-500"
                          : "text-accent-500"
                    }`}
                  />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* UI Preview Section */}
      <section className="py-24 bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge className="mb-4 rounded-full border-2 border-accent-200 bg-accent-100 px-4 py-2 text-accent-500">
              <Sparkles className="mr-2 h-4 w-4" />
              See It In Action
            </Badge>
            <h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
              Powerful tools,{" "}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                beautiful interface
              </span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Resume Analyzer", description: "AI-powered feedback on your resume" },
              { title: "Smart Matches", description: "Personalized job recommendations" },
              { title: "Direct Messages", description: "Chat with recruiters instantly" },
              { title: "Job Filters", description: "Find newcomer-friendly roles" },
            ].map((item, i) => (
              <Card
                key={i}
                className="group overflow-hidden rounded-2xl border-2 border-transparent bg-white shadow-lg transition-all duration-500 hover:border-primary-200 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                  <div className="h-32 w-32 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <Sparkles className="h-12 w-12 text-primary-400" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold text-gray-800">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
              Get hired in{" "}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                3 simple steps
              </span>
            </h2>
            <p className="text-xl leading-relaxed text-gray-600">Your journey to a Canadian career made simple</p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Build a standout profile with our AI-powered resume analyzer and get instant feedback.",
              },
              {
                step: "2",
                title: "Discover Opportunities",
                description:
                  "Browse thousands of jobs with smart filters for remote work, newcomer-friendly roles, and more.",
              },
              {
                step: "3",
                title: "Connect & Get Hired",
                description: "Apply directly, message recruiters, and track your applications all in one place.",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-400 shadow-xl shadow-primary-500/25">
                  <span className="text-3xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-800">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge className="mb-4 rounded-full border-2 border-primary-200 bg-primary-100 px-4 py-2 text-primary-500">
              <Star className="mr-2 h-4 w-4" />
              Success Stories
            </Badge>
            <h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl">
              What our users{" "}
              <span className="bg-gradient-to-r from-primary-500 to-secondary-400 bg-clip-text text-transparent">
                are saying
              </span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote:
                  "I found a job in 3 weeks. The resume score tool helped me stand out from hundreds of applicants.",
                name: "Aisha Rahman",
                role: "Software Developer",
                location: "Newcomer to Toronto",
              },
              {
                quote:
                  "The newcomer-friendly filters made all the difference. I finally found employers who value international experience.",
                name: "Carlos Mendez",
                role: "Marketing Manager",
                location: "Vancouver, BC",
              },
              {
                quote: "Direct messaging with recruiters changed everything. I had 5 interviews in my first week.",
                name: "Priya Sharma",
                role: "Data Analyst",
                location: "Montreal, QC",
              },
            ].map((testimonial, i) => (
              <Card
                key={i}
                className="rounded-2xl border-2 border-transparent bg-white p-8 shadow-xl transition-all duration-500 hover:border-primary-200 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.25}s` }}
              >
                <Quote className="mb-6 h-10 w-10 text-primary-200" />
                <p className="mb-8 text-lg text-gray-600 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary-500" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-primary-500">{testimonial.location}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="mb-3 text-3xl font-bold text-gray-800 md:text-4xl">Featured Opportunities</h2>
              <p className="text-gray-600">Top companies hiring right now</p>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-2 border-primary-500 px-6 text-primary-500 transition-all duration-300 hover:bg-primary-50 bg-transparent"
            >
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                company: "Shopify",
                role: "Senior Software Engineer",
                location: "Toronto, ON",
                type: "Full-time",
                salary: "$120K - $160K",
                tags: ["Remote", "Newcomer Friendly"],
              },
              {
                company: "RBC",
                role: "Product Manager",
                location: "Vancouver, BC",
                type: "Full-time",
                salary: "$100K - $130K",
                tags: ["Hybrid", "Visa Support"],
              },
              {
                company: "Air Canada",
                role: "UX Designer",
                location: "Montreal, QC",
                type: "Contract",
                salary: "$85K - $110K",
                tags: ["Bilingual", "Diverse Team"],
              },
              {
                company: "TD Bank",
                role: "Data Analyst",
                location: "Calgary, AB",
                type: "Full-time",
                salary: "$75K - $95K",
                tags: ["Entry-Level", "Training Provided"],
              },
            ].map((job, i) => (
              <Card
                key={i}
                className="group cursor-pointer rounded-2xl border-2 border-transparent bg-white p-8 shadow-lg transition-all duration-500 hover:border-primary-200 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100">
                      <Building2 className="h-7 w-7 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{job.role}</h3>
                      <p className="text-gray-600">{job.company}</p>
                    </div>
                  </div>
                  <Badge className="rounded-full border-2 border-primary-200 bg-primary-50 text-primary-500">New</Badge>
                </div>

                <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-secondary-400" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent-500" />
                    {job.salary}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, j) => (
                    <Badge
                      key={j}
                      variant="secondary"
                      className={`rounded-full ${
                        j === 0 ? "bg-secondary-100 text-secondary-500" : "bg-accent-100 text-accent-500"
                      }`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Employers CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 rounded-full border-2 border-white/30 bg-white/10 px-4 py-2 text-white">
              For Employers
            </Badge>
            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">Hire top Canadian talent faster</h2>
            <p className="mb-10 text-xl text-white/80 leading-relaxed">
              Post jobs, access diverse candidates, and build your employer brand. Join 5,000+ companies hiring on
              CanadaJobs.
            </p>
            <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-14 rounded-full bg-white px-10 text-lg text-primary-600 shadow-xl transition-all duration-300 hover:bg-gray-100 hover:shadow-2xl"
              >
                Post a Job
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-full border-2 border-white bg-transparent px-10 text-lg text-white transition-all duration-300 hover:bg-white/10"
              >
                View Pricing
              </Button>
            </div>

            <div className="grid gap-6 text-left md:grid-cols-3">
              {[
                { icon: CheckCircle2, text: "Smart candidate recommendations" },
                { icon: CheckCircle2, text: "Diversity-friendly job tagging" },
                { icon: CheckCircle2, text: "Direct messaging with applicants" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <item.icon className="h-6 w-6 text-white" />
                  <span className="text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <div className="mb-6 flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-secondary-400">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-800">CanadaJobs</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Connecting Canadian employers with top talent since 2025. Your career success is our mission.
              </p>
            </div>

            <div>
              <h4 className="mb-6 font-bold text-gray-800">For Job Seekers</h4>
              <ul className="space-y-4 text-gray-600">
                <li>
                  <Link href="/jobs" className="transition-colors hover:text-primary-500">
                    Find Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="transition-colors hover:text-primary-500">
                    Career Tools
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="transition-colors hover:text-primary-500">
                    Resources
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 font-bold text-gray-800">For Employers</h4>
              <ul className="space-y-4 text-gray-600">
                <li>
                  <Link href="/employers" className="transition-colors hover:text-primary-500">
                    Post a Job
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="transition-colors hover:text-primary-500">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/employers/candidates" className="transition-colors hover:text-primary-500">
                    Browse Candidates
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 font-bold text-gray-800">Company</h4>
              <ul className="space-y-4 text-gray-600">
                <li>
                  <Link href="/about" className="transition-colors hover:text-primary-500">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition-colors hover:text-primary-500">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-primary-500">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gray-100 pt-8 text-center text-gray-500">
            <p>&copy; 2025 CanadaJobs. All rights reserved. Made with love in Canada.</p>
          </div>
        </div>
      </footer>
      {isSignInOpen && <SignIn onClose={() => setIsSignInOpen(false)} onSwitchToSignUp={() => { setIsSignInOpen(false); setIsSignUpOpen(true); }} />}
      {isSignUpOpen && <SignUp onClose={() => setIsSignUpOpen(false)} onSwitchToSignIn={() => { setIsSignUpOpen(false); setIsSignInOpen(true); }} />}
    </div>
  )
}
