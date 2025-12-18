"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  Mail,
  Database,
  Shield,
  Globe,
  Upload,
  Save,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  Key,
  Server,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Bell,
  Lock,
  Palette,
  Code,
  Search,
  Download,
} from "lucide-react";

// Platform configuration data
const platformConfig = {
  general: {
    siteName: "CanadaJobs",
    siteUrl: "https://canadajobs.com",
    adminEmail: "admin@canadajobs.com",
    supportEmail: "support@canadajobs.com",
    timezone: "America/Toronto",
    language: "English",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
  },
  features: {
    jobPosting: true,
    resumeBuilder: true,
    messaging: true,
    videoInterviews: false,
    aiJobMatching: true,
    advancedAnalytics: true,
    mobileApp: false,
    socialLogin: true,
    twoFactorAuth: false,
    guestJobSearch: true,
  },
  limits: {
    maxJobPostDuration: 60,
    maxResumeFileSize: 10,
    maxCompanyLogo: 5,
    maxProfileImage: 2,
    dailyEmailLimit: 10000,
    maxSearchResults: 50,
    sessionTimeout: 1440,
    passwordMinLength: 8,
  },
  integrations: {
    emailProvider: "SendGrid",
    paymentProcessor: "Stripe",
    fileStorage: "AWS S3",
    analytics: "Google Analytics",
    searchEngine: "Elasticsearch",
    cdn: "CloudFlare",
    monitoring: "DataDog",
    errorTracking: "Sentry",
  },
  security: {
    forceHttps: true,
    corsEnabled: true,
    rateLimiting: true,
    ipWhitelist: false,
    bruteForceProtection: true,
    contentSecurityPolicy: true,
    sqlInjectionProtection: true,
    xssProtection: true,
  },
  backup: {
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30,
    lastBackup: "2025-12-16 02:00:00",
    backupSize: "2.4 GB",
    storageLocation: "AWS S3 - us-east-1",
  },
};

// API Keys and integrations
const integrationKeys = [
  {
    id: "sendgrid",
    name: "SendGrid",
    service: "Email Service",
    status: "Active",
    lastVerified: "2025-12-15",
    keyPresent: true,
    endpoint: "https://api.sendgrid.com/v3/",
  },
  {
    id: "stripe",
    name: "Stripe",
    service: "Payment Processing",
    status: "Active",
    lastVerified: "2025-12-16",
    keyPresent: true,
    endpoint: "https://api.stripe.com/v1/",
  },
  {
    id: "aws",
    name: "AWS S3",
    service: "File Storage",
    status: "Active",
    lastVerified: "2025-12-16",
    keyPresent: true,
    endpoint: "s3.amazonaws.com",
  },
  {
    id: "google",
    name: "Google Analytics",
    service: "Analytics",
    status: "Warning",
    lastVerified: "2025-12-10",
    keyPresent: true,
    endpoint: "https://www.googleapis.com/analytics/v3/",
    warning: "Quota limit approaching",
  },
];

export function PlatformSettings() {
  const [selectedTab, setSelectedTab] = useState("general");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Inactive: "bg-red-100 text-red-800 border-red-200",
      Testing: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const icons = {
      Active: <CheckCircle className="w-3 h-3 mr-1" />,
      Warning: <AlertTriangle className="w-3 h-3 mr-1" />,
      Inactive: <AlertTriangle className="w-3 h-3 mr-1" />,
      Testing: <RefreshCw className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border font-medium flex items-center`}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    );
  };

  const handleConfigChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = () => {
    // Handle save logic here
    setHasUnsavedChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Platform Settings</h2>
          <p className="text-gray-600 mt-1">
            Configure system-wide settings, integrations, and security policies for the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" size="sm" className="shadow-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            size="sm"
            className="shadow-sm bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600"
            onClick={handleSaveChanges}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">System Status</CardTitle>
              <Server className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">Online</div>
            <div className="text-xs text-green-600 mt-1">99.9% uptime</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">Active Integrations</CardTitle>
              <Globe className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{integrationKeys.filter(i => i.status === "Active").length}</div>
            <div className="text-xs text-blue-600 mt-1">of {integrationKeys.length} configured</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">98%</div>
            <div className="text-xs text-purple-600 mt-1">Excellent</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-700">Last Backup</CardTitle>
              <Database className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">2h ago</div>
            <div className="text-xs text-yellow-600 mt-1">{platformConfig.backup.backupSize}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="limits">Limits</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">General Configuration</CardTitle>
              <CardDescription>Basic platform settings and configuration</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      defaultValue={platformConfig.general.siteName}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input
                      id="siteUrl"
                      defaultValue={platformConfig.general.siteUrl}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      defaultValue={platformConfig.general.adminEmail}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      defaultValue={platformConfig.general.supportEmail}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select defaultValue={platformConfig.general.timezone} onValueChange={handleConfigChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Toronto">America/Toronto (EST)</SelectItem>
                        <SelectItem value="America/Vancouver">America/Vancouver (PST)</SelectItem>
                        <SelectItem value="America/Edmonton">America/Edmonton (MST)</SelectItem>
                        <SelectItem value="America/Halifax">America/Halifax (AST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Default Language</Label>
                    <Select defaultValue={platformConfig.general.language} onValueChange={handleConfigChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-gray-600">Temporarily disable site access</p>
                      </div>
                      <Switch
                        checked={platformConfig.general.maintenanceMode}
                        onCheckedChange={handleConfigChange}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>User Registration</Label>
                        <p className="text-sm text-gray-600">Allow new user signups</p>
                      </div>
                      <Switch
                        checked={platformConfig.general.registrationEnabled}
                        onCheckedChange={handleConfigChange}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Verification</Label>
                        <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                      </div>
                      <Switch
                        checked={platformConfig.general.emailVerificationRequired}
                        onCheckedChange={handleConfigChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">Feature Management</CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Core Features</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Job Posting</Label>
                      <p className="text-sm text-gray-600">Allow employers to post jobs</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.jobPosting}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Resume Builder</Label>
                      <p className="text-sm text-gray-600">Built-in resume creation tool</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.resumeBuilder}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Messaging System</Label>
                      <p className="text-sm text-gray-600">Direct communication between users</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.messaging}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Video Interviews</Label>
                      <p className="text-sm text-gray-600">Integrated video interview platform</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.videoInterviews}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Guest Job Search</Label>
                      <p className="text-sm text-gray-600">Allow job browsing without registration</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.guestJobSearch}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Advanced Features</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>AI Job Matching</Label>
                      <p className="text-sm text-gray-600">AI-powered job recommendations</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.aiJobMatching}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Advanced Analytics</Label>
                      <p className="text-sm text-gray-600">Detailed user and job analytics</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.advancedAnalytics}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Mobile App</Label>
                      <p className="text-sm text-gray-600">Native mobile applications</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.mobileApp}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Social Login</Label>
                      <p className="text-sm text-gray-600">Login with social media accounts</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.socialLogin}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Enhanced account security</p>
                    </div>
                    <Switch
                      checked={platformConfig.features.twoFactorAuth}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Third-party Integrations</CardTitle>
                  <CardDescription>Manage API keys and external service connections</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setShowApiKeyDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {integrationKeys.map((integration) => (
                  <div key={integration.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {integration.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-600">{integration.service}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusBadge status={integration.status} />
                            {integration.warning && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                                {integration.warning}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">Last verified</p>
                          <p className="font-medium">{integration.lastVerified}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setShowApiKeyDialog(true);
                            }}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Endpoint: <code className="bg-gray-100 px-1 rounded">{integration.endpoint}</code></p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">Security Configuration</CardTitle>
              <CardDescription>Manage security policies and protection settings</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Network Security</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Force HTTPS</Label>
                      <p className="text-sm text-gray-600">Redirect all HTTP traffic to HTTPS</p>
                    </div>
                    <Switch
                      checked={platformConfig.security.forceHttps}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>CORS Protection</Label>
                      <p className="text-sm text-gray-600">Cross-Origin Resource Sharing controls</p>
                    </div>
                    <Switch
                      checked={platformConfig.security.corsEnabled}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rate Limiting</Label>
                      <p className="text-sm text-gray-600">Limit API requests per user/IP</p>
                    </div>
                    <Switch
                      checked={platformConfig.security.rateLimiting}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IP Whitelist</Label>
                      <p className="text-sm text-gray-600">Restrict access to specific IPs</p>
                    </div>
                    <Switch
                      checked={platformConfig.security.ipWhitelist}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Application Security</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Brute Force Protection</Label>
                      <p className="text-sm text-gray-600">Prevent password brute force attacks</p>
                    </div>
                    <Switch
                      checked={platformConfig.security.bruteForceProtection}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Content Security Policy</Label>
                      <p className="text-sm text-gray-600">CSP headers for XSS protection</p>
                    </div>
                    <Switch
                      checked={platformConfig.security.contentSecurityPolicy}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SQL Injection Protection</Label>
                      <p className="text-sm text-gray-600">Parameterized queries and validation</p>
                    </div>
                    <Switch
                      checked={platformConfig.security.sqlInjectionProtection}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>XSS Protection</Label>
                      <p className="text-sm text-gray-600">Cross-site scripting prevention</p>
                    </div>
                    <Switch
                      checked={platformConfig.security.xssProtection}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-semibold">System Limits & Quotas</CardTitle>
              <CardDescription>Configure operational limits and resource quotas</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Content Limits</h3>
                  
                  <div>
                    <Label htmlFor="jobPostDuration">Max Job Post Duration (days)</Label>
                    <Input
                      id="jobPostDuration"
                      type="number"
                      defaultValue={platformConfig.limits.maxJobPostDuration}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="resumeFileSize">Max Resume File Size (MB)</Label>
                    <Input
                      id="resumeFileSize"
                      type="number"
                      defaultValue={platformConfig.limits.maxResumeFileSize}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyLogo">Max Company Logo Size (MB)</Label>
                    <Input
                      id="companyLogo"
                      type="number"
                      defaultValue={platformConfig.limits.maxCompanyLogo}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="profileImage">Max Profile Image Size (MB)</Label>
                    <Input
                      id="profileImage"
                      type="number"
                      defaultValue={platformConfig.limits.maxProfileImage}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">System Quotas</h3>

                  <div>
                    <Label htmlFor="dailyEmailLimit">Daily Email Limit</Label>
                    <Input
                      id="dailyEmailLimit"
                      type="number"
                      defaultValue={platformConfig.limits.dailyEmailLimit}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxSearchResults">Max Search Results</Label>
                    <Input
                      id="maxSearchResults"
                      type="number"
                      defaultValue={platformConfig.limits.maxSearchResults}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      defaultValue={platformConfig.limits.sessionTimeout}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="passwordMinLength">Min Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      defaultValue={platformConfig.limits.passwordMinLength}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Backup Configuration</CardTitle>
                  <CardDescription>Automated backup settings and manual backup controls</CardDescription>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Run Backup Now
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Backup Settings</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backup</Label>
                      <p className="text-sm text-gray-600">Enable scheduled backups</p>
                    </div>
                    <Switch
                      checked={platformConfig.backup.autoBackup}
                      onCheckedChange={handleConfigChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select defaultValue={platformConfig.backup.backupFrequency} onValueChange={handleConfigChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="retentionDays">Retention Period (days)</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      defaultValue={platformConfig.backup.retentionDays}
                      onChange={handleConfigChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="storageLocation">Storage Location</Label>
                    <Input
                      id="storageLocation"
                      defaultValue={platformConfig.backup.storageLocation}
                      onChange={handleConfigChange}
                      className="mt-1"
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Backup Status</h3>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                      <CheckCircle className="h-4 w-4" />
                      Last Backup Successful
                    </div>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Time: {platformConfig.backup.lastBackup}</p>
                      <p>Size: {platformConfig.backup.backupSize}</p>
                      <p>Location: {platformConfig.backup.storageLocation}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Download Latest Backup
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Restore from Backup
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      View Backup History
                    </Button>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clean Old Backups
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clean Old Backups</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete backups older than the retention period. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Delete Old Backups
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Key Management Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration ? `Edit ${selectedIntegration.name} Integration` : "Add New Integration"}
            </DialogTitle>
            <DialogDescription>
              Configure API credentials and connection settings for external services.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                defaultValue={selectedIntegration?.name || ""}
                placeholder="e.g., SendGrid, Stripe, AWS S3"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Select defaultValue={selectedIntegration?.service || ""}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email Service">Email Service</SelectItem>
                  <SelectItem value="Payment Processing">Payment Processing</SelectItem>
                  <SelectItem value="File Storage">File Storage</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Authentication">Authentication</SelectItem>
                  <SelectItem value="Monitoring">Monitoring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="apiEndpoint">API Endpoint</Label>
              <Input
                id="apiEndpoint"
                defaultValue={selectedIntegration?.endpoint || ""}
                placeholder="https://api.example.com/v1/"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <div className="relative mt-1">
                <Input
                  id="apiKey"
                  type={showApiKey[selectedIntegration?.id || "new"] ? "text" : "password"}
                  placeholder={selectedIntegration ? "••••••••••••••••" : "Enter API key"}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiKey(prev => ({
                    ...prev,
                    [selectedIntegration?.id || "new"]: !prev[selectedIntegration?.id || "new"]
                  }))}
                >
                  {showApiKey[selectedIntegration?.id || "new"] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional configuration notes..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowApiKeyDialog(false)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Connection
            </Button>
            <Button onClick={() => setShowApiKeyDialog(false)} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}