"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Users,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  MapPin,
  Calendar,
  Eye,
  UserPlus,
  Building2,
} from "lucide-react";

// Mock data for demonstration
const mockStats = {
  totalUsers: 12450,
  totalEmployers: 850,
  totalJobSeekers: 11600,
  activeJobs: 1234,
  totalApplications: 8950,
  monthlyRevenue: 45800,
  dailyActiveUsers: 2340,
  newRegistrations: 156,
};

const userGrowthData = [
  { month: 'Jan', jobSeekers: 8500, employers: 650, applications: 5200 },
  { month: 'Feb', jobSeekers: 9200, employers: 680, applications: 5800 },
  { month: 'Mar', jobSeekers: 9800, employers: 720, applications: 6400 },
  { month: 'Apr', jobSeekers: 10400, employers: 750, applications: 7100 },
  { month: 'May', jobSeekers: 11000, employers: 800, applications: 7800 },
  { month: 'Jun', jobSeekers: 11600, employers: 850, applications: 8950 },
];

const jobCategoryData = [
  { name: 'Technology', value: 35, color: '#02243b' },
  { name: 'Healthcare', value: 20, color: '#8a4b04' },
  { name: 'Finance', value: 15, color: '#10b981' },
  { name: 'Marketing', value: 12, color: '#f59e0b' },
  { name: 'Education', value: 8, color: '#ef4444' },
  { name: 'Others', value: 10, color: '#6b7280' },
];

const revenueData = [
  { month: 'Jan', revenue: 32000, subscriptions: 180 },
  { month: 'Feb', revenue: 35000, subscriptions: 195 },
  { month: 'Mar', revenue: 38000, subscriptions: 210 },
  { month: 'Apr', revenue: 41000, subscriptions: 225 },
  { month: 'May', revenue: 43000, subscriptions: 240 },
  { month: 'Jun', revenue: 45800, subscriptions: 265 },
];

const geoData = [
  { province: 'Ontario', users: 4200, percentage: 34 },
  { province: 'Quebec', users: 2800, percentage: 22 },
  { province: 'British Columbia', users: 2100, percentage: 17 },
  { province: 'Alberta', users: 1600, percentage: 13 },
  { province: 'Manitoba', users: 800, percentage: 6 },
  { province: 'Others', users: 950, percentage: 8 },
];

const recentActivities = [
  {
    id: 1,
    type: 'user_registration',
    message: 'Sarah Johnson registered as a job seeker',
    timestamp: '2 minutes ago',
    severity: 'info',
  },
  {
    id: 2,
    type: 'job_posted',
    message: 'TechCorp posted "Senior Developer" position',
    timestamp: '5 minutes ago',
    severity: 'success',
  },
  {
    id: 3,
    type: 'flagged_content',
    message: 'Job post flagged for review',
    timestamp: '12 minutes ago',
    severity: 'warning',
  },
  {
    id: 4,
    type: 'payment_received',
    message: 'Premium subscription payment received',
    timestamp: '18 minutes ago',
    severity: 'success',
  },
  {
    id: 5,
    type: 'application_submitted',
    message: '15 new applications submitted',
    timestamp: '25 minutes ago',
    severity: 'info',
  },
];

export function OverviewDashboard() {
  const [dateRange, setDateRange] = useState('30d');

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color }}>{value}</div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          {changeType === 'positive' ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
            {change}
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 days
          </Button>
          <Button 
            size="sm" 
            style={{ backgroundColor: 'var(--admin-primary)', color: 'white' }}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={mockStats.totalUsers.toLocaleString()}
          change="+12.3%"
          changeType="positive"
          icon={Users}
          color="var(--admin-primary)"
        />
        <StatCard
          title="Active Jobs"
          value={mockStats.activeJobs.toLocaleString()}
          change="+8.7%"
          changeType="positive"
          icon={Briefcase}
          color="var(--admin-secondary)"
        />
        <StatCard
          title="Applications"
          value={mockStats.totalApplications.toLocaleString()}
          change="+15.2%"
          changeType="positive"
          icon={FileText}
          color="#10b981"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(mockStats.monthlyRevenue / 1000).toFixed(1)}k`}
          change="+6.5%"
          changeType="positive"
          icon={DollarSign}
          color="#f59e0b"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
            <CardDescription>Monthly growth in job seekers and employers</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="jobSeekers" 
                  stackId="1" 
                  stroke="var(--admin-primary)" 
                  fill="var(--admin-primary)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="employers" 
                  stackId="1" 
                  stroke="var(--admin-secondary)" 
                  fill="var(--admin-secondary)"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Job Categories Distribution</CardTitle>
            <CardDescription>Current job postings by industry</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                >
                  {jobCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Geography Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Subscriptions</CardTitle>
            <CardDescription>Monthly revenue and subscription growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar 
                  yAxisId="right"
                  dataKey="subscriptions" 
                  fill="var(--admin-accent-500)"
                  opacity={0.3}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--admin-primary)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--admin-primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Users by province</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geoData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium">{item.province}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${item.percentage * 2}px`,
                        backgroundColor: 'var(--admin-primary)',
                        opacity: 0.7
                      }}
                    />
                    <span className="text-xs text-gray-500 w-8">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <div 
                    className={`h-2 w-2 rounded-full mt-2 ${
                      activity.severity === 'success' ? 'bg-green-500' :
                      activity.severity === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Activity className="h-4 w-4 mr-2" />
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                style={{ borderColor: 'var(--admin-primary)', color: 'var(--admin-primary)' }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Admin
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                style={{ borderColor: 'var(--admin-secondary)', color: 'var(--admin-secondary)' }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Verify Employer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Review Flagged Content
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Globe className="h-4 w-4 mr-2" />
                Platform Settings
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <h4 className="font-semibold text-sm text-gray-900">System Health</h4>
              <p className="text-xs text-gray-600 mt-1">All systems operational</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500">99.9% uptime</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}